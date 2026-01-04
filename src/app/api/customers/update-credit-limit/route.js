import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { customerId, creditLimit, storeId } = await req.json()

    if (!customerId || creditLimit === undefined || !storeId) {
      return NextResponse.json(
        { success: false, message: 'Customer ID, credit limit, and store ID are required' },
        { status: 400 }
      )
    }

    if (creditLimit < 0) {
      return NextResponse.json(
        { success: false, message: 'Credit limit cannot be negative' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify user has permission (OWNER or MANAGER)
    const membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId,
      isDeleted: false
    })

    if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to update credit limits' },
        { status: 403 }
      )
    }

    // Update customer credit limit
    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, storeId, isDeleted: false },
      { creditLimit: parseFloat(creditLimit) },
      { new: true }
    )

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Credit limit updated successfully',
      creditLimit: customer.creditLimit
    })
  } catch (error) {
    console.error('Error updating credit limit:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update credit limit' },
      { status: 500 }
    )
  }
}
