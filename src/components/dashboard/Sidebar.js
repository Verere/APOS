'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Warehouse,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  List,
  FolderTree,
  ShoppingBag,
  Loader2,
} from 'lucide-react'

const Sidebar = ({ slug, isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [loadingItem, setLoadingItem] = useState(null)

  // Reset loading state when pathname changes (navigation completed)
  useEffect(() => {
    setLoadingItem(null)
  }, [pathname])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${slug}/dashboard` },
    { icon: ShoppingBag, label: 'Point of Sales', path: `/${slug}/pos` },
    { 
      icon: Package, 
      label: 'Products', 
      path: `/${slug}/dashboard/products`,
      hasSubmenu: true,
      submenu: [
        { icon: List, label: 'Products', path: `/${slug}/dashboard/products/product-table` },
        { icon: Plus, label: 'Create Product', path: `/${slug}/dashboard/products` },
        { icon: FolderTree, label: 'Categories', path: `/${slug}/dashboard/categories` },
      ]
    },
    { icon: ShoppingCart, label: 'Sales', path: `/${slug}/dashboard/orders` },
    { icon: CreditCard, label: 'Payments', path: `/${slug}/dashboard/payments` },
    { icon: Warehouse, label: 'Inventory', path: `/${slug}/dashboard/inventory` },
    { icon: Users, label: 'Users', path: `/${slug}/dashboard/users` },
    { icon: FileText, label: 'Reports', path: `/${slug}/reports` },
    { icon: Settings, label: 'Settings', path: `/${slug}/settings` },
    { icon: HelpCircle, label: 'Help', path: `/${slug}/help` },
    { icon: LogOut, label: 'Logout', path: '/api/auth/signout', isAction: true },
  ]

  const handleNavigation = (item) => {
    setLoadingItem(item.path)
    if (item.isAction) {
      window.location.href = item.path
    } else {
      router.push(item.path)
    }
  }

  const handleSubmenuNavigation = (subItem) => {
    setLoadingItem(subItem.path)
    router.push(subItem.path)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col z-40',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
        {!isCollapsed && (
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            APOS
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            const hasActiveSubmenu = item.submenu?.some(sub => pathname === sub.path)

            return (
              <li key={item.label}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => {
                        if (isCollapsed) {
                          setIsCollapsed(false)
                        }
                        setProductsExpanded(!productsExpanded)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                        hasActiveSubmenu
                          ? 'bg-gray-800 text-white'
                          : 'hover:bg-gray-800 text-gray-300 hover:text-white',
                        isCollapsed && 'justify-center px-0'
                      )}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium text-sm">{item.label}</span>
                          <div className="ml-auto">
                            {productsExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {!isCollapsed && productsExpanded && (
                      <ul className="mt-1 ml-3 space-y-1 border-l-2 border-gray-700 pl-3">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.path

                          return (
                            <li key={subItem.label}>
                              <button
                                onClick={() => handleSubmenuNavigation(subItem)}
                                disabled={loadingItem === subItem.path}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                                  isSubActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                    : 'hover:bg-gray-800 text-gray-400 hover:text-white',
                                  loadingItem === subItem.path && 'opacity-75 cursor-wait'
                                )}
                              >
                                {loadingItem === subItem.path ? (
                                  <Loader2 size={16} className="flex-shrink-0 animate-spin" />
                                ) : (
                                  <SubIcon size={16} className="flex-shrink-0" />
                                )}
                                <span className="font-medium">{subItem.label}</span>
                                {isSubActive && loadingItem !== subItem.path && (
                                  <div className="ml-auto w-1 h-4 bg-white rounded-full" />
                                )}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation(item)}
                    disabled={loadingItem === item.path}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'hover:bg-gray-800 text-gray-300 hover:text-white',
                      isCollapsed && 'justify-center px-0',
                      loadingItem === item.path && 'opacity-75 cursor-wait'
                    )}
                    title={isCollapsed ? item.label : ''}
                  >
                    {loadingItem === item.path ? (
                      <Loader2 size={20} className="flex-shrink-0 animate-spin" />
                    ) : (
                      <Icon size={20} className="flex-shrink-0" />
                    )}
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                    {!isCollapsed && isActive && loadingItem !== item.path && (
                      <div className="ml-auto w-1 h-6 bg-white rounded-full" />
                    )}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 text-center">
            © 2025 APOS Dashboard
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar