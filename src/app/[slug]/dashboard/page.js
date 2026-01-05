import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import OverViewPage from '@/components/overViewPage.js'
import { fetchAllOrders, fetchAllstoreMembers, fetchProducts } from '@/actions/fetch'
import connectDB from '@/utils/connectDB'
import Expense from '@/models/expense'
import moment from 'moment'

const DashBoardPage = async ({params}) => {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const { slug } = await params

 

   // Fetch stats - Pass slug directly as a string, not as an object
  const orders = await fetchAllOrders(slug) || []
  const users = await fetchAllstoreMembers(slug) || []
  const products = await fetchProducts(slug) || []

  // Fetch expenses for the current month
  await connectDB()
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