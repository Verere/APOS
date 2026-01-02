import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'
import { syncProductsWithInventory } from '@/actions/fetch'

export default async function DashboardLayout({ children, params }) {
  const { slug } = await params
  
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect('/login')
  }

  // Verify user has access to this store
  await connectDB()
  
  const store = await Store.findOne({ slug }).lean()
  if (!store) {
    redirect('/dashboard')
  }

  const membership = await StoreMembership.findOne({
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
