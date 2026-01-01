import connectToDB from '@/utils/connectDB'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import VerifyClient from '@/app/auth/VerifyClient'

export default async function VerifyPage({ searchParams }){
  const token = (searchParams && (searchParams.token || searchParams.t)) || ''

  if (!token) {
    // No token in URL — render client verification UI
    return <VerifyClient />
  }

  // Server-side verification flow when token is present
  try {
    await connectToDB()

    // Try legacy plain token
    let user = await User.findOne({ emailToken: token })

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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid or expired token</h2>
            <p className="text-sm text-gray-600">The verification link is invalid or has expired.</p>
          </div>
        </div>
      )
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Token expired</h2>
            <p className="text-sm text-gray-600">The verification link has expired.</p>
          </div>
        </div>
      )
    }

    await User.updateOne({ _id: user._id }, { $set: { emailVerified: new Date() }, $unset: { emailVerificationToken: '', emailVerificationExpires: '', emailToken: '' } })

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Email Verified</h1>
          <p className="text-sm text-gray-600 mb-4">Your email has been successfully verified. You can now <a href="/login" className="text-blue-600">log in</a> or return to the <a href="/" className="text-blue-600">homepage</a>.</p>
        </div>
      </div>
    )
  } catch (err) {
    console.error('email verify server error', err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Server error</h2>
          <p className="text-sm text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }
}
