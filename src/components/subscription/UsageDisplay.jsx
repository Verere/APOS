'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Store, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function UsageDisplay({ userId }) {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscription/usage')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsage(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (current, limit) => {
    if (limit === 'Unlimited' || limit >= 1000000) return 0
    return Math.min(Math.round((current / limit) * 100), 100)
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageTextColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const formatLimit = (limit) => {
    if (limit === 'Unlimited' || limit >= 1000000) return 'Unlimited'
    return limit.toLocaleString()
  }

  const UsageCard = ({ icon: Icon, label, current, limit, color }) => {
    const percentage = getUsagePercentage(current, limit)
    const isNearLimit = percentage >= 75

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {current.toLocaleString()}
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  {' / '}{formatLimit(limit)}
                </span>
              </p>
            </div>
          </div>
          {isNearLimit && limit !== 'Unlimited' && (
            <AlertCircle className={`w-5 h-5 ${getUsageTextColor(percentage)}`} />
          )}
        </div>

        {/* Progress Bar */}
        {limit !== 'Unlimited' && limit < 1000000 && (
          <div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${getUsageColor(percentage)}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${getUsageTextColor(percentage)}`}>
                {percentage}% used
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {limit - current} remaining
              </span>
            </div>
            {isNearLimit && (
              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Consider upgrading to avoid hitting your limit
              </p>
            )}
          </div>
        )}
        
        {(limit === 'Unlimited' || limit >= 1000000) && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">No limits</span>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!usage) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-300">Unable to load usage information</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscription Usage
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {usage.subscription?.displayName || 'Free'} Plan
            </p>
          </div>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <TrendingUp className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {usage.usage?.storesCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Stores
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {usage.usage?.productsCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Products
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {usage.usage?.usersCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Users
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {usage.usage?.ordersCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Orders
            </p>
          </div>
        </div>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard
          icon={Store}
          label="Stores"
          current={usage.usage?.storesCount || 0}
          limit={usage.limits?.maxStores || 0}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <UsageCard
          icon={Package}
          label="Products"
          current={usage.usage?.productsCount || 0}
          limit={usage.limits?.maxProducts || 0}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <UsageCard
          icon={Users}
          label="Team Members"
          current={usage.usage?.usersCount || 0}
          limit={usage.limits?.maxUsers || 0}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <UsageCard
          icon={ShoppingCart}
          label="Orders"
          current={usage.usage?.ordersCount || 0}
          limit={usage.limits?.maxOrders || 0}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Upgrade CTA */}
      {usage.subscription?.packageName !== 'ENTERPRISE' && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need More Capacity?</h3>
              <p className="text-blue-100">
                Upgrade your plan to unlock higher limits and premium features
              </p>
            </div>
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              View Plans
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
