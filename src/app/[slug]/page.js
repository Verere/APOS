import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import { fetchUserMemberships } from '@/actions/fetch'
import Link from 'next/link'

export default async function SlugPage(params) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect('/login')
  }
const { slug } = await params
  const memberships = await fetchUserMemberships(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{slug} Dashboard</h1>
        <p className="mt-3 text-gray-600">Welcome, {session.user.name || session.user.email}</p>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Store Memberships</h2>
          {memberships.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">You are not a member of any stores yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {memberships.map((m) => (
                <li key={String(m.storeId)}>
                  <Link href={`/${m.slug}/dashboard`} className="block group">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-400 p-4 sm:p-5 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {m.slug}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            Store ID: {String(m?.storeId)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {m.role}
                          </span>
                          <svg 
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
