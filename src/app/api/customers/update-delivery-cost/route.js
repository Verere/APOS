import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import StoreMembership from '@/models/storeMembership'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { customerId, deliveryCost, storeId } = await req.json()
    const normalizedDeliveryCost = Number(deliveryCost)
    if (!customerId || !storeId || !Number.isFinite(normalizedDeliveryCost) || normalizedDeliveryCost < 0) {
      return NextResponse.json({ success: false, message: 'Customer ID, store ID, and a valid delivery cost are required' }, { status: 400 })
    }

    await connectDB()
    const membership = await StoreMembership.findOne({ userId: session.user.id, storeId, isDeleted: false }).lean()
    if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
      return NextResponse.json({ success: false, message: 'You do not have permission to update delivery costs' }, { status: 403 })
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, storeId, isDeleted: false },
      { deliveryCost: normalizedDeliveryCost },
      { new: true }
    )
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deliveryCost: customer.deliveryCost, message: 'Delivery cost updated successfully' })
  } catch (error) {
    console.error('Error updating delivery cost:', error)
    return NextResponse.json({ success: false, message: 'Failed to update delivery cost' }, { status: 500 })
  }
}