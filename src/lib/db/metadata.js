import db from './db'

export const readMetadata = async (key) => {
  if (!key) return null
  return db.metadata.get(key)
}

export const writeMetadata = async (key, value) => {
  if (!key) return null

  const payload = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  }

  return db.metadata.put(payload)
}

export const getOrCreateDeviceId = async () => {
  const existing = await readMetadata('deviceId')
  if (existing?.value) return existing.value

  const generated = `POS-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
  await writeMetadata('deviceId', generated)
  return generated
}
