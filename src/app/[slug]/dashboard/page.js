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


  // Calculate stats
  const totalRevenue = Array.isArray(orders) 
    ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) 
    : 0
  const totalOrders = Array.isArray(orders) ? orders.length : 0

  const stats = {
    totalRevenue,
    totalOrders,
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