// Server component: verifies session server-side and renders protected content.
import React from 'react'
import { requireAuthServer } from '@/lib/requireAuth'

export default async function ProtectedServer({ children }) {
  // will throw with .status 401/403 if not authorized
  let token
  try {
    token = await requireAuthServer()
  } catch (e) {
    if (e.status === 401) {
      // In a server component you may redirect or render a message
      return <div className="p-4 text-red-600">Unauthorized — please <a href="/login">login</a></div>
    }
    if (e.status === 403) {
      return <div className="p-4 text-red-600">Forbidden — insufficient privileges</div>
    }
    return <div className="p-4 text-red-600">Error: {String(e.message)}</div>
  }

  return (
    <div>
      <h3>Protected server content</h3>
      <p>Welcome {token.email || token.sub}</p>
      {children}
    </div>
  )
}
