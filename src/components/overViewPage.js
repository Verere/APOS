'use client'
import DashboardContent from '@/components/dashboard/DashboardContent'

const OverViewPage = ({ slug, user, stats, recentOrders, salesData, selectedMonth, selectedMonthLabel }) => {
  return (
    <DashboardContent
      slug={slug}
      stats={stats}
      recentOrders={recentOrders}
      salesData={salesData}
      selectedMonth={selectedMonth}
      selectedMonthLabel={selectedMonthLabel}
    />
  )
}

export default OverViewPage