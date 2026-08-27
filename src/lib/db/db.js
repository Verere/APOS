import Dexie from 'dexie'

const db = new Dexie('apos-pos-db')

const schema = {
  products: '&id, productId, storeId, slug, updatedAt, isDeleted',
  customers: '&id, customerId, storeId, phone, email, walletBalance, isDeleted, updatedAt',
  orders: '&id, transactionId, deviceId, storeId, orderNum, syncStatus, createdAt, updatedAt',
  orderItems: '&id, transactionId, orderId, productId, createdAt',
  payments: '&id, transactionId, orderId, customerId, method, amount, syncStatus, createdAt',
  inventory: '&id, transactionId, productId, storeId, quantityDelta, createdAt',
  settings: '&id, key, storeId, updatedAt',
  syncQueue: '&id, transactionId, type, status, deviceId, nextRetryAt, attempts, createdAt',
  metadata: '&key, updatedAt',
}

db.version(1).stores(schema)

export default db
