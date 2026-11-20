'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import ThemeSwitch from '@/app/switch'

const TopBar = ({ user, slug, store, onMenuClick = () => {}, isMenuOpen = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount, setNotificationCount] = useState(3) // Example count
  const profileRef = useRef(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const handleSettings = () => {
    router.push(`/${slug}/settings`)
    setIsProfileOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 min-w-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
          aria-label="Open dashboard navigation"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-sidebar"
        >
          <Menu size={22} />
        </button>
        {/* Search Bar */}
        {/* <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </form>
        </div> */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
          <h2 className="max-w-full truncate bg-gray-100 px-2 py-2 text-base font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200 sm:px-4 sm:text-lg lg:text-2xl">{store?.name || slug}</h2>
          </div>
          </div> 

        {/* Right Side Actions */}
        <div className="ml-1 flex shrink-0 items-center gap-1 sm:ml-2 sm:gap-2 lg:ml-4 lg:gap-4">
          {/* Theme Switcher */}
          <button
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:min-h-0 lg:min-w-0"
            aria-label="Toggle theme"
          >
            <ThemeSwitch />
          </button>

          {/* Notifications */}
          <button
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:min-h-0 lg:min-w-0"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex min-h-11 items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100 sm:gap-3 sm:p-2"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  'text-gray-500 transition-transform',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </div>
                  <div className="mt-1 break-words text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>

                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar