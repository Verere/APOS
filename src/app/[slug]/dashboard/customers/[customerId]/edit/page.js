import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import StoreSettings from '@/models/storeSettings'
import Customer from '@/models/customer'
import AddCustomerForm from '@/components/customers/AddCustomerForm'

export default async function EditCustomerPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const { slug, customerId } = await params
  await connectDB()
  const store = await Store.findOne({ slug }).lean()
  if (!store) return <div>Store not found</div>
  const membership = await StoreMembership.findOne({ userId: session.user.id, storeId: store._id, isDeleted: false }).lean()
  if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) redirect(`/${slug}/dashboard`)
  const customer = await Customer.findOne({ _id: customerId, storeId: store._id, isDeleted: false }).lean()
  if (!customer) notFound()
  const settings = await StoreSettings.findOne({ slug }).select('deliveryEnabled').lean()
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <AddCustomerForm
        slug={slug}
        storeId={store._id.toString()}
        deliveryEnabled={settings?.deliveryEnabled ?? false}
        canEditOutstandingBalance={membership.role === 'OWNER'}
        editingCustomer={JSON.parse(JSON.stringify(customer))}
      />
    </div>
  )
}
