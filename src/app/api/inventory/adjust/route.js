import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import { applyInventoryChange } from '@/lib/inventoryService'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, slug, type, quantity, notes } = await request.json()

    // Validation
    if (!productId || !slug || !type || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const allowedTypes = ['RESTOCK', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED', 'TRANSFER_IN', 'TRANSFER_OUT']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    if (type === 'ADJUSTMENT' && !notes?.trim()) {
      return NextResponse.json({ error: 'Notes are required for adjustments' }, { status: 400 })
    }

    await connectDB()
    const quantityChange = parseInt(quantity)
    
    // Positive-only transaction types
    if (['RESTOCK', 'RETURN', 'TRANSFER_IN'].includes(type) && quantityChange <= 0) {
      return NextResponse.json({ error: `${type} quantity must be positive` }, { status: 400 })
    }

    // Negative-only transaction types
    if (['DAMAGED', 'EXPIRED', 'TRANSFER_OUT'].includes(type) && quantityChange >= 0) {
      return NextResponse.json({ error: `${type} quantity must be negative` }, { status: 400 })
    }

    const result = await applyInventoryChange({
      productId,
      slug,
      quantityChange,
      type,
      notes: notes?.trim() || `${type === 'RESTOCK' ? 'Stock replenishment' : 'Stock adjustment'} by ${session.user.name || session.user.email}`,
    })

    return NextResponse.json({
      success: true,
      product: {
        _id: result.updated._id.toString(),
        name: result.updated.name,
        qty: result.updated.qty,
        totalValue: result.updated.totalValue
      },
      transaction: {
        type,
        quantity: result.quantity,
        previousStock: result.previousStock,
        newStock: result.newStock
      }
    })
  } catch (error) {
    console.error('Error adjusting stock:', error)
    if (error?.code === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (error?.code === 'INSUFFICIENT') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({
      error: 'Failed to adjust stock',
      details: error.message
    }, { status: 500 })
  }
}
