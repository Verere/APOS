import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import Customer from '@/models/customer'
import Order from '@/models/order'
import CustomersListClient from '@/components/customers/CustomersListClient'

export default async function CustomersPage({ params }) {
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

    // Only OWNER and MANAGER can view customers
    if (!['OWNER', 'MANAGER'].includes(membership.role)) {
      redirect(`/${slug}/dashboard`)
    }

    // Fetch all customers for this store
    const customers = await Customer.find({
      storeId: store._id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .lean()

    // Calculate current month start date
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Format customers for client with monthly purchases
    const formattedCustomers = await Promise.all(
      customers.map(async (customer) => {
        // Count orders for this customer in current month
        const monthlyPurchases = await Order.countDocuments({
          slug: slug,
          orderName: customer.name,
          createdAt: { $gte: monthStart },
          isCompleted: true,
          isCancelled: false
        })

        return {
          _id: customer._id.toString(),
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address || {},
          dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString() : null,
          gender: customer.gender || '',
          loyaltyPoints: customer.loyaltyPoints || 0,
          totalPurchases: customer.totalPurchases || 0,
          totalSpent: customer.totalSpent || 0,
          creditLimit: customer.creditLimit || 0,
          outstandingBalance: customer.outstandingBalance || 0,
          monthlyPurchases,
          createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : null
        }
      })
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <CustomersListClient 
          customers={formattedCustomers} 
          slug={slug}
          currentUserRole={membership.role}
          storeId={store._id.toString()}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading customers page:', error)
    return <div>Error loading page</div>
  }
}
