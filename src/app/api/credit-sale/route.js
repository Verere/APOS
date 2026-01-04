import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import Order from '@/models/order'
import Customer from '@/models/customer'
import Credit from '@/models/credit'
import Product from '@/models/product'
import InventoryTransaction from '@/models/models/InventoryTransaction'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getStoreBySlug } from '@/lib/getStoreBySlug'
import { requireStoreRole } from '@/lib/requireStoreRole'
import withTransaction from '@/lib/withTransaction'
import validateCheckout from '@/lib/checkout'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, customerId, cartItems, bDate } = await req.json()

    if (!slug || !customerId || !cartItems || !cartItems.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify store access
    const store = await getStoreBySlug(slug)
    try {
      await requireStoreRole(session.user.id, store._id, ['OWNER', 'MANAGER', 'CASHIER'])
    } catch (e) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify customer exists and belongs to store
    const customer = await Customer.findOne({
      _id: customerId,
      storeId: store._id,
      isDeleted: false
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate cart items
    try {
      await validateCheckout(cartItems, slug)
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Process credit sale in transaction
    const result = await withTransaction(async (transactionSession) => {
      const soldBy = session.user.email
      const updatedProducts = []
      const ids = cartItems.map(i => i.product)

      // Fetch fresh product data
      const prods = await Product.find({ _id: { $in: ids } }).session(transactionSession)
      const prodMap = new Map(prods.map(p => [String(p._id), p]))

      // Reserve stock and create inventory transactions
      for (const item of cartItems) {
        const qtyToTake = Number(item.qty || 0)
        if (qtyToTake <= 0) continue

        const p = prodMap.get(String(item.product))
        if (!p) {
          throw Object.assign(
            new Error(`Product not found ${item.product}`),
            { code: 'NOT_FOUND', product: item.product }
          )
        }

        if (p.qty < qtyToTake) {
          throw Object.assign(
            new Error(`Insufficient stock for ${item.name || p.name}`),
            { code: 'INSUFFICIENT', product: item.product }
          )
        }

        // Decrement stock
        const updated = await Product.findOneAndUpdate(
          { _id: p._id, qty: { $gte: qtyToTake } },
          { $inc: { qty: -qtyToTake } },
          { new: true, session: transactionSession }
        )

        if (!updated) {
          throw Object.assign(
            new Error(`Insufficient stock for ${item.name || p.name}`),
            { code: 'INSUFFICIENT', product: item.product }
          )
        }

        // Record inventory transaction
        const inv = new InventoryTransaction({
          productId: p._id,
          slug,
          type: 'SALE',
          quantity: -qtyToTake,
          previousStock: p.qty,
          newStock: updated.qty,
          orderId: null,
          notes: `Credit sale to ${customer.name} by ${soldBy}`,
        })
        await inv.save({ session: transactionSession })

        updatedProducts.push({
          id: p._id,
          name: p.name,
          qty: qtyToTake,
          price: updated.price,
          cost: updated.cost || 0,
          newQty: updated.qty,
          amount: qtyToTake * updated.price,
          profit: (updated.price - (updated.cost || 0)) * qtyToTake
        })
      }

      // Calculate total amount and profit using DB prices
      let totalAmount = 0
      let totalProfit = 0
      for (const upd of updatedProducts) {
        totalAmount += upd.amount
        totalProfit += upd.profit
      }

      // Generate order number
      const orderCount = await Order.countDocuments({ slug })
      const orderNum = slug.substring(0, 3).toUpperCase() + (orderCount + 1)

      // Create order with cost and profit stored
      const newOrder = new Order({
        slug,
        orderNum,
        orderName: customer.name,
        items: cartItems.map(item => {
          const upd = updatedProducts.find(u => String(u.id) === String(item.product))
          return {
            ...item,
            price: upd?.price || item.price,
            cost: upd?.cost || 0,
            amount: upd?.amount || item.amount,
            profit: upd?.profit || 0
          }
        }),
        amount: totalAmount,
        profit: totalProfit,
        amountPaid: 0,
        bal: totalAmount,
        bDate,
        soldBy,
        status: 'Credit',
        isCompleted: false,
      })
      await newOrder.save({ session: transactionSession })

      // Update inventory transactions with order ID
      await InventoryTransaction.updateMany(
        { orderId: null, productId: { $in: ids } },
        { $set: { orderId: newOrder._id } },
        { session: transactionSession }
      )

      // Create credit record
      const newCredit = new Credit({
        storeId: store._id,
        customerId: customer._id,
        orderId: newOrder._id,
        amount: totalAmount,
        bDate: new Date(bDate),
        soldBy,
        isPaid: false,
        isCancelled: false,
      })
      await newCredit.save({ session: transactionSession })

      // Update customer total purchases, spent, and outstanding balance
      await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            totalPurchases: 1,
            totalSpent: totalAmount,
            outstandingBalance: totalAmount
          }
        },
        { session: transactionSession }
      )

      return {
        success: true,
        orderId: newOrder._id,
        orderNum,
        creditId: newCredit._id,
        totalAmount,
        items: updatedProducts,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Credit sale completed successfully',
      ...result
    })

  } catch (error) {
    console.error('Credit sale error:', error)
    
    // Handle insufficient stock error
    if (error && error.code === 'INSUFFICIENT') {
      const { cartItems } = await req.json()
      const ids = cartItems.map(i => i.product)
      const prods = await Product.find({ _id: { $in: ids } }).lean()
      const stockUpdates = prods.map(p => ({ product: p._id, qty: p.qty || 0 }))
      
      return NextResponse.json(
        { error: error.message, stockUpdates },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process credit sale' },
      { status: 500 }
    )
  }
}
