import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import { NEXTAUTH_SECRET } from 'process'
import { getTokenFromCookies as getTokenFromCookieHelper } from './auth'

const SECRET = process.env.NEXTAUTH_SECRET

// Get token from request if available (API routes / middleware)
export async function getTokenFromRequest(req) {
  try {
    return await getToken({ req, secret: SECRET })
  } catch (e) {
    return null
  }
}

// For server components / server actions without req, fall back to cookie helper
export async function getTokenAuto(req) {
  if (req) {
    const t = await getTokenFromRequest(req)
    if (t) return t
  }
  // use cookie store for server actions / server components
  try {
    const t2 = await getTokenFromCookieHelper()
    if (t2) return t2
  } catch (e) {}
  return null
}

// Require authentication for server contexts. Throws an Error with .status for caller to handle.
export async function requireAuthServer({ req = null, roles = null } = {}) {
  const token = await getTokenAuto(req)
  if (!token) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  if (roles && Array.isArray(roles)) {
    const role = token.role || token?.user?.role || null
    if (!role || !roles.includes(role)) {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }
  }
  return token
}

// Require authentication for API route handlers (req provided)
export async function requireAuthApi(req, { roles = null } = {}) {
  const token = await getTokenFromRequest(req)
  if (!token) return { ok: false, status: 401 }
  if (roles && Array.isArray(roles)) {
    const role = token.role || token?.user?.role || null
    if (!role || !roles.includes(role)) return { ok: false, status: 403 }
  }
  return { ok: true, token }
}

export default {
  getTokenFromRequest,
  getTokenAuto,
  requireAuthServer,
  requireAuthApi,
}
