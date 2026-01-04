import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import OverViewPage from '@/components/overViewPage.js'
import { fetchAllOrders, fetchAllstoreMembers, fetchProducts } from '@/actions/fetch'

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

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

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
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
  }
    // Get recent orders (last 5) - Add Array.isArray() check
  const recentOrders = Array.isArray(orders)
    ? orders
    .slice(-5)
    .reverse()
    .map(order => ({
      id: order._id.toString(),
      customer: order.customerName || 'Guest',
      date: new Date(order.createdAt).toLocaleDateString(),
      amount: order.totalAmount || 0,
      status: order.status || 'pending',
    }))
:[]
  return (
    <OverViewPage 
      slug={slug} 
      user={session.user} 
      stats={stats} 
      recentOrders={recentOrders}
    />
  )
}

export default DashBoardPage