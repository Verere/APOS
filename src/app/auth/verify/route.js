import connectToDB from '@/utils/connectDB'
import User from '@/models/user'
import bcrypt from 'bcryptjs'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || url.searchParams.get('t')
    if (!token) {
      const html = `<html><body><h2>Verification token missing</h2><p>Please use the link sent to your email.</p></body></html>`
      return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

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

    if (!user) {
      const html = `<html><body><h2>Invalid or expired token</h2><p>The verification link is invalid or has expired.</p></body></html>`
      return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

    // Check expiry if present
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      const html = `<html><body><h2>Token expired</h2><p>The verification link has expired.</p></body></html>`
      return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

    // Mark verified and clear verification fields
    await User.updateOne(
      { _id: user._id },
      { $set: { emailVerified: new Date() }, $unset: { emailVerificationToken: '', emailVerificationExpires: '', emailToken: '' } }
    )

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Email Verified</title>
          <style>body{font-family:system-ui,Arial,Helvetica,sans-serif;padding:24px;text-align:center}</style>
        </head>
        <body>
          <h1>Email verified</h1>
          <p>Your email has been successfully verified. You can now <a href="/login">log in</a> or return to the <a href="/">homepage</a>.</p>
        </body>
      </html>
    `

    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error('email verify GET error', err)
    const html = `<html><body><h2>Server error</h2><p>Please try again later.</p></body></html>`
    return new Response(html, { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}
