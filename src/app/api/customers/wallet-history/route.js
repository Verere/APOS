import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import WalletTransaction from '@/models/walletTransaction'
import Customer from '@/models/customer'

export async function GET(req) {
  try {
    const authSession = await getServerSession(authOptions)
    if (!authSession || !authSession.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)

    if (!customerId) {
      return NextResponse.json({ success: false, message: 'customerId is required' }, { status: 400 })
    }

    await connectDB()

    const customer = await Customer.findById(customerId, 'name isDeleted').lean()
    if (!customer || customer.isDeleted) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 })
    }

    const transactions = await WalletTransaction.find({ customer: customerId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({
        _id: String(t._id),
        type: t.type,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        paymentMethod: t.paymentMethod || null,
        reference: t.reference || null,
        remarks: t.remarks || '',
        createdBy: t.createdBy,
        createdAt: t.createdAt,
      })),
    })
  } catch (error) {
    console.error('Wallet history error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch wallet history' },
      { status: 500 }
    )
  }
}
