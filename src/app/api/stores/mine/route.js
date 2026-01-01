import connectToDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    await connectToDB()

    const memberships = await StoreMembership.find({ userId: session.user.id, isDeleted: { $ne: true } }).lean()
    if (!memberships || memberships.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 })
    }

    const storeIds = memberships.map(m => m.storeId)
    const stores = await Store.find({ _id: { $in: storeIds }, isDeleted: { $ne: true } }).select('name').lean()
    const storeMap = new Map(stores.map(s => [String(s._id), s]))

    const result = memberships.map(m => ({
      storeId: m.storeId,
      name: storeMap.get(String(m.storeId))?.name || null,
      role: m.role,
    }))

    return new Response(JSON.stringify(result), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}
