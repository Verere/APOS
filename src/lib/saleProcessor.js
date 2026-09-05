import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectToDB from '@/utils/connectDB'
import Order from '@/models/order'
import Payment from '@/models/payments'
import Customer from '@/models/customer'
import WalletTransaction from '@/models/walletTransaction'
import Complimentary from '@/models/complimentary'
import Product from '@/models/product'
import validateCheckout from '@/lib/checkout'
import withTransaction from '@/lib/withTransaction'
import { reserveStockForSale, attachTransactionsToOrder } from '@/lib/inventoryService'
import { buildOrderItemSnapshots } from '@/lib/orderItemSnapshot'
import { getStoreBySlug } from '@/lib/getStoreBySlug'
import StoreSettings from '@/models/storeSettings'
import BusinessDateAudit from '@/models/businessDateAudit'
import { resolveBusinessDate } from '@/lib/businessDatePolicy'

export async function processSale({
  slug,
  user,
  bDate,
  businessDateReason,
  path,
  cartItems,
  amountPaid,
  mop,
  orderAmount,
  cashPaid,
  posPaid,
  transferPaid,
  transferBank,
  transferReference,
  otherPaid,
  otherPaymentMethod,
  walletPaid,
  customerId,
  customerName,
  isComplimentary,
  transactionType,
  approvedBy,
  reason,
  remarks,
  location,
  allowDecimalQuantity,
  deliveryEnabled,
  deliveryCost,
  submissionId,
  transactionId,
  deviceId,
  session,
  skipRevalidate = false,
}) {
  const effectiveSession = session || (await getServerSession(authOptions))
  if (!effectiveSession || !effectiveSession.user) {
    return { error: 'Unauthorized' }
  }

  try {
    await connectToDB()

    const items = cartItems ? JSON.parse(cartItems) : []
    const complimentarySale = transactionType === 'COMPLIMENTARY' || isComplimentary === 'true'
    const soldBy = effectiveSession.user.name || user

    if (!items.length) return { error: 'Cart is empty' }

    if (complimentarySale) {
      if (!String(approvedBy || '').trim()) return { error: 'approvedBy is required for complimentary transactions' }
      if (!String(reason || '').trim()) return { error: 'reason is required for complimentary transactions' }
    }

    try {
      await validateCheckout(items, slug, { allowDecimalQuantity: allowDecimalQuantity === 'true' })
    } catch (err) {
      return { error: err.message }
    }

    const store = await getStoreBySlug(slug)
    const storeSettings = await StoreSettings.findOne({ slug }).lean()
    const businessDatePolicy = resolveBusinessDate({
      requestedDate: bDate,
      enableBusinessDate: Boolean(storeSettings?.enableBusinessDate),
      businessDateReason,
    })
    if (businessDatePolicy?.error) return { error: businessDatePolicy.error }
    const effectiveBusinessDate = businessDatePolicy.businessDate
    const effectiveBusinessDateReason = businessDatePolicy.businessDateReason

    try {
      const result = await withTransaction(async (databaseSession) => {
        const ids = items.map((item) => item.product)
        const { updatedProducts, transactionIds } = await reserveStockForSale({
          slug,
          items,
          soldBy,
          session: databaseSession,
          orderId: null,
        })

        const num = (await Order.countDocuments({ slug })) + 1
        const orderNum = slug.substring(0, 3).toUpperCase() + num
        const newOrder = new Order({
          slug,
          orderNum,
          soldBy,
          bDate: effectiveBusinessDate,
          transactionId: transactionId || submissionId || deviceId || `offline-${Date.now()}`,
          ...(customerId && { customerId }),
          ...(customerName && { customerName }),
          orderName: customerName || customerId || orderNum,
        })
        await newOrder.save({ session: databaseSession })

        const {
          orderItems: itemsWithCostProfit,
          totalAmount: computedOrderAmount,
          totalProfit: computedOrderProfit,
        } = buildOrderItemSnapshots(items, updatedProducts, { complimentary: complimentarySale, allowDecimalQuantity: allowDecimalQuantity === 'true' })

        const totalOrderAmount = complimentarySale ? 0 : computedOrderAmount
        let deliveryAmount = 0
        if (!complimentarySale && (deliveryEnabled === 'true' || deliveryEnabled === true) && storeSettings?.deliveryEnabled) {
          if (customerId) {
            const deliveryCustomer = await Customer.findOne({ _id: customerId, storeId: store._id, isDeleted: false }).session(databaseSession).lean()
            if (!deliveryCustomer) throw Object.assign(new Error('Customer not found for delivery'), { code: 'BAD_DELIVERY' })
            deliveryAmount = Math.max(0, Number(deliveryCustomer.deliveryCost || 0))
          } else {
            deliveryAmount = Number(deliveryCost || 0)
            if (!Number.isFinite(deliveryAmount) || deliveryAmount < 0) {
              throw Object.assign(new Error('Delivery cost must be a non-negative number'), { code: 'BAD_DELIVERY' })
            }
          }
        }
        const finalOrderAmount = totalOrderAmount + deliveryAmount
        const totalOrderProfit = complimentarySale ? 0 : computedOrderProfit
        const paid = Number(amountPaid || 0)
        const walletAmount = complimentarySale ? 0 : Number(walletPaid || 0)

        if (walletAmount < 0) {
          throw Object.assign(new Error('Wallet amount cannot be negative'), { code: 'BAD_WALLET' })
        }
        if (walletAmount > finalOrderAmount) {
          throw Object.assign(new Error('Wallet amount cannot exceed order total'), { code: 'BAD_WALLET' })
        }
        if (walletAmount > paid) {
          throw Object.assign(new Error('Wallet amount cannot exceed total paid amount'), { code: 'BAD_WALLET' })
        }

        let walletBalanceBefore = 0
        let walletCustomer = null
        if (walletAmount > 0) {
          if (!customerId) {
            throw Object.assign(new Error('A registered customer is required to use wallet payment'), { code: 'BAD_WALLET' })
          }

          walletCustomer = await Customer.findById(customerId).session(databaseSession)
          if (!walletCustomer || walletCustomer.isDeleted) {
            throw Object.assign(new Error('Customer not found for wallet payment'), { code: 'BAD_WALLET' })
          }

          walletBalanceBefore = Number(walletCustomer.walletBalance || 0)
          if (walletAmount > walletBalanceBefore) {
            throw Object.assign(new Error('Wallet amount exceeds customer wallet balance'), { code: 'BAD_WALLET' })
          }
        }

        if (paid > finalOrderAmount) {
          throw Object.assign(new Error('Payment amount exceeds order total based on checkout snapshot prices'), { code: 'BAD_PAYMENT' })
        }

        newOrder.items = itemsWithCostProfit
        newOrder.amount = finalOrderAmount
        newOrder.totalAmount = finalOrderAmount
        newOrder.deliveryCost = deliveryAmount
        newOrder.profit = totalOrderProfit
        newOrder.status = 'Completed'
        newOrder.isCompleted = true
        newOrder.bDate = effectiveBusinessDate
        newOrder.transactionType = complimentarySale ? 'COMPLIMENTARY' : 'STANDARD'
        newOrder.approvedBy = complimentarySale ? String(approvedBy).trim() : undefined
        newOrder.reason = complimentarySale ? String(reason).trim() : undefined
        newOrder.remarks = complimentarySale ? String(remarks || '').trim() : undefined
        newOrder.transactionId = transactionId || submissionId || deviceId || newOrder.transactionId
        await newOrder.save({ session: databaseSession })

        await attachTransactionsToOrder(transactionIds, newOrder._id, databaseSession)

        const paymentMethodsArray = []
        const methods = (mop || '').split(',').filter(Boolean)
        const normalizedOtherPaymentMethod = String(otherPaymentMethod || '').trim()
        if (!complimentarySale && methods.includes('OTHER')) {
          if (!normalizedOtherPaymentMethod || !(storeSettings?.otherPaymentMethods || []).includes(normalizedOtherPaymentMethod)) {
            throw Object.assign(new Error('Invalid or missing Other payment method'), { code: 'BAD_PAYMENT' })
          }
        }
        const normalizedTransferBank = String(transferBank || '').trim()
        const normalizedTransferReference = String(transferReference || '').trim()
        if (!complimentarySale && methods.includes('TRANSFER')) {
          if (!normalizedTransferBank || !(storeSettings?.bankNames || []).includes(normalizedTransferBank) || !normalizedTransferReference) {
            throw Object.assign(new Error('Invalid or missing transfer bank/reference'), { code: 'BAD_PAYMENT' })
          }
        }
        if (walletAmount > 0 && !methods.includes('WALLET')) {
          methods.push('WALLET')
        }

        if (complimentarySale) {
          paymentMethodsArray.push({ method: 'COMPLIMENTARY', amount: 0 })
        } else {
          if (methods.includes('CASH') && Number(cashPaid || 0) > 0) {
            paymentMethodsArray.push({ method: 'CASH', amount: Number(cashPaid) })
          }
          if (methods.includes('POS') && Number(posPaid || 0) > 0) {
            paymentMethodsArray.push({ method: 'POS', amount: Number(posPaid) })
          }
          if (methods.includes('TRANSFER') && Number(transferPaid || 0) > 0) {
            paymentMethodsArray.push({ method: 'TRANSFER', amount: Number(transferPaid), bankName: normalizedTransferBank, reference: normalizedTransferReference })
          }
          if (methods.includes('OTHER') && Number(otherPaid || 0) > 0) {
            paymentMethodsArray.push({ method: 'OTHER', amount: Number(otherPaid), details: normalizedOtherPaymentMethod })
          }
          if (walletAmount > 0) {
            paymentMethodsArray.push({ method: 'WALLET', amount: walletAmount })
          }
          if (paymentMethodsArray.length === 0) {
            paymentMethodsArray.push({ method: 'CASH', amount: Number(amountPaid || 0) })
          }
        }

        if (!store || !store._id) {
          throw new Error('Store ID is required')
        }

        if (!orderNum) {
          throw new Error('Order number is required')
        }

        if (!soldBy) {
          throw new Error('Recorded by is required')
        }

        const newPay = new Payment({
          storeId: store._id,
          slug,
          orderId: newOrder._id,
          orderNum,
          receiptNumber: orderNum,
          paymentMethods: paymentMethodsArray,
          orderAmount: finalOrderAmount,
          amountPaid: complimentarySale ? 0 : Number(amountPaid || 0),
          balance: complimentarySale ? 0 : 0,
          change: complimentarySale ? 0 : Math.max(0, Number(amountPaid || 0) - finalOrderAmount),
          status: 'COMPLETED',
          paymentType: complimentarySale ? 'COMPLIMENTARY' : 'FULL',
          transactionType: complimentarySale ? 'COMPLIMENTARY' : 'STANDARD',
          approvedBy: complimentarySale ? String(approvedBy).trim() : undefined,
          reason: complimentarySale ? String(reason).trim() : undefined,
          remarks: complimentarySale ? String(remarks || '').trim() : undefined,
          recordedBy: soldBy,
          user: soldBy,
          bDate: effectiveBusinessDate,
          cash: Number(cashPaid || 0),
          pos: Number(posPaid || 0),
          transfer: Number(transferPaid || 0),
          ...(complimentarySale && { notes: 'Complimentary sale' }),
          ...(customerId && { customerId }),
          ...(customerName && { customerName }),
          customerType: customerId ? 'REGISTERED' : 'WALK_IN',
          transactionId: transactionId || submissionId || deviceId || `offline-${Date.now()}`,
        })
        await newPay.save({ session: databaseSession })

        if (businessDatePolicy.isBackdated) {
          await new BusinessDateAudit({
            storeId: store._id,
            slug,
            actorUserId: String(effectiveSession.user.id || ''),
            actorName: soldBy,
            businessDate: effectiveBusinessDate,
            systemDate: businessDatePolicy.systemDate,
            reason: effectiveBusinessDateReason,
            source: 'OFFLINE_SYNC',
            orderId: newOrder._id,
            orderNum,
            transactionId: String(transactionId || submissionId || deviceId || ''),
          }).save({ session: databaseSession })
        }

        if (walletAmount > 0 && walletCustomer) {
          const walletBalanceAfter = walletBalanceBefore - walletAmount
          walletCustomer.walletBalance = walletBalanceAfter
          await walletCustomer.save({ session: databaseSession })

          await new WalletTransaction({
            customer: walletCustomer._id,
            invoice: orderNum,
            type: 'Sale',
            amount: walletAmount,
            balanceBefore: walletBalanceBefore,
            balanceAfter: walletBalanceAfter,
            paymentMethod: 'WALLET',
            reference: `${orderNum}-wallet`,
            remarks: `Wallet used for checkout order ${orderNum}`,
            createdBy: soldBy,
            createdAt: new Date(),
          }).save({ session: databaseSession })
        }

        if (complimentarySale) {
          await new Complimentary({
            hotelId: store._id,
            orderName: customerName || customerId || orderNum,
            orderNum,
            location: location || '',
            amount: 0,
            bDate: new Date(),
            transactionType: 'COMPLIMENTARY',
            approvedBy: String(approvedBy).trim(),
            reason: String(reason).trim(),
            remarks: String(remarks || '').trim(),
            authorizedBy: String(approvedBy).trim(),
            soldBy,
          }).save({ session: databaseSession })
        }

        newOrder.amountPaid = complimentarySale ? 0 : paid
        newOrder.bal = complimentarySale ? 0 : Math.max(0, finalOrderAmount - paid)
        newOrder.customerName = customerName || newOrder.customerName
        newOrder.customerId = customerId || newOrder.customerId
        newOrder.orderName = customerName || customerId || newOrder.orderName || orderNum
        await newOrder.save({ session: databaseSession })

        return { success: true, orderId: newOrder._id, orderNum, transactionId: newOrder.transactionId }
      })

      if (result && result.success) {
        if (!skipRevalidate && path) {
          revalidatePath(path)
        }

        return {
          success: 'Order and payment saved',
          orderId: String(result.orderId),
          orderNum: String(result.orderNum || ''),
          bDate: effectiveBusinessDate,
          submissionId: String(submissionId || transactionId || Date.now()),
          transactionId: String(result.transactionId || transactionId || submissionId || Date.now()),
        }
      }

      return { error: 'Sale could not be completed' }
    } catch (err) {
      if (err && err.code === 'INSUFFICIENT') {
        const ids = items.map((item) => item.product)
        const prods = await Product.find({ _id: { $in: ids } }).lean()
        const stockUpdates = prods.map((product) => ({ product: String(product._id), qty: product.qty || 0 }))
        return { error: err.message, stockUpdates, submissionId: String(submissionId || transactionId || Date.now()) }
      }
      if (err && err.code === 'BAD_PAYMENT') {
        return { error: err.message, submissionId: String(submissionId || transactionId || Date.now()) }
      }
      if (err && err.code === 'BAD_WALLET') {
        return { error: err.message, submissionId: String(submissionId || transactionId || Date.now()) }
      }
      return { error: err.message || 'Failed to create order and payment', submissionId: String(submissionId || transactionId || Date.now()) }
    }
  } catch (err) {
    return { error: 'Failed to create order and payment', submissionId: String(submissionId || transactionId || Date.now()) }
  }
}
