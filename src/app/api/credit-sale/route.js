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

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, customerId, cartItems, bDate, paymentAmount = 0, creditAmount, paymentMethod = 'CASH' } = await req.json()

    if (!slug || !customerId || !cartItems || !cartItems.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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

    // Validate cart items
    try {
      await validateCheckout(cartItems, slug)
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
      } = buildOrderItemSnapshots(cartItems, updatedProducts)

      // Generate order number
      const orderCount = await Order.countDocuments({ slug })
      const orderNum = slug.substring(0, 3).toUpperCase() + (orderCount + 1)

      // Generate receipt number for payment if any
      let receiptNumber = null
      if (paymentAmount > 0) {
        const paymentCount = await Payment.countDocuments({ storeId: store._id })
        receiptNumber = `RCP-${slug.toUpperCase()}-${paymentCount + 1}`
      }

      // Determine order status based on payment
      const actualCreditAmount = creditAmount || (totalAmount - paymentAmount)
      const isPaidInFull = paymentAmount >= totalAmount
      const orderStatus = isPaidInFull ? 'Paid' : (paymentAmount > 0 ? 'Partial' : 'Credit')

      // Create order with cost and profit stored
      const newOrder = new Order({
        slug,
        orderNum,
        orderName: customer.name,
        items: orderItems,
        amount: totalAmount,
        totalAmount: totalAmount, // Add totalAmount for consistency with other order endpoints
        profit: totalProfit,
        amountPaid: paymentAmount,
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
      if (paymentAmount > 0) {
        const paymentRecord = new Payment({
          storeId: store._id,
          orderId: newOrder._id,
          orderNum,
          receiptNumber,
          bDate,
          orderAmount: totalAmount,
          amountPaid: paymentAmount,
          paymentMethods: [
            {
              method: paymentMethod || 'CASH',
              amount: paymentAmount
            }
          ],
          recordedBy: soldBy,
        })
        await paymentRecord.save({ session: transactionSession })
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
        totalAmount,
        paymentAmount,
        creditAmount: actualCreditAmount,
        items: orderItems,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: paymentAmount > 0 
        ? `Payment of ${paymentAmount} received. Credit of ${result.creditAmount} recorded.`
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

    return NextResponse.json(
      { error: error.message || 'Failed to process credit sale' },
      { status: 500 }
    )
  }
}
