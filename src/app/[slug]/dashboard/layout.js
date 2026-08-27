import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'
import { syncProductsWithInventory } from '@/actions/fetch'
import { isDatabaseConnectivityError } from '@/lib/dbError'

export default async function DashboardLayout({ children, params }) {
  const { slug } = await params
  
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect('/login')
  }

  let store = null
  let membership = null

  try {
    // Verify user has access to this store
    await connectDB()
    
    store = await Store.findOne({ slug }).lean()
    if (!store) {
      redirect('/dashboard')
    }

    membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId: store._id,
    }).lean()

    if (!membership) {
      redirect('/dashboard')
    }

    // Authorization: Only owner and manager can access dashboard
    const allowedRoles = ['OWNER', 'MANAGER']
    if (!allowedRoles.includes(membership.role)) {
      redirect(`/${slug}`)
    }
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return (
        <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-3 text-amber-900">Database Temporarily Unavailable</h1>
            <p className="text-sm text-amber-800 mb-2">
              Unable to load dashboard right now because server connectivity is unstable.
            </p>
            <p className="text-xs text-amber-700">
              Please check internet connection and try again.
            </p>
          </div>
        </main>
      )
    }

    throw error
  }

  // Sync products with inventory transactions after login
  try {
    await syncProductsWithInventory(slug)
  } catch (error) {
    console.error('Error syncing inventory:', error)
    // Don't block page load if sync fails
  }

  // Prepare user data for client component
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }

  // Prepare store data for client component
  const storeData = {
    _id: store._id.toString(),
    name: store.name,
    slug: store.slug,
    email: store.email,
    address: store.address,
    number: store.number,
    whatsapp: store.whatsapp,
    logo: store.logo,
  }

  // Prepare membership data
  const membershipData = {
    role: membership.role,
  }

  return (
    <DashboardLayoutClient slug={slug} user={userData} store={storeData} membership={membershipData}>
      {children}
    </DashboardLayoutClient>
  )
}
