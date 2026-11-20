import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import Order from '@/models/order'
import Customer from '@/models/customer'
import Credit from '@/models/credit'
import Product from '@/models/product'
import Payment from '@/models/payments'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getStoreBySlug } from '@/lib/getStoreBySlug'
import { requireStoreRole } from '@/lib/requireStoreRole'
import withTransaction from '@/lib/withTransaction'
import validateCheckout from '@/lib/checkout'
import { buildOrderItemSnapshots } from '@/lib/orderItemSnapshot'
import { reserveStockForSale, attachTransactionsToOrder } from '@/lib/inventoryService'
import StoreSettings from '@/models/storeSettings'
import WalletTransaction from '@/models/walletTransaction'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, customerId, cartItems, bDate, paymentAmount = 0, paymentMethod = 'CASH', otherPaymentMethod, bankName, reference, deliveryEnabled = false, deliveryCost = 0, serviceChargeEnabled = false, serviceChargeCost = 0, allowDecimalQuantity = false } = await req.json()
    const normalizedPaymentAmount = Number(paymentAmount || 0)

    if (!slug || !customerId || !cartItems || !cartItems.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(normalizedPaymentAmount) || normalizedPaymentAmount < 0) {
      return NextResponse.json({ error: 'Payment amount must be a non-negative number' }, { status: 400 })
    }

    await connectDB()

    // Verify store access
    const store = await getStoreBySlug(slug)
    try {
      await requireStoreRole(session.user.id, store._id, ['OWNER', 'MANAGER', 'CASHIER'])
    } catch (e) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify customer exists and belongs to store
    const customer = await Customer.findOne({
      _id: customerId,
      storeId: store._id,
      isDeleted: false
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const settings = await StoreSettings.findOne({ slug }).lean()
    let deliveryAmount = 0
    if ((deliveryEnabled === true || deliveryEnabled === 'true') && settings?.deliveryEnabled) {
      deliveryAmount = Number(deliveryCost || 0)
      if (!Number.isFinite(deliveryAmount) || deliveryAmount < 0) {
        return NextResponse.json({ error: 'Delivery cost must be a non-negative number' }, { status: 400 })
      }
    }
    let serviceChargeAmount = 0
    if ((serviceChargeEnabled === true || serviceChargeEnabled === 'true') && !settings?.serviceChargeEnabled) {
      return NextResponse.json({ error: 'Service charge is disabled in store settings' }, { status: 400 })
    }
    if ((serviceChargeEnabled === true || serviceChargeEnabled === 'true') && settings?.serviceChargeEnabled) {
      serviceChargeAmount = Number(serviceChargeCost || 0)
      if (!Number.isFinite(serviceChargeAmount) || serviceChargeAmount < 0) {
        return NextResponse.json({ error: 'Service charge must be a non-negative number' }, { status: 400 })
      }
    }
    if (paymentMethod === 'OTHER' && !(settings?.otherPaymentMethods || []).includes(String(otherPaymentMethod || '').trim())) return NextResponse.json({ error: 'Invalid or missing Other payment method' }, { status: 400 })
    if (paymentMethod === 'TRANSFER' && (!(settings?.bankNames || []).includes(String(bankName || '').trim()) || !String(reference || '').trim())) return NextResponse.json({ error: 'Invalid or missing transfer bank/reference' }, { status: 400 })
    if (paymentMethod === 'WALLET' && normalizedPaymentAmount > Number(customer.walletBalance || 0)) return NextResponse.json({ error: 'Payment amount exceeds customer wallet balance' }, { status: 400 })

    // Validate cart items
    try {
      await validateCheckout(cartItems, slug, { allowDecimalQuantity: allowDecimalQuantity === true })
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Process credit sale in transaction
    const result = await withTransaction(async (transactionSession) => {
      const soldBy = session.user.email
      const ids = cartItems.map(i => i.product)
      const { updatedProducts, transactionIds } = await reserveStockForSale({
        slug,
        items: cartItems,
        soldBy,
        session: transactionSession,
        orderId: null,
      })

      const {
        orderItems,
        totalAmount,
        totalProfit,
      } = buildOrderItemSnapshots(cartItems, updatedProducts, { allowDecimalQuantity: allowDecimalQuantity === true })
      const finalOrderAmount = totalAmount + deliveryAmount + serviceChargeAmount

      // Generate order number
      const orderCount = await Order.countDocuments({ slug })
      const orderNum = slug.substring(0, 3).toUpperCase() + (orderCount + 1)

      // Generate receipt number for payment if any
      let receiptNumber = null
      if (normalizedPaymentAmount > 0) {
        const paymentCount = await Payment.countDocuments({ storeId: store._id })
        receiptNumber = `RCP-${slug.toUpperCase()}-${paymentCount + 1}`
      }

      // Determine order status based on payment
      if (normalizedPaymentAmount > finalOrderAmount) {
        throw Object.assign(new Error('Payment amount exceeds order total'), { code: 'BAD_PAYMENT' })
      }
      const actualCreditAmount = Math.max(0, finalOrderAmount - normalizedPaymentAmount)
      const isPaidInFull = normalizedPaymentAmount >= finalOrderAmount
      const orderStatus = isPaidInFull ? 'Paid' : (normalizedPaymentAmount > 0 ? 'Partial' : 'Credit')

      // Create order with cost and profit stored
      const newOrder = new Order({
        slug,
        orderNum,
        orderName: customer.name,
        items: orderItems,
        amount: totalAmount,
        totalAmount: finalOrderAmount,
        deliveryCost: deliveryAmount,
        serviceChargeCost: serviceChargeAmount,
        profit: totalProfit,
        amountPaid: normalizedPaymentAmount,
        bal: actualCreditAmount,
        bDate,
        soldBy,
        status: orderStatus,
        isCompleted: isPaidInFull,
      })
      await newOrder.save({ session: transactionSession })

      // Update inventory transactions with order ID
      await attachTransactionsToOrder(transactionIds, newOrder._id, transactionSession)

      // If partial payment is made, create payment record
      if (normalizedPaymentAmount > 0) {
        const paymentRecord = new Payment({
          storeId: store._id,
          orderId: newOrder._id,
          orderNum,
          receiptNumber,
          bDate,
          orderAmount: finalOrderAmount,
          deliveryCost: deliveryAmount,
          serviceChargeCost: serviceChargeAmount,
          amountPaid: normalizedPaymentAmount,
          paymentMethods: [
            {
              method: paymentMethod || 'CASH',
              amount: normalizedPaymentAmount,
              details: String(otherPaymentMethod || '').trim() || undefined,
              bankName: String(bankName || '').trim() || undefined,
              reference: String(reference || '').trim() || undefined
            }
          ],
          recordedBy: soldBy,
        })
        await paymentRecord.save({ session: transactionSession })
      }

      if (normalizedPaymentAmount > 0 && paymentMethod === 'WALLET') {
        const walletCustomer = await Customer.findById(customerId).session(transactionSession)
        const walletBalanceBefore = Number(walletCustomer?.walletBalance || 0)
        walletCustomer.walletBalance = walletBalanceBefore - normalizedPaymentAmount
        await walletCustomer.save({ session: transactionSession })
        await new WalletTransaction({
          customer: walletCustomer._id,
          invoice: orderNum,
          type: 'Sale',
          amount: normalizedPaymentAmount,
          balanceBefore: walletBalanceBefore,
          balanceAfter: walletCustomer.walletBalance,
          paymentMethod: 'WALLET',
          reference: receiptNumber || `credit-sale-${orderNum}`,
          remarks: `Wallet used for POS credit sale ${orderNum}`,
          createdBy: soldBy,
          createdAt: new Date(),
        }).save({ session: transactionSession })
      }

      // Create credit record only if there's remaining balance
      let newCredit = null
      if (actualCreditAmount > 0) {
        newCredit = new Credit({
          storeId: store._id,
          customerId: customer._id,
          orderId: newOrder._id,
          amount: actualCreditAmount,
          bDate: new Date(),
          soldBy,
          isPaid: false,
          isCancelled: false,
        })
        await newCredit.save({ session: transactionSession })
      }

      // Update customer total purchases, spent, and outstanding balance
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            totalPurchases: 1,
            totalSpent: totalAmount,
            outstandingBalance: actualCreditAmount
          }
        },
        { session: transactionSession }
      )

      return {
        success: true,
        orderId: newOrder._id,
        orderNum,
        creditId: newCredit?._id,
        receiptNumber,
        paymentMethod,
        otherPaymentMethod: String(otherPaymentMethod || '').trim() || null,
        bankName: String(bankName || '').trim() || null,
        reference: String(reference || '').trim() || null,
        totalAmount: finalOrderAmount,
        deliveryCost: deliveryAmount,
        serviceChargeCost: serviceChargeAmount,
        paymentAmount: normalizedPaymentAmount,
        creditAmount: actualCreditAmount,
        items: orderItems,
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          outstandingBalance: Number(customer.outstandingBalance || 0) + Number(actualCreditAmount || 0),
          walletBalance: Number(customer.walletBalance || 0),
        },
        outstandingBalance: Number(customer.outstandingBalance || 0) + Number(actualCreditAmount || 0),
        walletBalance: Number(customer.walletBalance || 0),
      }
    })

    return NextResponse.json({
      success: true,
      message: normalizedPaymentAmount > 0
        ? `Payment of ${normalizedPaymentAmount} received. Credit of ${result.creditAmount} recorded.`
        : 'Credit sale completed successfully',
      ...result
    })

  } catch (error) {
    console.error('Credit sale error:', error)
    
    // Handle insufficient stock error
    if (error && error.code === 'INSUFFICIENT') {
      const { cartItems } = await req.json()
      const ids = cartItems.map(i => i.product)
      const prods = await Product.find({ _id: { $in: ids } }).lean()
      const stockUpdates = prods.map(p => ({ product: p._id, qty: p.qty || 0 }))
      
      return NextResponse.json(
        { error: error.message, stockUpdates },
        { status: 400 }
      )
    }
    if (error && error.code === 'BAD_PAYMENT') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process credit sale' },
      { status: 500 }
    )
  }
}
