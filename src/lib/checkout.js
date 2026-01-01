// Server-side checkout validation helpers
// Validates that:
// - `cartItems` is an array of items with `product` (id) and `qty`
// - each product exists
// - each product belongs to the requesting store (`slug` matches product.slug)
// - requested quantities are positive integers and do not exceed DB stock
// Throws an Error with a descriptive message on any validation failure.

import connectToDB from '@/utils/connectDB'
import Product from '@/models/product'

/**
 * Validate checkout cart items against current DB state.
 * @param {Array<{product: string, qty: number}>} cartItems
 * @param {string} slug - store slug making the request
 * @returns {Promise<{valid: true, items: Array}>} resolves when valid
 * @throws {Error} descriptive validation error
 */
export async function validateCheckout(cartItems, slug){
	if(!Array.isArray(cartItems)) throw new Error('cartItems must be an array')
	if(!slug) throw new Error('store slug is required')

	// normalize and validate basic shape
	const normalized = cartItems.map((it, idx) => {
		const product = it.product || it.productId || it.itemId || it._id
		const rawQty = it.qty ?? it.quantity ?? it.count
		const qty = Number(rawQty)
		if(!product) throw new Error(`cartItems[${idx}]: missing product id`)
		if(!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)){
			throw new Error(`cartItems[${idx}]: qty must be a positive integer`)
		}
		return { product: String(product), qty }
	})

	// fetch products from DB
	await connectToDB()
	const ids = [...new Set(normalized.map(i=>i.product))]
	const products = await Product.find({ _id: { $in: ids } }).lean()
	const prodMap = new Map(products.map(p=>[String(p._id), p]))

	const notFound = []
	const wrongStore = []
	const insufficient = []

	for(const it of normalized){
		const p = prodMap.get(String(it.product))
		if(!p){
			notFound.push(it.product)
			continue
		}
		if(String(p.slug || '') !== String(slug)){
			wrongStore.push({ product: it.product, name: p.name, productSlug: p.slug })
			continue
		}
		const avail = Number(p.qty || 0)
		if(it.qty > avail){
			insufficient.push({ product: it.product, name: p.name, requested: it.qty, available: avail })
		}
	}

	if(notFound.length){
		throw new Error(`Products not found: ${notFound.join(', ')}`)
	}
	if(wrongStore.length){
		const msgs = wrongStore.map(w => `${w.name || w.product} does not belong to store ${slug}`)
		throw new Error(msgs.join('; '))
	}
	if(insufficient.length){
		const msgs = insufficient.map(i => `${i.name || i.product}: requested ${i.requested}, available ${i.available}`)
		throw new Error(`Insufficient stock for some items: ${msgs.join('; ')}`)
	}

	// all good — return validated items with product data
	const validated = normalized.map(it=>({ ...it, productDoc: prodMap.get(String(it.product)) }))
	return { valid: true, items: validated }
}

export default validateCheckout
