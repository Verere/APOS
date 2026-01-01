'use client'
import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import DashboardContent from '@/components/dashboard/DashboardContent'

const OverViewPage = ({ slug, user, stats, recentOrders }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar slug={slug} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        } overflow-hidden`}
      >
        <TopBar user={user} slug={slug} />
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <DashboardContent stats={stats} recentOrders={recentOrders} />
        </main>
      </div>
    </div>
  )
}

export default OverViewPage