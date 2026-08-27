import db from './db'
import { DEVICE_ID_KEY } from './schema'

function generateDeviceId() {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 18)
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  return `POS-${suffix}`
}

export async function getDeviceId() {
  const existing = await db.metadata.get(DEVICE_ID_KEY)
  if (existing?.value) return String(existing.value)

  const created = generateDeviceId()
  await db.metadata.put({
    key: DEVICE_ID_KEY,
    value: created,
    updatedAt: new Date().toISOString(),
  })

  return created
}

export async function ensureDeviceId() {
  return getDeviceId()
}

export async function readDeviceId() {
  return db.metadata.get(DEVICE_ID_KEY)
}
