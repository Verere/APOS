import { NextResponse } from 'next/server'
import connectToDB from '@/utils/connectDB'
import Store from '@/models/store'
import { getTokenFromCookies } from '@/lib/auth'

export async function GET(req) {
  try {
    // try to get token from cookies
    let token = await getTokenFromCookies();
    if (!token) {
      // fallback to auto helper (works without req object)
      const { getTokenAuto } = await import('@/lib/auth')
      token = await getTokenAuto()
    }

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectToDB()
    const store = await Store.findOne({ user: token.email }).lean()
    const slug = store?.slug || null
    return NextResponse.json({ slug })
  } catch (err) {
    console.error('Error in /api/auth/slug:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
