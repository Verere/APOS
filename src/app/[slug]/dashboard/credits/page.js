import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/utils/connectDB'
import Credit from '@/models/credit'
import Customer from '@/models/customer'
import Order from '@/models/order'
import Store from '@/models/store'
import CreditsListClient from '@/components/credits/CreditsListClient'

export default async function CreditsPage({ params }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const { slug } = await params

  await connectDB()

  // Get store
  const store = await Store.findOne({ slug }).lean()
  if (!store) {
    redirect('/dashboard')
  }

  // Fetch only unpaid credits (isPaid: false) with customer and order details
  const credits = await Credit.find({ 
    storeId: store._id,
    isCancelled: false,
    isPaid: false
  })
    .populate('customerId', 'name phone email address')
    .populate('orderId', 'orderNum totalAmount bDate')
    .sort({ createdAt: -1 })
    .lean()

  // Calculate totals
  const totalCredits = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0)
  const totalPaid = credits.reduce((sum, credit) => sum + (credit.amountPaid || 0), 0)
  const totalUnpaid = totalCredits - totalPaid
  const unpaidCredits = credits.filter(c => !c.isPaid)
  const paidCredits = credits.filter(c => c.isPaid)

  // Serialize data
  const serializedCredits = credits.map(credit => ({
    ...credit,
    _id: credit._id.toString(),
    storeId: credit.storeId.toString(),
    customerId: credit.customerId ? {
      _id: credit.customerId._id.toString(),
      name: credit.customerId.name,
      phone: credit.customerId.phone,
      email: credit.customerId.email,
      address: credit.customerId.address
    } : null,
    orderId: credit.orderId ? {
      _id: credit.orderId._id.toString(),
      orderNum: credit.orderId.orderNum,
      totalAmount: credit.orderId.totalAmount,
      bDate: credit.orderId.bDate
    } : null,
    bDate: credit.bDate ? credit.bDate.toISOString() : null,
    createdAt: credit.createdAt.toISOString(),
    updatedAt: credit.updatedAt?.toISOString() || null
  }))

  const stats = {
    totalCredits,
    totalUnpaid,
    totalPaid,
    totalCount: credits.length,
    unpaidCount: unpaidCredits.length,
    paidCount: paidCredits.length
  }

  return (
    <CreditsListClient 
      credits={serializedCredits} 
      stats={stats}
      slug={slug}
    />
  )
}
