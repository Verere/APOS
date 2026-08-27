export const LOCAL_SYNC_STATUS = {
  PENDING: 'PENDING',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
}

export const LOCAL_TRANSACTION_TYPES = {
  SALE: 'SALE',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT',
}

export const LOCAL_PAYMENT_METHODS = {
  CASH: 'CASH',
  POS: 'POS',
  TRANSFER: 'TRANSFER',
  OTHER: 'OTHER',
  WALLET: 'WALLET',
  COMPLIMENTARY: 'COMPLIMENTARY',
}

export const DEVICE_ID_KEY = 'pos-device-id'

export function makeLocalId(prefix = 'local') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function buildLocalMetadata({ transactionId, deviceId, type = LOCAL_TRANSACTION_TYPES.SALE }) {
  return {
    transactionId,
    deviceId,
    type,
    syncStatus: LOCAL_SYNC_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
