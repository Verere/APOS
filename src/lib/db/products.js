import db from './db'

export const upsertProductRecord = async (product) => {
  if (!product) return null

  const record = {
    id: product.id || product._id || product.productId || `${product.slug || 'product'}-${product._id || product.productId || Date.now()}`,
    productId: String(product._id || product.productId || product.id || ''),
    storeId: product.storeId || product.slug || null,
    slug: product.slug || null,
    name: product.name || '',
    barcode: product.barcode || null,
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    qty: Number(product.qty || 0),
    isDeleted: Boolean(product.isDeleted),
    updatedAt: new Date().toISOString(),
  }

  return db.products.put(record)
}

export const getProductById = async (productId) => {
  if (!productId) return null
  return db.products.where('productId').equals(String(productId)).first()
}
