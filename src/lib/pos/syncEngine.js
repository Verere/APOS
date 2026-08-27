import db from '@/lib/db/db'
import { getDeviceId } from '@/lib/db/device'
import { LOCAL_SYNC_STATUS } from '@/lib/db/schema'
import { classifySyncError, getRetryDelayMs, shouldRetrySync } from '@/lib/pos/syncRetry'

export async function isOnline() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export async function getPendingSyncJobs() {
  return db.syncQueue.where('status').equals(LOCAL_SYNC_STATUS.PENDING).toArray()
}

export async function getSyncQueueSummary() {
  const items = await db.syncQueue.toArray()
  const summary = {
    total: items.length,
    pending: items.filter((item) => item.status === LOCAL_SYNC_STATUS.PENDING).length,
    syncing: items.filter((item) => item.status === LOCAL_SYNC_STATUS.SYNCING).length,
    failed: items.filter((item) => item.status === LOCAL_SYNC_STATUS.FAILED).length,
    synced: items.filter((item) => item.status === LOCAL_SYNC_STATUS.SYNCED).length,
  }

  return summary
}

export async function getLatestSyncFailureInfo() {
  const failedItems = await db.syncQueue.where('status').equals(LOCAL_SYNC_STATUS.FAILED).toArray()
  if (!failedItems.length) return null

  const latest = failedItems
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return bTime - aTime
    })[0]

  return {
    transactionId: latest.transactionId || '',
    lastError: String(latest.lastError || ''),
    nextRetryAt: latest.nextRetryAt || null,
    attempts: Number(latest.attempts || 0),
    classification: String(latest.syncFailureClassification || classifySyncError(latest.lastError || '')),
    updatedAt: latest.updatedAt || latest.createdAt || null,
  }
}

export async function markSyncStarted(transactionId) {
  const existing = await db.syncQueue.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  return db.syncQueue.update(existing.id, {
    status: LOCAL_SYNC_STATUS.SYNCING,
    updatedAt: new Date().toISOString(),
  })
}

export async function markSyncCompleted(transactionId, extra = {}) {
  const existing = await db.syncQueue.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  return db.syncQueue.update(existing.id, {
    status: LOCAL_SYNC_STATUS.SYNCED,
    updatedAt: new Date().toISOString(),
    ...extra,
  })
}

export async function markSyncFailed(transactionId, errorMessage, retryAt, classification = '') {
  const existing = await db.syncQueue.where('transactionId').equals(transactionId).first()
  if (!existing) return null

  const nextClassification = String(classification || classifySyncError(errorMessage || '') || 'UNKNOWN')

  return db.syncQueue.update(existing.id, {
    status: LOCAL_SYNC_STATUS.FAILED,
    lastError: String(errorMessage || 'Sync failed'),
    nextRetryAt: retryAt || new Date(Date.now() + 30000).toISOString(),
    attempts: Number(existing.attempts || 0) + 1,
    syncFailureClassification: nextClassification,
    updatedAt: new Date().toISOString(),
  })
}

function resolveRetryWindow(item) {
  return shouldRetrySync(item, Date.now())
}

export async function syncPendingTransactions() {
  const deviceId = await getDeviceId()
  const queue = await db.syncQueue.where('deviceId').equals(deviceId).toArray()

  if (!queue.length) return { synced: 0, pending: 0, deviceId, results: [] }

  const pending = queue.filter((item) => item.status !== LOCAL_SYNC_STATUS.SYNCED && resolveRetryWindow(item))

  if (!pending.length) {
    return { synced: 0, pending: 0, deviceId, results: [] }
  }

  const transactions = pending.map((item) => ({
    transactionId: item.transactionId,
    deviceId: item.deviceId,
    type: item.type,
    payload: item.payload,
  }))

  const started = await Promise.allSettled(
    pending.map((item) => markSyncStarted(item.transactionId))
  )

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, transactions }),
      cache: 'no-store',
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok || !body?.success) {
      const errorMessage = body?.error || 'Sync request failed'
      const classification = classifySyncError(errorMessage)

      await Promise.allSettled(
        pending.map((item) => {
          const attempts = Number(item.attempts || 0)
          const retryDelayMs = getRetryDelayMs(attempts)

          return markSyncFailed(
            item.transactionId,
            errorMessage,
            new Date(Date.now() + retryDelayMs).toISOString(),
            classification,
          )
        })
      )

      return {
        synced: 0,
        pending: pending.length,
        deviceId,
        started: started.length,
        results: [],
        error: errorMessage,
        classification,
      }
    }

    const results = Array.isArray(body?.results) ? body.results : []
    const syncedResults = []

    for (const item of pending) {
      const result = results.find((entry) => String(entry.transactionId) === String(item.transactionId))

      if (result?.success) {
        await markSyncCompleted(item.transactionId, {
          lastError: null,
          nextRetryAt: null,
          attempts: Number(item.attempts || 0),
          syncStatus: LOCAL_SYNC_STATUS.SYNCED,
        })
        syncedResults.push({ transactionId: item.transactionId, success: true })
      } else {
        const errorMessage = result?.error || 'Sync failed'
        const attempts = Number(item.attempts || 0)
        const retryDelayMs = getRetryDelayMs(attempts)
        const classification = classifySyncError(errorMessage)

        await markSyncFailed(
          item.transactionId,
          errorMessage,
          new Date(Date.now() + retryDelayMs).toISOString(),
          classification,
        )
        syncedResults.push({ transactionId: item.transactionId, success: false, error: errorMessage, classification })
      }
    }

    return {
      synced: syncedResults.filter((entry) => entry.success).length,
      pending: pending.length,
      deviceId,
      started: started.length,
      results: syncedResults,
    }
  } catch (error) {
    const errorMessage = String(error?.message || error)
    const classification = classifySyncError(errorMessage)

    await Promise.allSettled(
      pending.map((item) => {
        const attempts = Number(item.attempts || 0)
        const retryDelayMs = getRetryDelayMs(attempts)
        return markSyncFailed(item.transactionId, errorMessage, new Date(Date.now() + retryDelayMs).toISOString(), classification)
      })
    )

    return {
      synced: 0,
      pending: pending.length,
      deviceId,
      started: started.length,
      results: [],
      error: errorMessage,
      classification,
    }
  }
}
