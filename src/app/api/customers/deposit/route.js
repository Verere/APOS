import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import WalletTransaction from '@/models/walletTransaction'

function toAmount(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

async function processDeposit({ customerId, amount, paymentMethod, reference, remarks, createdBy, useTransaction }) {
  let session = null
  const normalizedReference =
    typeof reference === 'string' ? reference.trim() : ''

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

    const balanceBefore = Number(customer.walletBalance || 0)
    const balanceAfter = balanceBefore + amount

    customer.walletBalance = balanceAfter
    await customer.save(saveOptions)

    await WalletTransaction.create(
      [
        {
          customer: customer._id,
          invoice: null,
          type: 'Deposit',
          amount,
          balanceBefore,
          balanceAfter,
          paymentMethod: paymentMethod || null,
          ...(normalizedReference ? { reference: normalizedReference } : {}),
          remarks: remarks || '',
          createdBy,
          createdAt: new Date(),
        },
      ],
      saveOptions || undefined
    )

    if (session) {
      await session.commitTransaction()
      session.endSession()
    }

    return {
      success: true,
      customerId: String(customer._id),
      walletBalance: balanceAfter,
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
        walletBalance: result.walletBalance,
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
        walletBalance: result.walletBalance,
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
