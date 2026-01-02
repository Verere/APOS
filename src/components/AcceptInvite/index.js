'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AcceptInviteClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [inviteDetails, setInviteDetails] = useState(null)

  useEffect(() => {
    const acceptInvitation = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/store/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept invitation')
        }

        setSuccess(true)
        setInviteDetails(data)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    acceptInvitation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {loading && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Invitation
              </h2>
              <p className="text-gray-600">Please wait while we set up your account...</p>
            </div>
          )}

          {success && (
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invitation Accepted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully.
              </p>
              
              {inviteDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Store:</strong> {inviteDetails.storeName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Role:</strong> {inviteDetails.role}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {inviteDetails.email}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ✉️ Check your email for your login credentials.
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Go to Login Now
              </Link>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invitation Failed
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  This invitation may have expired or already been used.
                  Please contact the store owner for a new invitation.
                </p>
              </div>

              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
