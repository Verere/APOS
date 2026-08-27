import db from './db'
import { LOCAL_SYNC_STATUS, makeLocalId } from './schema'

export const enqueueSync = async ({
  transactionId,
  deviceId,
  type,
  payload,
  status = LOCAL_SYNC_STATUS.PENDING,
}) => {
  if (!transactionId) return null

  const record = {
    id: makeLocalId('queue'),
    transactionId,
    deviceId: deviceId || 'unknown-device',
    type: type || 'SALE',
    payload: payload || {},
    status,
    attempts: 0,
    lastError: null,
    nextRetryAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.syncQueue.put(record)
  return record
}

export const getPendingSyncQueue = async () => db.syncQueue.where('status').equals(LOCAL_SYNC_STATUS.PENDING).toArray()

export const markSyncQueueItem = async (transactionId, status, patch = {}) => {
  if (!transactionId) return null

  const existing = await db.syncQueue.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  return db.syncQueue.update(existing.id, {
    status,
    updatedAt: new Date().toISOString(),
    ...patch,
  })
}

export const markSyncFailed = async (transactionId, errorMessage, retryAt, patch = {}) => {
  if (!transactionId) return null

  const existing = await db.syncQueue.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  return db.syncQueue.update(existing.id, {
    status: LOCAL_SYNC_STATUS.FAILED,
    lastError: String(errorMessage || 'Sync failed'),
    nextRetryAt: retryAt || new Date(Date.now() + 30000).toISOString(),
    attempts: Number(existing.attempts || 0) + 1,
    updatedAt: new Date().toISOString(),
    ...patch,
  })
}
