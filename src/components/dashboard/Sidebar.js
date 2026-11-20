'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
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
  DollarSign,
  Calendar,
  UserPlus,
  UserCheck,
  X,
} from 'lucide-react'

const Sidebar = ({
  slug,
  isCollapsed,
  setIsCollapsed,
  isMobileViewport = false,
  isMobileOpen = false,
  onClose = () => {},
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const isCollapsedVisual = isCollapsed && !(isMobileViewport && isMobileOpen)
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [customersExpanded, setCustomersExpanded] = useState(true)
  const [expensesExpanded, setExpensesExpanded] = useState(true)
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
    {
      icon: Users,
      label: 'Customers',
      path: `/${slug}/dashboard/customers`,
      hasSubmenu: true,
      submenu: [
        { icon: List, label: 'Customers', path: `/${slug}/dashboard/customers` },
        { icon: Plus, label: 'Add New Customer', path: `/${slug}/dashboard/customers/new` },
        { icon: UserPlus, label: 'Deposit', path: `/${slug}/dashboard/customers/deposit` },
      ]
    },
    { icon: ShoppingCart, label: 'Sales', path: `/${slug}/dashboard/orders` },
    { icon: FileText, label: 'Inventory Report', path: `/${slug}/dashboard/inventory-report` },
    { icon: CreditCard, label: 'Payments', path: `/${slug}/dashboard/payments` },
    { icon: UserCheck, label: 'Who Owe Me', path: `/${slug}/dashboard/credits` },
      {
      icon: DollarSign,
      label: 'Expenses',
      path: `/${slug}/dashboard/expense`,
      hasSubmenu: true,
      submenu: [
        { icon: DollarSign, label: 'Expenses', path:  `/${slug}/dashboard/expense/table`},
        { icon: UserPlus, label: 'Add New Expense', path:  `/${slug}/dashboard/expense` },
      ]
    },
    { icon: Calendar, label: 'End of Day', path: `/${slug}/dashboard/eod` },
    { icon: Users, label: 'Users', path: `/${slug}/dashboard/users` },
    { icon: LayoutDashboard, label: 'Stores', path: `/dashboard` },
    { icon: Settings, label: 'Settings', path: `/${slug}/dashboard/settings` },
    { icon: HelpCircle, label: 'Help', path: 'whatsapp', isWhatsApp: true },
    { icon: LogOut, label: 'Logout', path: '/api/auth/signout', isAction: true },
  ]

  const handleNavigation = (item) => {
    setLoadingItem(item.path)
    onClose()
    if (item.isAction) {
      window.location.href = item.path
    } else {
      router.push(item.path)
    }
  }

  const handleSubmenuNavigation = (subItem) => {
    setLoadingItem(subItem.path)
    onClose()
    router.push(subItem.path)
  }

  return (
    <aside
      id="dashboard-sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-[100dvh] max-w-[85vw] flex-col bg-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out md:max-w-none md:translate-x-0 md:shadow-none',
        isCollapsedVisual ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      aria-hidden={isMobileViewport && !isMobileOpen}
      inert={isMobileViewport && !isMobileOpen}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 p-3 sm:p-4">
        <h2 className={cn(
          "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transition-all duration-300",
          isCollapsedVisual ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          MarketBook
        </h2>
        <button
          onClick={() => {
            if (isMobileViewport && isMobileOpen) {
              onClose()
              return
            }
            setIsCollapsed(!isCollapsedVisual)
          }}
          className="ml-auto min-h-11 min-w-11 rounded-lg p-2 transition-all duration-200 hover:bg-gray-800 lg:min-h-0 lg:min-w-0"
          aria-label={isMobileViewport && isMobileOpen ? 'Close sidebar' : isCollapsedVisual ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isMobileViewport && isMobileOpen ? (
            <X size={20} className="transition-transform duration-300" />
          ) : isCollapsedVisual ? (
            <ChevronRight size={20} className="transition-transform duration-300" />
          ) : (
            <ChevronLeft size={20} className="transition-transform duration-300" />
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

            if (item.isWhatsApp) {
              return (
                <li key={item.label}>
                  <a
                    href="https://wa.me/2349076361669"
                    onClick={onClose}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-green-700 text-gray-300 hover:text-white',
                      isCollapsedVisual && 'justify-center px-0'
                    )}
                    title={isCollapsedVisual ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsedVisual && (
                      <span className="font-medium text-sm transition-all duration-300 opacity-100">{item.label}</span>
                    )}
                  </a>
                </li>
              )
            }

            if (item.hasSubmenu && item.label === 'Expenses') {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      if (isCollapsedVisual) {
                        setIsCollapsed(false)
                      }
                      setExpensesExpanded(!expensesExpanded)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      hasActiveSubmenu
                        ? 'bg-gray-800 text-white'
                        : 'hover:bg-gray-800 text-gray-300 hover:text-white',
                      isCollapsedVisual && 'justify-center px-0'
                    )}
                    title={isCollapsedVisual ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsedVisual && (
                      <>
                        <span className="font-medium text-sm transition-all duration-300 opacity-100">{item.label}</span>
                        <div className="ml-auto transition-all duration-300">
                          {expensesExpanded ? (
                            <ChevronUp size={16} className="transition-transform duration-300" />
                          ) : (
                            <ChevronDown size={16} className="transition-transform duration-300" />
                          )}
                        </div>
                      </>
                    )}
                  </button>
                  {/* Submenu */}
                  {!isCollapsedVisual && expensesExpanded && (
                    <ul className="mt-1 ml-3 space-y-1 border-l-2 border-gray-700 pl-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                              <span className="font-medium transition-all duration-300">{subItem.label}</span>
                              {isSubActive && loadingItem !== subItem.path && (
                                <div className="ml-auto w-1 h-4 bg-white rounded-full transition-all duration-300" />
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.label}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => {
                        if (isCollapsedVisual) {
                          setIsCollapsed(false)
                        }
                        if (item.label === 'Products') {
                          setProductsExpanded(!productsExpanded)
                        } else if (item.label === 'Customers') {
                          setCustomersExpanded(!customersExpanded)
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                        hasActiveSubmenu
                          ? 'bg-gray-800 text-white'
                          : 'hover:bg-gray-800 text-gray-300 hover:text-white',
                        isCollapsedVisual && 'justify-center px-0'
                      )}
                      title={isCollapsedVisual ? item.label : ''}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsedVisual && (
                        <>
                          <span className="font-medium text-sm transition-all duration-300 opacity-100">{item.label}</span>
                          <div className="ml-auto transition-all duration-300">
                            {((item.label === 'Products' && productsExpanded) || (item.label === 'Customers' && customersExpanded)) ? (
                              <ChevronUp size={16} className="transition-transform duration-300" />
                            ) : (
                              <ChevronDown size={16} className="transition-transform duration-300" />
                            )}
                          </div>
                        </>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {!isCollapsedVisual && ((item.label === 'Products' && productsExpanded) || (item.label === 'Customers' && customersExpanded)) && (
                      <ul className="mt-1 ml-3 space-y-1 border-l-2 border-gray-700 pl-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                <span className="font-medium transition-all duration-300">{subItem.label}</span>
                                {isSubActive && loadingItem !== subItem.path && (
                                  <div className="ml-auto w-1 h-4 bg-white rounded-full transition-all duration-300" />
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
                      isCollapsedVisual && 'justify-center px-0',
                      loadingItem === item.path && 'opacity-75 cursor-wait'
                    )}
                    title={isCollapsedVisual ? item.label : ''}
                  >
                    {loadingItem === item.path ? (
                      <Loader2 size={20} className="flex-shrink-0 animate-spin" />
                    ) : (
                      <Icon size={20} className="flex-shrink-0" />
                    )}
                    {!isCollapsedVisual && (
                      <span className="font-medium text-sm transition-all duration-300 opacity-100">{item.label}</span>
                    )}
                    {!isCollapsedVisual && isActive && loadingItem !== item.path && (
                      <div className="ml-auto w-1 h-6 bg-white rounded-full transition-all duration-300" />
                    )}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-gray-800 transition-all duration-300",
        isCollapsedVisual ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
      )}>
        <div className="text-xs text-gray-400 text-center">
          © 2025 MarketBook Dashboard
        </div>
      </div>
    </aside>
  )
}

export default Sidebar