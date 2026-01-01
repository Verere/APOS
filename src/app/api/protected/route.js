import { NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/requireAuth'

export async function GET(req) {
  const auth = await requireAuthApi(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  const token = auth.token
  return NextResponse.json({ message: 'Protected data', user: { email: token.email, id: token.sub || token.id, role: token.role || token?.user?.role || 'user' } })
}
