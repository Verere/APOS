import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import AddCustomerForm from '@/components/customers/AddCustomerForm'

export default async function AddCustomerPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const { slug } = await params

  try {
    await connectDB()

    const store = await Store.findOne({ slug }).lean()
    if (!store) {
      return <div>Store not found</div>
    }

    const membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId: store._id,
      isDeleted: false
    }).lean()

    if (!membership) {
      redirect(`/${slug}/dashboard`)
    }

    // Only OWNER and MANAGER can add customers
    if (!['OWNER', 'MANAGER'].includes(membership.role)) {
      redirect(`/${slug}/dashboard`)
    }

    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AddCustomerForm slug={slug} storeId={store._id.toString()} />
      </div>
    )
  } catch (error) {
    console.error('Error loading add customer page:', error)
    return <div>Error loading page</div>
  }
}
