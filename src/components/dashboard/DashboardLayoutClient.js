'use client'
import { useState, useEffect, useContext } from 'react'
import { GlobalContext } from '@/context'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/Topbar'

const DashboardLayoutClient = ({ children, slug, user, store, membership }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { setStore, setMembership } = useContext(GlobalContext)

  useEffect(() => {
    if (store) {
      // Save store to global context
      setStore(store)
      
      // Persist to localStorage
      localStorage.setItem('store', JSON.stringify(store))
    }
  }, [store, setStore])

  useEffect(() => {
    if (membership) {
      // Save membership to global context
      setMembership(membership)
      
      // Persist to localStorage
      localStorage.setItem('membership', JSON.stringify(membership))
    }
  }, [membership, setMembership])

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
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayoutClient
