import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import { fetchUserMemberships } from '@/actions/fetch'
import { fetchUserSubscription } from '@/actions/userSubscription'
import { fetchUserUsage } from '@/actions/userUsage'
// Remove dynamic import of CreateStoreButton from server component
import Link from 'next/link'

import ThemeSwitcherClient from './ThemeSwitcherClient'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import CreateStoreButtonClient from './CreateStoreButtonClient.jsx'

// Use a client wrapper for DashboardRefresher
import DashboardRefresherClient from './DashboardRefresherClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect('/login')
  }


  const memberships = await fetchUserMemberships(session.user.id);
  const userSubscription = await fetchUserSubscription(session.user.id);
  const hasUserSubscription = !!userSubscription && !!userSubscription.subscription;
  let userUsage = null;
  if (hasUserSubscription) {
    userUsage = await fetchUserUsage(session.user.id);
  }

  // If user is only a cashier (no owner/manager roles)
  if (memberships.length > 0) {
    const hasOwnerOrManager = memberships.some(m => m.role === 'OWNER' || m.role === 'MANAGER')
    if (!hasOwnerOrManager) {
      // If cashier has only 1 store, auto-redirect to POS
      if (memberships.length === 1) {
        redirect(`/${memberships[0].slug}/pos`)
      }
      // If cashier has multiple stores, show selection below
    }
  }

  const isCashierOnly = memberships.length > 0 && !memberships.some(m => m.role === 'OWNER' || m.role === 'MANAGER')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <DashboardRefresherClient />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Welcome, {session.user.name || session.user.email}</p>
            {hasUserSubscription && userSubscription.package && (
              <div className="mt-2 space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  Subscription: {userSubscription.package.displayName || userSubscription.package.name}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium">
                    Stores allowed: {userSubscription.package.features?.maxStores ?? '—'}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                    Products allowed: {userSubscription.package.features?.maxProducts ?? '—'}
                  </span>
                  {userUsage && (
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium">
                      Stores created: {userUsage.stores ?? '0'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
              <ThemeSwitcherClient />
              <Link 
                href="/referral"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Refer & Earn
              </Link>
              {hasUserSubscription && (
                <CreateStoreButtonClient
                  storesCreated={userUsage?.stores}
                  storesAllowed={userSubscription.package.features?.maxStores}
                />
              )}
            </div>
        </div>

        {/* Subscription Card - Only show for owners/managers */}
        {!isCashierOnly && (
          <div className="mb-8">
            <SubscriptionCard />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {isCashierOnly ? 'Select Store to Open POS' : 'Your Store Memberships'}
          </h2>
          {memberships.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">You are not a member of any stores yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {memberships.map((m) => (
                <li key={String(m.storeId)}>
                  <Link href={isCashierOnly ? `/${m.slug}/pos` : `/${m.slug}/dashboard`} className="block group">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 p-4 sm:p-5 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {m.slug}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isCashierOnly ? 'Click to open POS' : `Store ID: ${String(m?.storeId)}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {m.role}
                          </span>
                          <svg 
                            className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
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
