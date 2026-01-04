'use client'
import DashboardContent from '@/components/dashboard/DashboardContent'

const OverViewPage = ({ slug, user, stats, recentOrders }) => {
  return (
    <DashboardContent stats={stats} recentOrders={recentOrders} />
  )
}

export default OverViewPage