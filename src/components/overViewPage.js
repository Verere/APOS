'use client'
import DashboardContent from '@/components/dashboard/DashboardContent'

const OverViewPage = ({ slug, user, stats, recentOrders, salesData, selectedMonth, selectedMonthLabel, deliveryEnabled, serviceChargeEnabled }) => {
  return (
    <DashboardContent
      slug={slug}
      stats={stats}
      recentOrders={recentOrders}
      salesData={salesData}
      selectedMonth={selectedMonth}
      selectedMonthLabel={selectedMonthLabel}
      deliveryEnabled={deliveryEnabled}
      serviceChargeEnabled={serviceChargeEnabled}
    />
  )
}

export default OverViewPage