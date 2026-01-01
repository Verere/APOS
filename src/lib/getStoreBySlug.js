import connectToDB from '@/utils/connectDB'
import Store from '@/models/store'

export async function getStoreBySlug(storeSlug) {
  if (!storeSlug || typeof storeSlug !== 'string') {
    const err = new Error('storeSlug is required')
    err.status = 400
    throw err
  }

  await connectToDB()

  const store = await Store.findOne({ slug: storeSlug })
  if (!store) {
    const err = new Error('Store not found')
    err.status = 404
    throw err
  }

  return store
}
