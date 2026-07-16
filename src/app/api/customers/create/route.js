import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import Customer from '@/models/customer'
import Store from '@/models/store'
import StoreSettings from '@/models/storeSettings'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { requireStoreRole } from '@/lib/requireStoreRole'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { storeId, slug, name, email, phone, dateOfBirth, gender, street, city, state, zipCode, country, priceTypeId } = body

    if (!storeId || !name || !phone) {
      return NextResponse.json(
        { error: 'Store ID, name, and phone are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify store exists
    const store = await Store.findById(storeId)
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verify user has permission (OWNER or MANAGER)
    try {
      await requireStoreRole(session.user.id, storeId, ['OWNER', 'MANAGER'])
    } catch (e) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if customer with same phone already exists for this store
    const existingCustomer = await Customer.findOne({
      storeId,
      phone,
      isDeleted: false
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this phone number already exists' },
        { status: 400 }
      )
    }

    let normalizedPriceTypeId = null
    if (priceTypeId) {
      const settings = await StoreSettings.findOne({ storeId }, { priceTypes: 1 }).lean()
      const activeIds = (settings?.priceTypes || [])
        .filter((pt) => pt?.active !== false)
        .map((pt) => String(pt.id))

      if (!activeIds.includes(String(priceTypeId))) {
        return NextResponse.json(
          { error: 'Invalid or archived price type selected for customer' },
          { status: 400 }
        )
      }

      normalizedPriceTypeId = String(priceTypeId)
    }

    // Create new customer
    const newCustomer = new Customer({
      storeId,
      name,
      email: email || undefined,
      phone,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      address: {
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || 'Nigeria'
      },
      priceTypeId: normalizedPriceTypeId,
      loyaltyPoints: 0,
      totalPurchases: 0,
      totalSpent: 0,
      isDeleted: false
    })

    await newCustomer.save()

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer: {
        _id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}
