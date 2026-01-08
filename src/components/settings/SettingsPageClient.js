'use client'
import { useState, useEffect } from 'react'
import {
  User,
  Store,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  CreditCard,
  Printer,
  Database,
  AlertCircle,
  Check,
  ChevronRight,
  Save,
  X,
  Settings,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'

export default function SettingsPageClient({ slug, user }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [saveStatus, setSaveStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [formData, setFormData] = useState({
    // Profile
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    avatar: '',
    
    // Store
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    taxId: '',
    currency: 'NGN',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    lowStockAlerts: true,
    paymentAlerts: true,
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: '30',
    
    // Appearance
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    
    // Printing
    receiptFormat: 'standard',
    autoPrint: false,
    printerName: '',
    
    // POS Settings
    allowCreditSales: true,
    allowPriceAdjustment: false,
  })

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/settings/${slug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setFormData(prev => ({
              ...prev,
              ...data.settings,
              name: user?.name || prev.name,
              email: user?.email || prev.email,
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [slug, user])

  // Fetch subscription data when subscription tab is active
  useEffect(() => {
    const fetchSubscription = async () => {
      if (activeTab === 'subscription' && !subscriptionData) {
        try {
          setLoadingSubscription(true)
          const response = await fetch('/api/subscription/current')
          if (response.ok) {
            const data = await response.json()
            setSubscriptionData(data.subscription)
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
        } finally {
          setLoadingSubscription(false)
        }
      }
    }

    fetchSubscription()
  }, [activeTab, subscriptionData])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'store', label: 'Store Settings', icon: Store, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'pos', label: 'POS Settings', icon: ShoppingCart, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'printing', label: 'Printing', icon: Printer, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      const response = await fetch(`/api/settings/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus(null), 3000)
        console.error('Save error:', data.error)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
      console.error('Error saving settings:', error)
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{user?.name || 'User'}</h3>
            <p className="text-blue-100">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="+234 800 000 0000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Profile Visibility</p>
          <p className="text-amber-700">Your profile information is visible only to store members.</p>
        </div>
      </div>
    </div>
  )

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Store Configuration</h3>
        <p className="text-green-100">Manage your store details and business information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Store Name
          </label>
          <input
            type="text"
            value={formData.storeName}
            onChange={(e) => handleInputChange('storeName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Enter store name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Store Address
          </label>
          <textarea
            value={formData.storeAddress}
            onChange={(e) => handleInputChange('storeAddress', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            rows="3"
            placeholder="Enter store address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Store Phone
          </label>
          <input
            type="tel"
            value={formData.storePhone}
            onChange={(e) => handleInputChange('storePhone', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            placeholder="+234 800 000 0000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Store Email
          </label>
          <input
            type="email"
            value={formData.storeEmail}
            onChange={(e) => handleInputChange('storeEmail', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            placeholder="store@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tax ID / Business Number
          </label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Tax ID"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          >
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="GHS">Ghanaian Cedi (GH₵)</option>
            <option value="KES">Kenyan Shilling (KSh)</option>
            <option value="ZAR">South African Rand (R)</option>
            <option value="EGP">Egyptian Pound (E£)</option>
            <option value="MAD">Moroccan Dirham (MAD)</option>
            <option value="TZS">Tanzanian Shilling (TSh)</option>
            <option value="UGX">Ugandan Shilling (USh)</option>
            <option value="XOF">West African CFA Franc (CFA)</option>
            <option value="XAF">Central African CFA Franc (FCFA)</option>
            <option value="ETB">Ethiopian Birr (Br)</option>
            <option value="RWF">Rwandan Franc (FRw)</option>
            <option value="BWP">Botswana Pula (P)</option>
            <option value="MUR">Mauritian Rupee (₨)</option>
            <option value="ZMW">Zambian Kwacha (ZK)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionSettings = () => {
    if (loadingSubscription) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!subscriptionData) {
      return (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-8 text-white text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Active Subscription</h3>
          <p className="mb-6 text-yellow-100">You don't have an active subscription yet.</p>
          <a
            href="/subscription"
            className="inline-block px-6 py-3 bg-white text-yellow-600 font-bold rounded-lg hover:bg-yellow-50 transition-all"
          >
            View Subscription Plans
          </a>
        </div>
      )
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const getStatusColor = (status) => {
      const colors = {
        ACTIVE: 'bg-green-100 text-green-800',
        TRIAL: 'bg-blue-100 text-blue-800',
        EXPIRED: 'bg-red-100 text-red-800',
        CANCELLED: 'bg-gray-100 text-gray-800',
        SUSPENDED: 'bg-orange-100 text-orange-800'
      }
      return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getDaysRemaining = () => {
      const endDate = new Date(subscriptionData.endDate)
      const today = new Date()
      const diffTime = endDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">Your Subscription</h3>
          <p className="text-blue-100">Manage your subscription plan and billing</p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{subscriptionData.packageName} Plan</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscriptionData.status)}`}>
                {subscriptionData.status}
              </span>
            </div>
            <CreditCard className="w-12 h-12 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
              <p className="text-lg font-semibold text-gray-900">{subscriptionData.billingCycle}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscriptionData.currency} {subscriptionData.amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(subscriptionData.startDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">End Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(subscriptionData.endDate)}</p>
            </div>
          </div>

          {/* Days Remaining */}
          {subscriptionData.status === 'ACTIVE' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">
                  {getDaysRemaining() > 0 
                    ? `${getDaysRemaining()} days remaining in your subscription`
                    : 'Your subscription has expired'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Auto Renew Status */}
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Auto-Renewal</p>
              <p className="text-sm text-gray-600">
                {subscriptionData.autoRenew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${subscriptionData.autoRenew ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${subscriptionData.autoRenew ? 'translate-x-6' : 'translate-x-1'} mt-0.5`}></div>
            </div>
          </div>

          {/* Payment Method */}
          {subscriptionData.paymentMethod && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">{subscriptionData.paymentMethod}</span>
              </div>
            </div>
          )}

          {/* Transaction Reference */}
          {subscriptionData.transactionReference && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Transaction Reference</p>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-lg">
                {subscriptionData.transactionReference}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <a
            href="/subscription"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Upgrade Plan
          </a>
          {subscriptionData.status === 'ACTIVE' && (
            <button
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Notification Preferences</h3>
        <p className="text-purple-100">Choose how you want to be notified</p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
          { id: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS', icon: Smartphone },
          { id: 'orderAlerts', label: 'New Order Alerts', description: 'Get notified when new orders are placed', icon: ShoppingCart },
          { id: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Alert when products are running low', icon: AlertCircle },
          { id: 'paymentAlerts', label: 'Payment Alerts', description: 'Notifications for payment activities', icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData[item.id]}
                    onChange={(e) => handleInputChange(item.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Security Settings</h3>
        <p className="text-red-100">Protect your account and data</p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-500">Add an extra layer of security</div>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.twoFactorEnabled}
              onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <select
            value={formData.sessionTimeout}
            onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Change Password
          </label>
          <button className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-semibold mb-1">Security Recommendation</p>
          <p className="text-red-700">We recommend enabling two-factor authentication for enhanced security.</p>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Appearance & Localization</h3>
        <p className="text-indigo-100">Customize your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={formData.dateFormat}
            onChange={(e) => handleInputChange('dateFormat', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={formData.timeFormat}
            onChange={(e) => handleInputChange('timeFormat', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderPrintingSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Printing Configuration</h3>
        <p className="text-orange-100">Configure receipt and document printing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Receipt Format
          </label>
          <select
            value={formData.receiptFormat}
            onChange={(e) => handleInputChange('receiptFormat', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
          >
            <option value="standard">Standard (80mm)</option>
            <option value="compact">Compact (58mm)</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Printer Name
          </label>
          <input
            type="text"
            value={formData.printerName}
            onChange={(e) => handleInputChange('printerName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Default printer"
          />
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Printer className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Auto-Print Receipts</div>
              <div className="text-sm text-gray-500">Automatically print after each transaction</div>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.autoPrint}
              onChange={(e) => handleInputChange('autoPrint', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
          </div>
        </label>
      </div>
    </div>
  )

  const renderPOSSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">POS & Sales Settings</h3>
        <p className="text-cyan-100">Configure point of sale and sales behavior</p>
      </div>

      <div className="space-y-4">
        {/* Allow Credit Sales */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-cyan-300 transition-colors">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Allow Credit Sales</div>
                <div className="text-sm text-gray-500">Enable customers to buy on credit with partial or no payment</div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.allowCreditSales}
                onChange={(e) => handleInputChange('allowCreditSales', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
            </div>
          </label>
        </div>

        {/* Allow Price Adjustment */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-cyan-300 transition-colors">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Allow Price Adjustment in Cart</div>
                <div className="text-sm text-gray-500">Let users modify item prices during checkout</div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.allowPriceAdjustment}
                onChange={(e) => handleInputChange('allowPriceAdjustment', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-cyan-800">
          <p className="font-semibold mb-1">Owner Permissions</p>
          <p className="text-cyan-700">These settings control critical sales behavior. Only owners can modify these permissions.</p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'store':
        return renderStoreSettings()
      case 'subscription':
        return renderSubscriptionSettings()
      case 'pos':
        return renderPOSSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'printing':
        return renderPrintingSettings()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">Manage your preferences and configurations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2 sticky top-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? `${tab.bgColor} ${tab.color} font-semibold shadow-md`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden bg-white rounded-2xl shadow-lg p-2">
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                        isActive
                          ? `${tab.bgColor} ${tab.color} font-semibold shadow-md`
                          : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              {renderContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || loading}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : saveStatus === 'success' ? (
                      <>
                        <Check className="w-5 h-5" />
                        Saved Successfully!
                      </>
                    ) : saveStatus === 'error' ? (
                      <>
                        <X className="w-5 h-5" />
                        Save Failed
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
