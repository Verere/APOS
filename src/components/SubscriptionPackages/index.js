'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PaystackButton } from 'react-paystack'
import {
  Check,
  X,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
  Package,
  Users,
  ShoppingBag,
  Database,
  Shield,
  Crown,
  Sparkles,
  Globe,
  Loader2,
} from 'lucide-react'
import { currencyFormat } from '@/utils/currency'
import { 
  getSuggestedCurrency, 
  convertCurrency, 
  formatCurrency,
  CURRENCY_SYMBOLS 
} from '@/utils/currencyConverter'
import { 
  initializeSubscriptionPayment, 
  generatePaystackReference,
  getPaystackErrorMessage 
} from '@/lib/paystackConfig'
import { toast } from 'react-toastify'
import MainNav from '../mainNav'

export default function SubscriptionPackages() {
  const [billingCycle, setBillingCycle] = useState('yearly')
  const [selectedCurrency, setSelectedCurrency] = useState('NGN')
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [userStoreId, setUserStoreId] = useState(null)
  
  const { data: session } = useSession()
  const router = useRouter()

  const packages = [
    {
      name: 'FREE',
      displayName: 'Free Starter',
      description: 'Perfect for trying out MarketBook',
      price: { semiannual: 0, yearly: 0 },
      icon: Package,
      color: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-200',
      features: {
        maxStores: 1,
        maxProducts: 10,
        maxUsers: 1,
        maxOrders: 100,
        storage: '500MB',
        included: [
          'Basic POS functionality',
          'Product management',
          'Sales tracking',
          'Basic reporting',
          'Email support'
        ]
      }
    },
    {
      name: 'STARTER',
      displayName: 'Starter',
      description: 'Perfect for new businesses',
      price: { semiannual: 35000, yearly: 70000 },
      icon: Zap,
      color: 'from-teal-500 to-cyan-600',
      borderColor: 'border-teal-200',
      features: {
        maxStores: 1,
        maxProducts: 50,
        maxUsers: 2,
        maxOrders: 500,
        storage: '2GB',
        included: [
          'Everything in Free',
          'Basic inventory management',
          'Customer management',
          'Sales tracking',
          'Basic reporting',
          'Email support',
          'Receipt printing'
        ]
      },
      trialDays: 7
    },
    {
      name: 'BASIC',
      displayName: 'Basic',
      description: 'Great for small businesses',
      price: { semiannual: 60000, yearly: 120000 },
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-200',
      isPopular: true,
      features: {
        maxStores: 2,
        maxProducts: 500,
        maxUsers: 5,
        maxOrders: 1000,
        storage: '5GB',
        included: [
          'Everything in Free',
          'Inventory management',
          'Customer management',
          'Credit sales',
          'Payment tracking',
          'Advanced reporting',
          'Email & chat support',
          'Multiple payment methods',
          'Receipt customization'
        ]
      },
      trialDays: 14
    },
    {
      name: 'PROFESSIONAL',
      displayName: 'Professional',
      description: 'For growing businesses',
      price: { semiannual: 110000, yearly: 220000 },
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-300',
      features: {
        maxStores: 5,
        maxProducts: 5000,
        maxUsers: 20,
        maxOrders: 10000,
        storage: '50GB',
        included: [
          'Everything in Basic',
          'Multi-store management',
          'Advanced inventory tracking',
          'Employee management',
          'Expense tracking',
          'End of day reports',
          'Priority support',
          'Price adjustment permissions',
          'Custom user roles',
          'Export data (Excel/PDF)',
          'WhatsApp invoice sharing',
          'Barcode printing'
        ]
      },
      trialDays: 30
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise',
      description: 'For large businesses',
      price: { semiannual: 250000, yearly: 500000 },
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-300',
      features: {
        maxStores: 'Unlimited',
        maxProducts: 'Unlimited',
        maxUsers: 'Unlimited',
        maxOrders: 'Unlimited',
        storage: 'Unlimited',
        included: [
          'Everything in Professional',
          'Unlimited everything',
          'Advanced analytics & insights',
          'API access',
          '24/7 dedicated support',
          'Custom integrations',
          'White-label options',
          'Advanced security',
          'Custom training',
          'Dedicated account manager',
          'SLA guarantees',
          'Data migration assistance'
        ]
      },
      trialDays: 30
    }
  ]

  const calculateSavings = (monthly, yearly) => {
    if (monthly === 0) return 0
    return (monthly * 12) - yearly
  }

  // Detect user's currency on component mount
  useEffect(() => {
    const detectCurrency = async () => {
      setIsLoadingCurrency(true)
      try {
        const suggestedCurrency = await getSuggestedCurrency()
        setSelectedCurrency(suggestedCurrency.code)
      } catch (error) {
        console.error('Failed to detect currency:', error)
        setSelectedCurrency('NGN') // Fallback to NGN
      } finally {
        setIsLoadingCurrency(false)
      }
    }
    
    detectCurrency()
  }, [])

  // Fetch user's store ID when session is available
  useEffect(() => {
    const fetchUserStore = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/stores/mine')
          if (response.ok) {
            const stores = await response.json()
            if (stores && stores.length > 0) {
              setUserStoreId(stores[0].storeId)
            }
          }
        } catch (error) {
          console.error('Failed to fetch user store:', error)
        }
      }
    }
    
    fetchUserStore()
  }, [session])

  // Convert price to selected currency
  const getConvertedPrice = (priceInNGN) => {
    if (priceInNGN === 0) return 0
    return convertCurrency(priceInNGN, selectedCurrency)
  }

  // Format price with selected currency
  const formatPrice = (priceInNGN) => {
    if (priceInNGN === 0) return 'Free'
    const converted = getConvertedPrice(priceInNGN)
    return formatCurrency(converted, selectedCurrency)
  }

  // Paystack payment configuration
  const getPaystackConfig = (pkg, amount) => {
    if (!session?.user?.email) {
      console.error('No user email found for payment')
      return {}
    }
    
    const reference = generatePaystackReference('SUB')
    
    const config = initializeSubscriptionPayment({
      email: session.user.email,
      amount: amount, // Amount in NGN
      reference: reference,
      metadata: {
        userId: session.user.id || session.user.email,
        packageName: pkg.name,
        packageDisplayName: pkg.displayName,
        billingCycle: billingCycle.toUpperCase(),
        originalCurrency: selectedCurrency,
        customerName: session.user.name || session.user.email
      }
    })
    
    console.log('Paystack Config:', { reference, email: session.user.email, amount })
    return config
  }

  // Payment success callback
  const onPaymentSuccess = async (reference, pkg) => {
    setProcessingPayment(true)
    
    try {
    //   console.log('Payment success callback:', { reference, packageName: pkg?.name })
      
      // Verify payment and activate subscription
      const response = await fetch('/api/subscription/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.reference,
          packageId: pkg?.name,
          billingCycle: billingCycle.toUpperCase(),
          storeId: userStoreId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Payment successful! Subscription activated.')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Failed to verify payment. Please contact support.')
    } finally {
      setProcessingPayment(false)
      setSelectedPackage(null)
    }
  }

  // Payment close callback
  const onPaymentClose = () => {
    setProcessingPayment(false)
    setSelectedPackage(null)
    toast.info('Payment cancelled')
  }

  // Handle subscription payment
  const handleSubscribe = (pkg) => {
    console.log('Handle Subscribe clicked:', pkg.name, 'Session:', !!session)
    
    // Check if user is logged in
    if (!session) {
      toast.error('Please login to subscribe')
      router.push('/login')
      return
    }

    // Free package - no payment needed
    if (pkg.name === 'FREE') {
      handleFreeSubscription(pkg)
      return
    }

    // Set selected package
    setSelectedPackage(pkg)
    
    // If not NGN, show message about NGN conversion
    if (selectedCurrency !== 'NGN') {
      toast.info('Payment will be processed in Nigerian Naira (NGN)')
    }

    // Payment will be triggered via PaystackButton component
  }

  // Handle free subscription activation
  const handleFreeSubscription = async (pkg) => {
    try {
      setProcessingPayment(true)
      
      const response = await fetch('/api/subscription/activate-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: pkg.name,
          billingCycle: billingCycle.toUpperCase(),
          storeId: userStoreId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Free subscription activated successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Failed to activate subscription')
      }
    } catch (error) {
      console.error('Free subscription error:', error)
      toast.error('Failed to activate subscription')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 sm:py-16 lg:py-20">
      <MainNav/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900">
              Choose Your Plan
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Select the perfect subscription package for your business needs
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-white rounded-full p-2 shadow-lg max-w-md mx-auto">
            <button
              onClick={() => setBillingCycle('semiannual')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'semiannual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>

          {/* Currency Selector - Hidden */}
          <div className="hidden mt-6 items-center justify-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              disabled={isLoadingCurrency}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="NGN">🇳🇬 Nigerian Naira (₦)</option>
              <option value="GHS">🇬🇭 Ghanaian Cedi (GH₵)</option>
              <option value="KES">🇰🇪 Kenyan Shilling (KSh)</option>
              <option value="ZAR">🇿🇦 South African Rand (R)</option>
              <option value="EGP">🇪🇬 Egyptian Pound (E£)</option>
              <option value="MAD">🇲🇦 Moroccan Dirham (MAD)</option>
              <option value="TZS">🇹🇿 Tanzanian Shilling (TSh)</option>
              <option value="UGX">🇺🇬 Ugandan Shilling (USh)</option>
              <option value="XOF">West African CFA (CFA)</option>
              <option value="XAF">Central African CFA (FCFA)</option>
              <option value="ETB">🇪🇹 Ethiopian Birr (Br)</option>
              <option value="RWF">🇷🇼 Rwandan Franc (FRw)</option>
              <option value="BWP">🇧🇼 Botswana Pula (P)</option>
              <option value="MUR">🇲🇺 Mauritian Rupee (₨)</option>
              <option value="ZMW">🇿🇲 Zambian Kwacha (ZK)</option>
              <option value="USD">🇺🇸 US Dollar ($)</option>
              <option value="EUR">🇪🇺 Euro (€)</option>
              <option value="GBP">🇬🇧 British Pound (£)</option>
            </select>
            {isLoadingCurrency && (
              <span className="text-xs text-blue-600 animate-pulse">Detecting your location...</span>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {packages.map((pkg) => {
            const Icon = pkg.icon
            const price = billingCycle === 'monthly' ? pkg.price.monthly : pkg.price.yearly
            const savings = billingCycle === 'yearly' ? calculateSavings(pkg.price.monthly, pkg.price.yearly) : 0
            
            return (
              <div
                key={pkg.name}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${pkg.borderColor} ${
                  pkg.isPopular ? 'scale-105 lg:scale-110' : ''
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-bold rounded-bl-2xl flex items-center gap-1">
                    <Star className="w-3 h-3" fill="currentColor" />
                    MOST POPULAR
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${pkg.color} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.displayName}</h3>
                  <p className="text-sm text-gray-600 mb-6">{pkg.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Save {formatPrice(savings)}/year
                      </p>
                    )}
                    {pkg.trialDays && (
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        {pkg.trialDays} days free trial
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  {pkg.name === 'FREE' || !session ? (
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={processingPayment}
                      className={`w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${pkg.color} hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {processingPayment && selectedPackage?.name === pkg.name ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {pkg.name === 'FREE' ? 'Start Free' : session ? 'Subscribe Now' : 'Login to Subscribe'}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full">
                      <PaystackButton
                        {...getPaystackConfig(pkg, price)}
                        text={
                          processingPayment && selectedPackage?.name === pkg.name 
                            ? 'Processing...' 
                            : 'Subscribe Now'
                        }
                        onSuccess={(reference) => {
                          setSelectedPackage(pkg)
                          onPaymentSuccess(reference, pkg)
                        }}
                        onClose={() => {
                          setSelectedPackage(pkg)
                          onPaymentClose()
                        }}
                        className={`w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${pkg.color} hover:shadow-xl transition-all mb-6`}
                      />
                    </div>
                  )}

                  {/* Limits */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong className="text-gray-900">{pkg.features.maxStores}</strong> {pkg.features.maxStores === 1 ? 'Store' : 'Stores'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong className="text-gray-900">{pkg.features.maxProducts}</strong> Products
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong className="text-gray-900">{pkg.features.maxUsers}</strong> Users
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        <strong className="text-gray-900">{pkg.features.storage}</strong> Storage
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {pkg.features.included.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ or Contact Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom plan or have questions?
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}
