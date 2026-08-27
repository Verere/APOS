import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectToDB from '@/utils/connectDB'
import Order from '@/models/order'
import Payment from '@/models/payments'
import { processSale } from '@/lib/saleProcessor'
import { toClientSafeDbError } from '@/lib/dbError'

const BACKOFF_MS = [5000, 15000, 30000, 60000, 300000, 900000]

function normalizePayload(transaction) {
  const payload = transaction?.payload || {}
  const order = payload.order || {}
  const cartItems = Array.isArray(payload.items) ? payload.items : Array.isArray(order.items) ? order.items : []
  const paymentEntries = Array.isArray(payload.paymentMethods)
    ? payload.paymentMethods
    : Array.isArray(payload.payments)
      ? payload.payments
      : []
  const paymentTotal = paymentEntries.reduce((sum, entry) => sum + Number(entry?.amount || 0), 0)
  const methodTotal = (method) => paymentEntries
    .filter((entry) => String(entry?.method || '').toUpperCase() === method)
    .reduce((sum, entry) => sum + Number(entry?.amount || 0), 0)
  const inferredMop = paymentEntries.map((entry) => String(entry?.method || '').toUpperCase()).filter(Boolean).join(',')
  const amountPaid = Number(payload.amountPaid ?? order.amountPaid ?? paymentTotal ?? 0)
  const cashPaid = Number(payload.cashPaid ?? order.cashPaid ?? methodTotal('CASH') ?? 0)
  const posPaid = Number(payload.posPaid ?? order.posPaid ?? methodTotal('POS') ?? 0)
  const transferPaid = Number(payload.transferPaid ?? order.transferPaid ?? methodTotal('TRANSFER') ?? 0)
  const walletPaid = Number(payload.walletPaid ?? order.walletPaid ?? methodTotal('WALLET') ?? 0)

  return {
    slug: payload.slug || order.slug || '',
    user: payload.user || order.cashier || 'Cashier',
    bDate: payload.bDate || order.bDate || new Date().toISOString(),
    path: payload.path || '/',
    cartItems: JSON.stringify(cartItems),
    amountPaid,
    mop: payload.mop || order.mop || inferredMop || 'CASH',
    orderAmount: Number(payload.orderAmount ?? order.amount ?? 0),
    cashPaid,
    posPaid,
    transferPaid,
    walletPaid,
    customerId: payload.customerId || order.customerId || '',
    customerName: payload.customerName || order.customerName || '',
    isComplimentary: Boolean(payload.isComplimentary || order.isComplimentary),
    transactionType: payload.transactionType || order.transactionType || 'STANDARD',
    approvedBy: payload.approvedBy || order.approvedBy || '',
    reason: payload.reason || order.reason || '',
    remarks: payload.remarks || order.remarks || '',
    location: payload.location || order.location || '',
    allowDecimalQuantity: Boolean(payload.allowDecimalQuantity || order.allowDecimalQuantity),
    submissionId: String(transaction?.transactionId || payload.transactionId || ''),
    transactionId: String(transaction?.transactionId || payload.transactionId || ''),
    deviceId: payload.deviceId || transaction?.deviceId || '',
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const deviceId = body?.deviceId || ''
    const transactions = Array.isArray(body?.transactions) ? body.transactions : []

    if (!deviceId || !transactions.length) {
      return NextResponse.json({ error: 'deviceId and transactions are required' }, { status: 400 })
    }

    await connectToDB()

    const results = []

    for (const transaction of transactions) {
      const transactionId = String(transaction?.transactionId || '')
      if (!transactionId) {
        results.push({ success: false, error: 'Missing transactionId', transactionId: null })
        continue
      }

      const existingOrder = await Order.findOne({ transactionId }).lean()
      const existingPayment = await Payment.findOne({ transactionId }).lean()

      if (existingOrder || existingPayment) {
        results.push({
          success: true,
          transactionId,
          status: 'SYNCED',
          serverOrderId: existingOrder?._id || null,
          orderNum: existingOrder?.orderNum || null,
          skipped: true,
        })
        continue
      }

      try {
        const payload = normalizePayload(transaction)
        const result = await processSale({
          ...payload,
          session,
          skipRevalidate: true,
        })

        if (result?.error) {
          results.push({
            success: false,
            transactionId,
            status: 'FAILED',
            error: result.error,
          })
          continue
        }

        results.push({
          success: true,
          transactionId,
          status: 'SYNCED',
          serverOrderId: result?.orderId || null,
          orderNum: result?.orderNum || null,
          data: result,
        })
      } catch (error) {
        results.push({
          success: false,
          transactionId,
          status: 'FAILED',
          error: error?.message || 'Unknown sync error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      deviceId,
      processed: results.length,
      results,
      backoffMs: BACKOFF_MS,
    })
  } catch (error) {
    const safeDbError = toClientSafeDbError(error, 'Database is temporarily unavailable. Sync will retry automatically.')
    if (safeDbError) {
      return NextResponse.json({
        success: false,
        error: safeDbError.error,
        code: safeDbError.code,
        retryable: true,
        backoffMs: BACKOFF_MS,
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to process sync batch',
    }, { status: 500 })
  }
}
