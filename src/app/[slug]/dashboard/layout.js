import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient'

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

  // Prepare user data for client component
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  }

  return (
    <DashboardLayoutClient slug={slug} user={userData}>
      {children}
    </DashboardLayoutClient>
  )
}
