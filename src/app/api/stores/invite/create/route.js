import connectToDB from '@/utils/connectDB'
import StoreInvite from '@/models/storeInvite'
import Store from '@/models/store'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { v4 as uuidv4 } from 'uuid'
import withTransaction from '@/lib/withTransaction'
import StoreMembership from '@/models/storeMembership'
import { sendEmail, buildInviteHtml, buildInviteText } from '@/utils/email'
import getStoreBySlug from '@/lib/getStoreBySlug'
import requireStoreRole from '@/lib/requireStoreRole'

export async function POST(req) {
  try {
    const body = await req.json()
    const { storeSlug, email, role = 'MANAGER', expiresDays = 7, note } = body || {}
    if (!storeSlug) return new Response(JSON.stringify({ error: 'storeSlug is required' }), { status: 400 })
    if (!email) return new Response(JSON.stringify({ error: 'email is required' }), { status: 400 })

    await connectToDB()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    // find store and check permission
    const store = await getStoreBySlug(storeSlug)
    await requireStoreRole(session.user.id, store._id, ['OWNER'])

    const expiresAt = new Date(Date.now() + Number(expiresDays) * 24 * 60 * 60 * 1000)
    const token = uuidv4()

    // transactional create invite
    const created = await withTransaction(async (sessionDB) => {
      const invite = new StoreInvite({ storeId: store._id, email: email.toLowerCase(), role, token, expiresAt })
      await invite.save({ session: sessionDB })

      return invite.toObject()
    })

    // build invite link — normalize base URL and provide sensible fallbacks
    const rawBase = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '').toString().trim()
    let base = rawBase.replace(/\/$/, '')
    if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`
    const invalidHostPattern = /(^https?:\/\/(auth|localhost:?\d*$)|^auth$)/i
    if (!base || invalidHostPattern.test(base)) {
      const fallback = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '').toString().trim().replace(/\/$/, '')
      if (fallback && /^https?:\/\//i.test(fallback)) base = fallback
      else if (fallback) base = `https://${fallback}`
      else base = 'https://apos-one.vercel.app'
    }

    const inviteLink = `${base}/api/stores/invite/accept?token=${created.token}`

    // send email (best-effort)
    try {
      const html = buildInviteHtml({ inviterName: session.user.name || session.user.email, storeName: store.name, inviteLink, role, note })
      const text = buildInviteText({ inviterName: session.user.name || session.user.email, storeName: store.name, inviteLink, role, note })
      await sendEmail({ to: email, subject: `Invite to join ${store.name}`, text, html })
    } catch (e) {
      console.error('invite email error', e)
    }

    return new Response(JSON.stringify({ success: true, inviteLink, invite: { email: created.email, role: created.role, expiresAt: created.expiresAt } }), { status: 200 })
  } catch (err) {
    console.error('create invite error', err)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}
