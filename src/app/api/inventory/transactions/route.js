import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import InventoryTransaction from '@/models/models/InventoryTransaction'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await connectDB()

    const transactions = await InventoryTransaction.find({ productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json({ 
      success: true, 
      transactions: transactions.map(t => ({
        ...t,
        _id: t._id.toString(),
        productId: t.productId.toString(),
        orderId: t.orderId ? t.orderId.toString() : null,
      }))
    })
  } catch (error) {
    console.error('Error fetching inventory transactions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch inventory transactions',
      details: error.message 
    }, { status: 500 })
  }
}
