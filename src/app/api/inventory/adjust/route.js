import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Product from '@/models/product'
import InventoryTransaction from '@/models/models/InventoryTransaction'

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

    if (!['RESTOCK', 'ADJUSTMENT'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    if (type === 'ADJUSTMENT' && !notes?.trim()) {
      return NextResponse.json({ error: 'Notes are required for adjustments' }, { status: 400 })
    }

    await connectDB()

    // Get current product
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousStock = product.qty
    const quantityChange = parseInt(quantity)
    
    // For RESTOCK, only allow positive numbers
    if (type === 'RESTOCK' && quantityChange <= 0) {
      return NextResponse.json({ error: 'Restock quantity must be positive' }, { status: 400 })
    }

    // Calculate new stock
    const newStock = type === 'RESTOCK' 
      ? previousStock + quantityChange 
      : previousStock + quantityChange

    if (newStock < 0) {
      return NextResponse.json({ 
        error: `Cannot adjust stock. Result would be negative (${newStock})` 
      }, { status: 400 })
    }

    // Update product quantity
    product.qty = newStock
    product.totalValue = newStock * product.price
    await product.save()

    // Create inventory transaction
    await new InventoryTransaction({
      productId: product._id,
      slug: slug,
      type: type,
      quantity: quantityChange,
      previousStock: previousStock,
      newStock: newStock,
      notes: notes?.trim() || `${type === 'RESTOCK' ? 'Stock replenishment' : 'Stock adjustment'} by ${session.user.name || session.user.email}`
    }).save()

    return NextResponse.json({
      success: true,
      product: {
        _id: product._id.toString(),
        name: product.name,
        qty: product.qty,
        totalValue: product.totalValue
      },
      transaction: {
        type,
        quantity: quantityChange,
        previousStock,
        newStock
      }
    })
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return NextResponse.json({
      error: 'Failed to adjust stock',
      details: error.message
    }, { status: 500 })
  }
}
