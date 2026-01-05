'use client'
import DashboardContent from '@/components/dashboard/DashboardContent'

const OverViewPage = ({ slug, user, stats, recentOrders, salesData }) => {
  return (
    <DashboardContent stats={stats} recentOrders={recentOrders} salesData={salesData} />
  )
}

export default OverViewPage