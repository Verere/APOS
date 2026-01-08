import { NextResponse } from 'next/server'
import connectToDB from '@/utils/connectDB'
import Store from '@/models/store'
import { getTokenFromCookies } from '@/lib/auth'

export async function GET(req) {
  try {
    let token = await getTokenFromCookies()
    if (!token) {
      const { getTokenAuto } = await import('@/lib/auth')
      token = await getTokenAuto()
    }
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    await connectToDB()
    const store = await Store.findOne({ user: token.email }).lean()
    const slug = store?.slug || null
    if (slug) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (err) {
    console.error('slug-redirect error', err)
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}
