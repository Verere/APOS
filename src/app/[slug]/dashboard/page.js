import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import OverViewPage from '@/components/overViewPage.js'
import { fetchAllOrders, fetchAllstoreMembers, fetchProducts } from '@/actions/fetch'
import connectDB from '@/utils/connectDB'
import Expense from '@/models/expense'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import User from '@/models/user'
import UserSubscription from '@/models/userSubscription'
import moment from 'moment'

const DashBoardPage = async ({params}) => {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const { slug } = await params

  // Check store membership and role
  await connectDB()
  const store = await Store.findOne({ slug }).lean()
  if (!store) {
    redirect('/dashboard')
  }

  const membership = await StoreMembership.findOne({
    userId: session.user.id,
    storeId: store._id,
    isDeleted: { $ne: true }
  }).lean()

  if (!membership) {
    redirect('/dashboard')
  }

  // Check subscription status based on role
  // For OWNER: check their own subscription
  // For MANAGER/CASHIER: check store owner's subscription
  let ownerToCheck = membership.role === 'OWNER' ? session.user.id : store.owner
  
  const owner = await User.findById(ownerToCheck).populate('currentSubscription').lean()
  
  console.log('Checking subscription for:', {
    role: membership.role,
    ownerId: ownerToCheck,
    hasCurrentSubscription: !!owner?.currentSubscription,
    subscriptionStatus: owner?.currentSubscription?.status
  })
  
  const hasActiveSubscription = owner?.currentSubscription && 
    ['ACTIVE', 'TRIAL'].includes(owner.currentSubscription.status)
  
  // If owner has no active subscription
  if (!hasActiveSubscription) {
    if (membership.role === 'OWNER') {
      redirect('/subscription')
    }
    
    // For cashiers and managers, show subscription error message
    const subscriptionStatus = owner?.currentSubscription?.status || 'NONE'
    const message = subscriptionStatus === 'EXPIRED' 
      ? 'Subscription Expired' 
      : 'No Active Subscription'
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{message}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The store owner's subscription has {subscriptionStatus === 'EXPIRED' ? 'expired' : 'not been activated'}. 
            Please contact the store owner to renew the subscription.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Store: <span className="font-semibold">{slug}</span>
          </div>
          <a 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Redirect cashiers to POS
  if (membership.role === 'CASHIER') {
    redirect(`/${slug}/pos`)
  }

 

   // Fetch stats - Pass slug directly as a string, not as an object
  const orders = await fetchAllOrders(slug) || []
  const users = await fetchAllstoreMembers(slug) || []
  const products = await fetchProducts(slug) || []

  // Fetch expenses for the current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  // Query expenses for current month using bDate format
  const monthExpenses = await Expense.find({
    slug: slug,
    isCancelled: { $ne: true },
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  }).lean()
  
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  console.log('Total Monthly Expenses:', totalExpenses, 'from', monthExpenses.length, 'expenses')

  // Get current month date range

  // Debug logging
  console.log('Total orders fetched:', orders.length)
  console.log('Start of month:', startOfMonth)
  console.log('End of month:', endOfMonth)
  
  // Filter orders for current month
  const monthlyOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        if (!order.createdAt) return false
        const orderDate = new Date(order.createdAt)
        const isInRange = orderDate >= startOfMonth && orderDate <= endOfMonth
        if (isInRange) {
          console.log('Monthly order found:', {
            date: orderDate,
            amount: order.totalAmount || order.amount
          })
        }
        return isInRange
      })
    : []

  console.log('Monthly orders count:', monthlyOrders.length)

  // Calculate monthly revenue - check both totalAmount and amount fields
  const totalRevenue = monthlyOrders.reduce((sum, order) => {
    const amount = order.totalAmount || order.amount || 0
    return sum + amount
  }, 0)
  
  console.log('Total Revenue:', totalRevenue)
  
  // Calculate total profit from stored profit in orders
  const totalProfit = monthlyOrders.reduce((sum, order) => {
    // Use stored profit field if available, otherwise calculate from items
    if (order.profit !== undefined && order.profit !== null) {
      return sum + order.profit
    }
    
    // Fallback: calculate from items if profit field not available (old orders)
    if (!order.items || !Array.isArray(order.items)) return sum
    
    const orderProfit = order.items.reduce((itemSum, item) => {
      // Use stored item profit if available
      if (item.profit !== undefined && item.profit !== null) {
        return itemSum + item.profit
      }
      
      // Fallback calculation
      const price = item.price || 0
      const cost = item.cost || 0
      const quantity = item.qty || 0
      return itemSum + ((price - cost) * quantity)
    }, 0)
    
    return sum + orderProfit
  }, 0)
  
  console.log('Total Profit:', totalProfit)
  
  // Calculate monthly orders count (not all time)
  const totalOrders = monthlyOrders.length

  const stats = {
    totalRevenue,
    totalOrders,
    totalProfit,
    totalExpenses,
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
  }

  // Prepare daily sales data for chart (current month)
  const dailySalesData = []
  const daysInMonth = endOfMonth.getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOrders = monthlyOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getDate() === day
    })
    
    const dayRevenue = dayOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || order.amount || 0)
    }, 0)
    
    dailySalesData.push({
      day: day.toString(),
      date: `${day}/${now.getMonth() + 1}`,
      revenue: dayRevenue,
      orders: dayOrders.length
    })
  }

    // Get recent orders (last 5) - Sort by createdAt descending to get most recent orders
  const recentOrders = Array.isArray(orders)
    ? orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date, newest first
    .slice(0, 5) // Take first 5 (most recent)
    .map(order => ({
      id: order._id.toString(),
      customer: order.orderName || order.customerName || 'Walk-in-Customer',
      date: new Date(order.createdAt).toLocaleDateString(),
      amount: order.totalAmount || order.amount || 0,
      status: order.status || 'pending',
    }))
:[]
  return (
    <OverViewPage 
      slug={slug} 
      user={session.user} 
      stats={stats} 
      recentOrders={recentOrders}
      salesData={dailySalesData}
    />
  )
}

export default DashBoardPage