import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import Store from '@/models/store'
import { requireStoreRole } from '@/lib/requireStoreRole'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { customerId, storeId, name, email, phone, dateOfBirth, gender, street, city, state, zipCode, country, deliveryCost, outstandingBalance, creditLimit } = body
    if (!customerId || !storeId || !name || !phone) return NextResponse.json({ error: 'Customer ID, store ID, name, and phone are required' }, { status: 400 })

    const values = { deliveryCost, outstandingBalance, creditLimit }
    for (const [field, value] of Object.entries(values)) {
      const number = Number(value || 0)
      if (!Number.isFinite(number) || number < 0) return NextResponse.json({ error: `${field} must be a non-negative number` }, { status: 400 })
      values[field] = number
    }

    await connectDB()
    const store = await Store.findById(storeId).lean()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    let membership
    try { membership = await requireStoreRole(session.user.id, storeId, ['OWNER', 'MANAGER']) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    if (membership?.role !== 'OWNER' && Object.prototype.hasOwnProperty.call(body, 'outstandingBalance')) {
      return NextResponse.json({ error: 'Only owners can update outstanding balance' }, { status: 403 })
    }
    if (membership?.role !== 'OWNER') delete values.outstandingBalance

    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, storeId, isDeleted: false },
      { name, email: email || undefined, phone, dateOfBirth: dateOfBirth || undefined, gender: gender || undefined, address: { street, city, state, zipCode, country: country || 'Nigeria' }, ...values },
      { new: true, runValidators: true }
    )
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    return NextResponse.json({ success: true, customer: { _id: customer._id, name: customer.name } })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: error.message || 'Failed to update customer' }, { status: 500 })
  }
}
