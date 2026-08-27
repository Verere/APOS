import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import WalletTransaction from '@/models/walletTransaction'
import Credit from '@/models/credit'
import CreditPayment from '@/models/creditPayment'

function toAmount(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

async function processDeposit({ customerId, amount, paymentMethod, reference, remarks, createdBy, useTransaction }) {
  let session = null
  const normalizedReference =
    typeof reference === 'string' ? reference.trim() : ''
  const receiptNumber = `WDR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const receiptDate = new Date()

  if (useTransaction) {
    session = await mongoose.startSession()
    session.startTransaction()
  }

  try {
    const findOptions = session ? { session } : undefined
    const saveOptions = session ? { session } : undefined

    const customer = await Customer.findById(customerId, null, findOptions)
    if (!customer || customer.isDeleted) {
      throw Object.assign(new Error('Customer not found'), { status: 404 })
    }

    // --- Auto-deduct outstanding credits from deposit ---
    const outstandingCredits = await Credit.find(
      { customerId: customer._id, isPaid: false, isCancelled: { $ne: true } },
      null,
      session ? { session } : undefined
    ).sort({ createdAt: 1 }) // oldest first

    let remaining = amount
    const creditPaymentsToCreate = []

    for (const credit of outstandingCredits) {
      if (remaining <= 0) break
      const creditRemaining = credit.amount - (credit.amountPaid || 0)
      if (creditRemaining <= 0) continue

      const pay = Math.min(remaining, creditRemaining)
      remaining -= pay

      const newAmountPaid = (credit.amountPaid || 0) + pay
      credit.amountPaid = newAmountPaid
      if (newAmountPaid >= credit.amount) credit.isPaid = true
      await credit.save(saveOptions)

      creditPaymentsToCreate.push({
        storeId: customer.storeId,
        creditId: credit._id,
        orderId: credit.orderId,
        customerId: customer._id,
        amount: pay,
        paymentMethod: paymentMethod || 'CASH',
        receiptNumber: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        notes: `Auto-deducted from wallet deposit${normalizedReference ? ` (ref: ${normalizedReference})` : ''}`,
        recordedBy: createdBy,
      })
    }

    if (creditPaymentsToCreate.length > 0) {
      await CreditPayment.create(creditPaymentsToCreate, { ...(saveOptions || {}), ordered: true })

      // Recalculate customer's outstanding balance
      const allCredits = await Credit.find(
        { customerId: customer._id, isCancelled: { $ne: true } },
        null,
        session ? { session } : undefined
      )
      customer.outstandingBalance = allCredits.reduce(
        (sum, c) => sum + Math.max((c.amount || 0) - (c.amountPaid || 0), 0),
        0
      )
    }
    // --- End credit deduction ---

    const creditDeducted = amount - remaining

    // Step 1: record the full deposit coming in
    const depositBalanceBefore = Number(customer.walletBalance || 0)
    const depositBalanceAfter = depositBalanceBefore + amount   // full amount lands first

    // Step 2: if credits were settled, immediately deduct from wallet
    const finalBalance = depositBalanceAfter - creditDeducted   // = depositBalanceBefore + remaining

    customer.walletBalance = finalBalance
    await customer.save(saveOptions)

    const txnsToCreate = [
      {
        customer: customer._id,
        invoice: null,
        type: 'Deposit',
        amount,
        balanceBefore: depositBalanceBefore,
        balanceAfter: depositBalanceAfter,
        paymentMethod: paymentMethod || null,
        ...(normalizedReference ? { reference: normalizedReference } : {}),
        remarks: [`Receipt: ${receiptNumber}`, remarks].filter(Boolean).join(' | '),
        createdBy,
        createdAt: receiptDate,
      },
    ]

    if (creditDeducted > 0) {
      txnsToCreate.push({
        customer: customer._id,
        invoice: null,
        type: 'Sale',
        amount: creditDeducted,
        balanceBefore: depositBalanceAfter,
        balanceAfter: finalBalance,
        paymentMethod: paymentMethod || null,
        ...(normalizedReference ? { reference: normalizedReference } : {}),
        remarks: `Receipt: ${receiptNumber} | Auto-settled outstanding credit balance${normalizedReference ? ` (ref: ${normalizedReference})` : ''}`,
        createdBy,
        createdAt: new Date(receiptDate.getTime() + 1), // 1ms after deposit so it sorts after
      })
    }

    await WalletTransaction.create(txnsToCreate, { ...(saveOptions || {}), ordered: true })

    if (session) {
      await session.commitTransaction()
      session.endSession()
    }

    return {
      success: true,
      customerId: String(customer._id),
      depositedAmount: amount,
      walletBalance: finalBalance,
      creditDeducted,
      currentOutstandingBalance: Number(customer.outstandingBalance || 0),
      receiptNumber,
      receiptDate,
    }
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction()
      } catch {}
      session.endSession()
    }
    throw error
  }
}

export async function POST(req) {
  try {
    const authSession = await getServerSession(authOptions)
    if (!authSession || !authSession.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { customerId, amount, paymentMethod, reference, remarks } = body

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'customerId is required' },
        { status: 400 }
      )
    }

    const parsedAmount = toAmount(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'amount must be greater than 0' },
        { status: 400 }
      )
    }

    await connectDB()

    const createdBy = authSession.user.name || authSession.user.email || 'system'

    try {
      const result = await processDeposit({
        customerId,
        amount: parsedAmount,
        paymentMethod,
        reference,
        remarks,
        createdBy,
        useTransaction: true,
      })

      return NextResponse.json({
        success: true,
        message: 'Wallet deposit recorded successfully',
        customerId: result.customerId,
        depositedAmount: result.depositedAmount,
        outstandingBillSettled: result.creditDeducted,
        walletBalance: result.walletBalance,
        creditDeducted: result.creditDeducted,
        currentOutstandingBill: result.currentOutstandingBalance,
        receiptNumber: result.receiptNumber,
        receiptDate: result.receiptDate,
      })
    } catch (transactionError) {
      const message = String(transactionError?.message || '')
      const noTxnSupport =
        message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
        message.includes('transactions are not supported')

      if (!noTxnSupport) {
        const status = transactionError?.status || 500
        return NextResponse.json(
          { success: false, message: transactionError?.message || 'Failed to process deposit' },
          { status }
        )
      }

      const result = await processDeposit({
        customerId,
        amount: parsedAmount,
        paymentMethod,
        reference,
        remarks,
        createdBy,
        useTransaction: false,
      })

      return NextResponse.json({
        success: true,
        message: 'Wallet deposit recorded successfully',
        customerId: result.customerId,
        depositedAmount: result.depositedAmount,
        outstandingBillSettled: result.creditDeducted,
        walletBalance: result.walletBalance,
        creditDeducted: result.creditDeducted,
        currentOutstandingBill: result.currentOutstandingBalance,
        receiptNumber: result.receiptNumber,
        receiptDate: result.receiptDate,
      })
    }
  } catch (error) {
    console.error('Customer deposit error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process deposit' },
      { status: 500 }
    )
  }
}
