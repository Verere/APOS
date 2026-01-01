import connectToDB from '@/utils/connectDB'
import User from '@/models/user'
import bcrypt from 'bcryptjs'

async function verifyToken(token) {
  if (!token) return { error: 'token is required' }

  await connectToDB()

  // Try to find by legacy plain token first (emailToken)
  let user = await User.findOne({ emailToken: token })

  // If not found, try to match against hashed verification token (if not expired)
  if (!user) {
    const now = new Date()
    const candidates = await User.find({ emailVerificationToken: { $exists: true, $ne: null }, emailVerificationExpires: { $gt: now } }).lean()
    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        if (!cand.emailVerificationToken) continue
        const match = await bcrypt.compare(token, cand.emailVerificationToken)
        if (match) {
          user = await User.findById(cand._id)
          break
        }
      }
    }
  }

  if (!user) return { error: 'Invalid or expired token' }

  // Check expiry if present
  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    return { error: 'Token expired' }
  }

  // Mark verified and clear verification fields
  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerified: new Date() }, $unset: { emailVerificationToken: '', emailVerificationExpires: '', emailToken: '' } }
  )

  return { success: true, message: 'Email verified' }
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || url.searchParams.get('t')
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'token is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    
    // Redirect to the page-based verification for GET requests
    return Response.redirect(new URL(`/auth/verify?token=${encodeURIComponent(token)}`, url.origin), 302)
  } catch (err) {
    console.error('email verify GET error', err)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const token = body?.token || body?.verificationToken
    
    const result = await verifyToken(token)
    
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 })
    }

    return new Response(JSON.stringify({ success: true, message: result.message }), { status: 200 })
  } catch (err) {
    console.error('email verify POST error', err)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}
