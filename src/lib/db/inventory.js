import db from './db'
import { LOCAL_SYNC_STATUS, makeLocalId } from './schema'

export const recordLocalInventoryChange = async ({
  transactionId,
  productId,
  storeId,
  quantityDelta,
  orderId,
  notes,
}) => {
  const record = {
    id: makeLocalId('inventory'),
    transactionId: transactionId || makeLocalId('tx'),
    productId: String(productId || ''),
    storeId: storeId || null,
    quantityDelta: Number(quantityDelta || 0),
    orderId: orderId || null,
    notes: notes || '',
    syncStatus: LOCAL_SYNC_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.inventory.put(record)
  return record
}

export const getPendingInventory = async () => db.inventory.where('syncStatus').equals(LOCAL_SYNC_STATUS.PENDING).toArray()
