import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import Store from '@/models/store'
import StoreMembership from '@/models/storeMembership'
import Customer from '@/models/customer'
import CustomerDepositPageClient from '@/components/customers/CustomerDepositPageClient'

export default async function CustomerDepositPage({ params }) {
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
      isDeleted: false,
    }).lean()

    if (!membership || !['OWNER', 'MANAGER', 'CASHIER'].includes(membership.role)) {
      redirect(`/${slug}/dashboard`)
    }

    const customers = await Customer.find({
      storeId: store._id,
      isDeleted: false,
    })
      .sort({ name: 1 })
      .lean()

    const formattedCustomers = customers.map((customer) => ({
      _id: String(customer._id),
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      walletBalance: Number(customer.walletBalance || 0),
    }))

    return (
      <div className="container mx-auto px-4 py-6">
        <CustomerDepositPageClient slug={slug} initialCustomers={formattedCustomers} />
      </div>
    )
  } catch (error) {
    console.error('Error loading customer deposit page:', error)
    return <div>Error loading page</div>
  }
}
