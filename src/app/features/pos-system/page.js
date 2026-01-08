import MainNav from "@/components/mainNav"
import { generateMetadata as genMeta } from "@/lib/seo"
import { generateSoftwareSchema, generateBreadcrumbSchema, generateFAQSchema, SchemaMarkup } from "@/lib/schema"
import { CheckCircle, Zap, BarChart3, Shield, ArrowRight, ShoppingCart, Smartphone, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

// SEO Metadata
export const metadata = genMeta({
  title: 'POS System - Fast & Reliable Point of Sale Software',
  description: 'Modern POS system with barcode scanning, multiple payment methods, offline mode, and automatic profit tracking. From ₦0/month. Try free - no credit card needed.',
  path: '/features/pos-system',
  keywords: [
    'POS system',
    'point of sale software',
    'retail Point of Sale',
    'Point of Sale system Nigeria',
    'barcode Point of Sales',
    'offline Point of Sale',
    'cloud Point of Sale',
    'restaurant Point of Sale',
    'small, medium and large business Point of Sale',
    'free Point of Sale software'
  ],
})

export default function POSSystemPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'POS System', url: '/features/pos-system' }
  ]

  const faqs = [
    {
      question: 'What is a POS system?',
      answer: 'A POS (Point of Sale) system is software that handles sales transactions, inventory tracking, and payment processing. MarketBook POS includes barcode scanning, multiple payment methods, receipt printing, and automatic profit calculation.'
    },
    {
      question: 'Does the POS system work offline?',
      answer: 'Yes! MarketBook POS works offline and automatically syncs when you reconnect to the internet. Your sales data is never lost, even without internet connection.'
    },
    {
      question: 'Can I use barcode scanners with MarketBook POS?',
      answer: 'Absolutely. MarketBook supports USB barcode scanners and can also generate barcodes for your products. Scan products for ultra-fast checkout.'
    },
    {
      question: 'Does the POS system calculate profit automatically?',
      answer: 'Yes! MarketBook automatically calculates profit for every sale by comparing selling price to cost price. See your daily profit in real-time on the dashboard.'
    },
    {
      question: 'What payment methods does the POS support?',
      answer: 'MarketBook POS supports cash, bank transfer, POS card payments, mobile money, and credit sales. Accept multiple payment methods in a single transaction.'
    },
    {
      question: 'Can I print receipts?',
      answer: 'Yes. MarketBook supports thermal printers (58mm and 80mm) and regular printers. Customize your receipt with your business logo and information.'
    },
    {
      question: 'Is there a free POS plan?',
      answer: 'Yes! MarketBook offers a forever-free plan with essential POS features including sales tracking, inventory management, and receipt printing. No credit card required.'
    },
    {
      question: 'Can I use the POS on mobile phones?',
      answer: 'Yes! MarketBook POS is fully responsive and works on smartphones, tablets, and computers. Sell anywhere, anytime.'
    }
  ]

  const softwareSchema = generateSoftwareSchema({
    name: 'MarketBook POS System',
    description: 'Complete point of sale system with barcode scanning, multiple payments, offline mode, and automatic profit tracking',
    url: 'https://marketbook.app/features/pos-system',
    featureList: [
      'Barcode Scanning',
      'Multiple Payment Methods',
      'Offline Mode',
      'Receipt Printing',
      'Automatic Profit Calculation',
      'Real-Time Inventory Updates',
      'Multi-Currency Support',
      'Touch-Screen Optimized',
      'Fast Checkout',
      'Sales History'
    ]
  })

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)
  const faqSchema = generateFAQSchema(faqs)

  return (
    <>
      <SchemaMarkup schema={softwareSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <SchemaMarkup schema={faqSchema} />
      
      <MainNav />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-8">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.name}>
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.url ? (
                  <Link href={crumb.url} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">{crumb.name}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Most Popular Feature
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                Lightning-Fast <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">POS System</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Complete point of sale system with <strong>barcode scanning</strong>, <strong>multiple payment methods</strong>, and <strong>automatic profit tracking</strong>. Works online and offline. Perfect for retail, restaurants, and service businesses.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Barcode Scanning</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ultra-fast checkout with USB scanners</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Offline Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Works without internet connection</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Multiple Payments</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cash, transfer, POS, mobile money</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Auto Profit Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Know your profit on every sale</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/subscription" className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-blue-600 dark:border-blue-400 text-center">
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Point of Sale</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing transaction...</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Product A</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₦2,500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Product B</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₦1,800</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Product C</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₦3,200</span>
                  </div>
                  
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">₦7,500</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-green-600 dark:text-green-400 font-medium">Profit</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">₦2,100</span>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5" />
                      Complete Sale (2.3s)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-white dark:bg-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need in a POS System
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Powerful features designed to make selling faster, easier, and more profitable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast Checkout</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Process sales in under 3 seconds with barcode scanning. Touch-optimized interface for speed. Serve more customers, make more money.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-green-200 dark:border-green-900">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Automatic Profit Calculation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See profit on every sale instantly. System compares selling price to cost price automatically. Know exactly how much you're making.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Works Offline</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No internet? No problem. MarketBook POS works offline and syncs automatically when you reconnect. Never lose a sale.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-orange-200 dark:border-orange-900">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-Time Reports</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  View sales, profit, and best-selling products in real-time. Daily, weekly, and monthly reports. Make data-driven decisions.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-900">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mobile Friendly</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use on phone, tablet, or computer. Fully responsive design. Sell from anywhere - your shop, market stall, or customer's location.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-900">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multiple Payment Methods</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Accept cash, bank transfer, POS cards, and credit sales. Split payments across multiple methods in one transaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 group">
                <summary className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer flex justify-between items-center">
                  {faq.question}
                  <span className="text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Sales Process?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 10,000+ businesses using MarketBook POS. Start free today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-all border-2 border-white">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
