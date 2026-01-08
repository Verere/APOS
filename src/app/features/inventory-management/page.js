import MainNav from "@/components/mainNav"
import { generateMetadata as genMeta } from "@/lib/seo"
import { generateSoftwareSchema, generateBreadcrumbSchema, generateFAQSchema, SchemaMarkup } from "@/lib/schema"
import { CheckCircle, Package, AlertTriangle, TrendingUp, ArrowRight, BarChart3, Bell, DollarSign } from "lucide-react"
import Link from "next/link"

// SEO Metadata
export const metadata = genMeta({
  title: 'Inventory Management Software - Track Stock in Real-Time',
  description: 'Smart inventory management with real-time stock tracking, low stock alerts, automatic reorder notifications, and total inventory valuation. Know exactly what you have and what it\'s worth.',
  path: '/features/inventory-management',
  keywords: [
    'inventory management software',
    'stock control',
    'inventory tracking',
    'stock management system',
    'inventory software Nigeria',
    'low stock alerts',
    'inventory valuation',
    'reorder notifications',
    'stock management app',
    'inventory control system'
  ],
})

export default function InventoryManagementPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Inventory Management', url: '/features/inventory-management' }
  ]

  const faqs = [
    {
      question: 'How does MarketBook track inventory?',
      answer: 'MarketBook automatically updates inventory in real-time as you make sales, add new stock, or adjust quantities. Every transaction is tracked, giving you accurate stock levels at all times.'
    },
    {
      question: 'Can I see the total value of my inventory?',
      answer: 'Yes! MarketBook calculates your total inventory value automatically by multiplying stock quantity by cost price for all products. View this on your dashboard anytime.'
    },
    {
      question: 'How do low stock alerts work?',
      answer: 'Set a minimum stock level for each product. When stock falls below this level, MarketBook alerts you immediately so you can reorder before running out.'
    },
    {
      question: 'Can I track inventory across multiple stores?',
      answer: 'Yes. MarketBook Professional and Enterprise plans support multi-store inventory tracking. View stock levels for all locations in one dashboard.'
    },
    {
      question: 'Does the system prevent selling out-of-stock items?',
      answer: 'Yes. When a product reaches zero stock, MarketBook prevents it from being sold until you restock. This prevents overselling and customer disappointment.'
    },
    {
      question: 'Can I import my existing inventory?',
      answer: 'Yes! Import your product list using Excel/CSV files. MarketBook supports bulk import with product name, cost price, selling price, quantity, and other details.'
    },
    {
      question: 'How do I handle damaged or expired stock?',
      answer: 'Use the Stock Adjustment feature to remove damaged or expired items from inventory. The system tracks all adjustments with reasons and dates for your records.'
    },
    {
      question: 'Can I generate barcode labels for my products?',
      answer: 'Yes! MarketBook generates barcode labels for all products. Print labels and attach them to products for fast scanning at checkout.'
    }
  ]

  const softwareSchema = generateSoftwareSchema({
    name: 'MarketBook Inventory Management',
    description: 'Complete inventory management system with real-time tracking, low stock alerts, automatic valuation, and reorder notifications',
    url: 'https://marketbook.app/features/inventory-management',
    featureList: [
      'Real-Time Stock Tracking',
      'Automatic Inventory Valuation',
      'Low Stock Alerts',
      'Reorder Notifications',
      'Multi-Location Inventory',
      'Stock Adjustment Tools',
      'Inventory Reports',
      'Barcode Generation',
      'Bulk Import/Export',
      'Product Categories'
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
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-8">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.name}>
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.url ? (
                  <Link href={crumb.url} className="hover:text-green-600 dark:hover:text-green-400">
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
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Package className="w-4 h-4" />
                Essential for Every Business
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Smart Inventory</span> That Thinks Ahead
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Never run out of stock again. <strong>Real-time tracking</strong>, <strong>automatic alerts</strong>, and <strong>total value calculation</strong>. Know exactly what you have, where it is, and what it's worth - all in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Real-Time Updates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stock levels update with every sale</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified before you run out</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Total Value Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Know your inventory's worth instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Reorder Reminders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automated notifications to restock</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2">
                  Start Managing Inventory Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/subscription" className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-green-600 dark:border-green-400 text-center">
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Inventory Overview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Real-time stock levels</p>
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Live</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Premium Rice (50kg)</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">45 bags</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Vegetable Oil (25L)</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-bold">8 cartons</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-yellow-700 dark:text-yellow-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Low stock - Reorder soon</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Indomie Noodles</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">2 cartons</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '10%'}}></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-red-700 dark:text-red-400">
                      <Bell className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-medium">Critical! Reorder immediately</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Inventory Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₦2,450,000</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
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
                Complete Inventory Control
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need to manage stock efficiently and profitably
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-green-200 dark:border-green-900">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-Time Stock Updates</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Inventory updates automatically with every sale, purchase, or adjustment. Always know your exact stock levels across all products and locations.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Total Value Calculation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Know exactly how much money is tied up in inventory. Automatic calculation based on cost price × quantity. Track inventory as a business asset.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-900">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Low Stock Alerts</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set minimum stock levels for each product. Get instant alerts when stock is running low. Never lose sales due to out-of-stock items.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-red-200 dark:border-red-900">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reorder Notifications</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automated reminders to reorder products before they run out. Set reorder points and suppliers. Maintain optimal stock levels effortlessly.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Stock Adjustments</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Easily adjust inventory for damaged, expired, or transferred stock. Full audit trail with reasons and dates. Complete transparency.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-900">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Inventory Reports</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed reports showing stock movement, turnover rates, slow-moving items, and inventory value over time. Make smart purchasing decisions.
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
                  <span className="text-green-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Take Control of Your Inventory Today
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join 10,000+ businesses managing inventory smarter with MarketBook. Start free - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-all border-2 border-white">
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
