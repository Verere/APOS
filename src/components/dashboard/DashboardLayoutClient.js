'use client'
import { useState, useEffect, useContext, useRef } from 'react'
import { GlobalContext } from '@/context'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/Topbar'

const DashboardLayoutClient = ({ children, slug, user, store, membership }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const viewportModeRef = useRef(null)
  const { setStore, setMembership } = useContext(GlobalContext)

  useEffect(() => {
    const updateViewportMode = () => {
      const width = window.innerWidth
      const mode = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
      if (viewportModeRef.current === mode) return

      viewportModeRef.current = mode
      setIsMobileViewport(mode === 'mobile')
      setIsMobileMenuOpen(false)
      if (mode === 'tablet') setIsCollapsed(true)
      if (mode === 'desktop') setIsCollapsed(false)
    }

    updateViewportMode()
    window.addEventListener('resize', updateViewportMode)
    return () => window.removeEventListener('resize', updateViewportMode)
  }, [])

  useEffect(() => {
    if (!isMobileViewport || !isMobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMobileMenuOpen, isMobileViewport])

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
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50">
      {isMobileViewport && isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
          aria-label="Close dashboard navigation"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        slug={slug}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileViewport={isMobileViewport}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={`ml-0 flex min-h-screen w-full min-w-0 flex-1 flex-col overflow-x-hidden transition-[margin] duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}
      >
        <TopBar
          user={user}
          slug={slug}
          store={store}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isMenuOpen={isMobileMenuOpen}
        />
        <main className="w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayoutClient
