import db from '../db/db.js'
import { upsertProductRecord } from '../db/products.js'
import { upsertCustomerRecord } from '../db/customers.js'

function getCatalogSyncKey(slug) {
  return `catalog-sync-${String(slug || '')}`
}

export function shouldUseLocalCatalog({ serverUnavailable = false, menus = [] } = {}) {
  return Boolean(serverUnavailable) || !Array.isArray(menus) || menus.length === 0
}

export async function hydrateLocalCatalog({ slug, products = [], customers = [] }) {
  if (!slug) return

  await Promise.allSettled(
    (Array.isArray(products) ? products : []).map((product) => {
      return upsertProductRecord({
        ...product,
        slug,
      })
    })
  )

  await Promise.allSettled(
    (Array.isArray(customers) ? customers : []).map((customer) => {
      return upsertCustomerRecord({
        ...customer,
        storeId: customer?.storeId || slug,
      })
    })
  )

  await db.metadata.put({
    key: getCatalogSyncKey(slug),
    value: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function getLocalCatalogLastSyncedAt(slug) {
  if (!slug) return null

  const record = await db.metadata.get(getCatalogSyncKey(slug))
  if (!record?.value) return null

  const timestamp = new Date(record.value)
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString()
}

export async function getLocalProductsBySlug(slug) {
  if (!slug) return []

  const records = await db.products.where('slug').equals(slug).toArray()
  return records
    .filter((item) => !item?.isDeleted)
    .map((item) => ({
      ...item,
      _id: item.productId || item.id,
      product: item.productId || item.id,
    }))
}

export async function getLocalCustomersBySlug(slug) {
  if (!slug) return []

  const records = await db.customers.toArray()
  return records
    .filter((item) => !item?.isDeleted)
    .filter((item) => String(item?.storeId || '') === String(slug))
    .map((item) => ({
      ...item,
      _id: item.customerId || item.id,
    }))
}
