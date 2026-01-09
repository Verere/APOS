'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Package, 
  ArrowUpRight,
  Clock,
  Zap
} from 'lucide-react'

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('warning') // 'warning', 'error', 'info'

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
        checkSubscriptionStatus(data)
      } else {
        setShowNotification(true)
        setNotificationType('error')
        setNotificationMessage('No active subscription found. Subscribe now to unlock full features.')
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      setShowNotification(true)
      setNotificationType('error')
      setNotificationMessage('Unable to load subscription information.')
    } finally {
      setLoading(false)
    }
  }

  const checkSubscriptionStatus = (data) => {
    if (!data?.subscription) {
      setShowNotification(true)
      setNotificationType('error')
      setNotificationMessage('No active subscription found. Subscribe now to unlock full features.')
      return
    }

    const { subscription: sub } = data
    
    // Check if expired
    if (sub.status === 'EXPIRED') {
      setShowNotification(true)
      setNotificationType('error')
      setNotificationMessage('Your subscription has expired. Renew now to continue using premium features.')
      return
    }

    // Check if cancelled
    if (sub.status === 'CANCELLED') {
      setShowNotification(true)
      setNotificationType('warning')
      setNotificationMessage('Your subscription is cancelled. Reactivate to continue accessing features.')
      return
    }

    // Check if expiring soon (less than 30 days)
    if (sub.endDate) {
      const endDate = new Date(sub.endDate)
      const today = new Date()
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

      if (daysRemaining <= 30 && daysRemaining > 0) {
        setShowNotification(true)
        setNotificationType('warning')
        setNotificationMessage(`Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid interruption.`)
      } else if (daysRemaining <= 0) {
        setShowNotification(true)
        setNotificationType('error')
        setNotificationMessage('Your subscription has expired. Renew now to continue using premium features.')
      }
    }
  }

  // Only show card when there's a subscription issue
  const shouldShowCard = () => {
    if (loading) return true // Show loading state
    if (!subscription?.subscription) return true // No subscription
    
    const status = subscription.subscription.status
    if (status === 'EXPIRED' || status === 'CANCELLED' || status === 'SUSPENDED') return true
    if (status === 'TRIAL') return true // Always show trial subscriptions
    
    // Check if expiring soon
    if (subscription.subscription.endDate) {
      const endDate = new Date(subscription.subscription.endDate)
      const today = new Date()
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
      if (daysRemaining <= 0) return true // Already expired
    }
    
    return false // Active subscription with no issues
  }

  // Don't render anything if subscription is active and healthy
  if (!shouldShowCard()) {
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'TRIAL':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'EXPIRED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'CANCELLED':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'SUSPENDED':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />
      case 'TRIAL':
        return <Clock className="w-4 h-4" />
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getNotificationColor = () => {
    switch (notificationType) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notification Banner */}
      {showNotification && (
        <div className={`rounded-xl border-2 p-4 ${getNotificationColor()} transition-all duration-300`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notificationMessage}</p>
              <Link 
                href="/subscription" 
                className="inline-flex items-center gap-1 mt-2 text-sm font-semibold hover:underline"
              >
                {notificationType === 'error' || notificationType === 'warning' ? 'View Plans' : 'Manage Subscription'}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Subscription
                </h3>
                {subscription?.subscription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subscription.subscription.packageName} Plan
                  </p>
                )}
              </div>
            </div>
            {subscription?.subscription && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(subscription.subscription.status)}`}>
                {getStatusIcon(subscription.subscription.status)}
                {subscription.subscription.status}
              </span>
            )}
          </div>

          {subscription?.subscription ? (
            <div className="space-y-4">
              {/* Subscription Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Start Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(subscription.subscription.startDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    End Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(subscription.subscription.endDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Billing Cycle
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.subscription.billingCycle}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Auto Renew
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Trial Info */}
              {subscription.subscription.status === 'TRIAL' && subscription.subscription.trialEndDate && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Trial Period
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                        Your trial ends on {formatDate(subscription.subscription.trialEndDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/subscription"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Package className="w-4 h-4" />
                  Manage Subscription
                </Link>
                <Link
                  href="/subscription/usage"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  View Usage
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <XCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                No Active Subscription
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Subscribe to unlock full features and grow your business
              </p>
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Package className="w-4 h-4" />
                View Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
