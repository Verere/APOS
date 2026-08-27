import db from './db'
import { LOCAL_SYNC_STATUS, makeLocalId } from './schema'

export const createLocalPayment = async ({
  transactionId,
  orderId,
  deviceId,
  customerId,
  method,
  amount,
  orderAmount,
  change,
  syncStatus = LOCAL_SYNC_STATUS.PENDING,
}) => {
  const record = {
    id: makeLocalId('payment'),
    transactionId: transactionId || makeLocalId('tx'),
    orderId: orderId || null,
    deviceId: deviceId || 'unknown-device',
    customerId: customerId || null,
    method: method || 'CASH',
    amount: Number(amount || 0),
    orderAmount: Number(orderAmount || 0),
    change: Number(change || 0),
    syncStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.payments.put(record)
  return record
}

export const getPendingPayments = async () => db.payments.where('syncStatus').equals(LOCAL_SYNC_STATUS.PENDING).toArray()
