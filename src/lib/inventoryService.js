import Product from '@/models/product'
import InventoryTransaction from '@/models/models/InventoryTransaction'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function buildError(message, code, extra = {}) {
  const err = new Error(message)
  err.code = code
  Object.assign(err, extra)
  return err
}

export async function applyInventoryChange({
  productId,
  slug,
  quantityChange,
  type,
  notes,
  orderId = null,
  session,
}) {
  const delta = toNumber(quantityChange, NaN)
  if (!productId) throw buildError('productId is required', 'BAD_INPUT')
  if (!slug) throw buildError('slug is required', 'BAD_INPUT')
  if (!type) throw buildError('type is required', 'BAD_INPUT')
  if (!Number.isFinite(delta) || delta === 0) {
    throw buildError('quantityChange must be a non-zero number', 'BAD_INPUT')
  }

  const product = await Product.findById(productId).session(session)
  if (!product) {
    throw buildError(`Product not found ${productId}`, 'NOT_FOUND', { product: productId })
  }

  const previousStock = toNumber(product.qty)
  const newStock = previousStock + delta
  if (newStock < 0) {
    throw buildError(`Insufficient stock for ${product.name || productId}`, 'INSUFFICIENT', {
      product: productId,
      available: previousStock,
      requested: Math.abs(delta),
    })
  }

  const filter = { _id: product._id }
  if (delta < 0) {
    filter.qty = { $gte: Math.abs(delta) }
  }

  const updated = await Product.findOneAndUpdate(
    filter,
    {
      $inc: { qty: delta },
      $set: { totalValue: newStock * toNumber(product.price) },
    },
    { new: true, session }
  )

  if (!updated) {
    throw buildError(`Insufficient stock for ${product.name || productId}`, 'INSUFFICIENT', {
      product: productId,
      available: previousStock,
      requested: Math.abs(delta),
    })
  }

  const transaction = await new InventoryTransaction({
    productId: product._id,
    slug,
    type,
    quantity: delta,
    previousStock,
    newStock: updated.qty,
    orderId,
    notes: notes || undefined,
  }).save({ session })

  return {
    product,
    updated,
    transaction,
    previousStock,
    newStock: updated.qty,
    quantity: delta,
  }
}

export async function reserveStockForSale({ slug, items, soldBy, session, orderId = null }) {
  if (!Array.isArray(items)) throw buildError('items must be an array', 'BAD_INPUT')

  const updatedProducts = []
  const transactionIds = []

  for (const item of items) {
    const qtyToTake = toNumber(item?.qty ?? item?.quantity, 0)
    if (qtyToTake <= 0) continue

    const result = await applyInventoryChange({
      productId: item.product,
      slug,
      quantityChange: -qtyToTake,
      type: 'SALE',
      notes: `Sale during checkout by ${soldBy || 'system'}`,
      orderId,
      session,
    })

    transactionIds.push(result.transaction._id)
    updatedProducts.push({
      id: result.updated._id,
      name: result.updated.name,
      qty: qtyToTake,
      cost: toNumber(result.updated.cost),
      newQty: toNumber(result.updated.qty),
    })
  }

  return { updatedProducts, transactionIds }
}

export async function attachTransactionsToOrder(transactionIds, orderId, session) {
  if (!orderId || !Array.isArray(transactionIds) || transactionIds.length === 0) return

  await InventoryTransaction.updateMany(
    { _id: { $in: transactionIds } },
    { $set: { orderId } },
    { session }
  )
}
