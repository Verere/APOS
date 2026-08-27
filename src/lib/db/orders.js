import db from './db'
import { LOCAL_SYNC_STATUS, makeLocalId } from './schema'

export const createLocalOrder = async ({
  transactionId,
  deviceId,
  storeId,
  orderNum,
  customerId,
  customerName,
  cashier,
  amount,
  amountPaid,
  total,
  change,
  items,
  meta = {},
}) => {
  const orderId = makeLocalId('order')
  const finalTransactionId = transactionId || makeLocalId('tx')

  const record = {
    id: orderId,
    transactionId: finalTransactionId,
    deviceId: deviceId || 'unknown-device',
    storeId: storeId || null,
    orderNum: orderNum || `OFF-${Date.now()}`,
    customerId: customerId || null,
    customerName: customerName || null,
    cashier: cashier || 'Cashier',
    amount: Number(amount || 0),
    amountPaid: Number(amountPaid || 0),
    total: Number(total || amount || 0),
    change: Number(change || 0),
    items: Array.isArray(items) ? items : [],
    syncStatus: LOCAL_SYNC_STATUS.PENDING,
    status: 'PENDING_SYNC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta,
  }

  await db.transaction('rw', db.orders, db.orderItems, async () => {
    await db.orders.put(record)

    const orderItems = (Array.isArray(items) ? items : []).map((item, idx) => ({
      id: makeLocalId(`order-item-${idx}`),
      transactionId: finalTransactionId,
      orderId,
      productId: String(item.product || item.productId || item._id || ''),
      productName: item.productName || item.name || '',
      quantity: Number(item.qty || item.quantity || 0),
      unitPrice: Number(item.price || item.unitPrice || 0),
      amount: Number(item.amount || item.total || 0),
      total: Number(item.total || item.amount || 0),
      createdAt: new Date().toISOString(),
    }))

    if (orderItems.length) {
      await db.orderItems.bulkPut(orderItems)
    }
  })

  return record
}

export const getPendingOrders = async () => db.orders.where('syncStatus').equals(LOCAL_SYNC_STATUS.PENDING).toArray()
export const updateOrderSyncStatus = async (transactionId, syncStatus, patch = {}) => {
  if (!transactionId) return null

  const existing = await db.orders.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  return db.orders.update(existing.id, {
    syncStatus,
    status: syncStatus === LOCAL_SYNC_STATUS.SYNCED ? 'SYNCED' : 'PENDING_SYNC',
    updatedAt: new Date().toISOString(),
    ...patch,
  })
}
