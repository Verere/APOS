import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const SECRET = process.env.NEXTAUTH_SECRET as string

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Protected patterns
  const isProtectedPage = pathname.startsWith('/dashboard') || /\/[^/]+\/pos(\/.*)?$/.test(pathname)
  const isProtectedApi = pathname.startsWith('/api/protected') || pathname.startsWith('/api/stock/restock')

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next()

  try {
    const token = await getToken({ req, secret: SECRET })
    if (!token) throw new Error('no token')
    return NextResponse.next()
  } catch (err) {
    if (isProtectedApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [ '/slug/pos/:path*','/dashboard/:path*', '/api/protected/:path*', '/api/stock/restock/:path*'],
}
