import MainNav from "@/components/mainNav"
import { generateMetadata as genMeta } from "@/lib/seo"
import { generateSoftwareSchema, generateBreadcrumbSchema, generateFAQSchema, SchemaMarkup } from "@/lib/schema"
import { CheckCircle, ShoppingBag, BarChart3, Package, TrendingUp, ArrowRight, Zap, Users, DollarSign } from "lucide-react"
import Link from "next/link"

// SEO Metadata
export const metadata = genMeta({
  title: 'Best POS System for Retail and Whole Sale Stores in Nigeria - MarketBook',
  description: 'Complete retail POS system with barcode scanning, inventory management, profit tracking, and customer loyalty. Perfect for boutiques, supermarkets, and retail shops. From ₦0/month.',
  path: '/industry/retail',
  keywords: [
    'retail POS system',
    'retail POS Nigeria',
    'boutique POS system',
    'supermarket POS',
    'retail store software',
    'retail inventory management',
    'barcode scanner for retail',
    'retail management software',
    'small retail POS',
    'Whole Sale Point of Sale'
  ],
})

export default function RetailPOSPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Industries', url: '/industry' },
    { name: 'Retail', url: '/industry/retail' }
  ]

  const faqs = [
    {
      question: 'Why do retail stores need a POS system?',
      answer: 'A POS system helps retail stores process sales faster, track inventory in real-time, prevent theft, manage customer data, and calculate profits automatically. MarketBook eliminates manual record-keeping and reduces human errors.'
    },
    {
      question: 'Does MarketBook work for small retail shops?',
      answer: 'Absolutely! MarketBook is perfect for small retail shops. Our free plan includes essential features like sales tracking, inventory management, and receipt printing. You can start for free and upgrade as your business grows.'
    },
    {
      question: 'Can I use barcode scanners with MarketBook?',
      answer: 'Yes! MarketBook supports USB barcode scanners for ultra-fast checkout. The system can also generate barcode labels for your products. Simply scan items at checkout for instant pricing and stock updates.'
    },
    {
      question: 'How does MarketBook help with inventory management?',
      answer: 'MarketBook automatically updates stock levels with every sale. You get low stock alerts, reorder notifications, and can see total inventory value at any time. Perfect for managing clothing, shoes, electronics, or any retail products.'
    },
    {
      question: 'Can I track customer purchases and loyalty?',
      answer: 'Yes! MarketBook maintains a customer database where you can track purchase history, credit sales, and payment records. Build customer loyalty by offering credit to trusted customers with controlled limits.'
    },
    {
      question: 'Does MarketBook work for fashion boutiques?',
      answer: 'Yes! MarketBook is excellent for fashion boutiques. Track items by size, color, and style. Manage seasonal inventory, run promotions, and analyze which products sell best. Many fashion retailers use MarketBook daily.'
    },
    {
      question: 'Can I manage multiple retail locations?',
      answer: 'Yes. MarketBook Professional and Enterprise plans support multi-store management. Track inventory, sales, and profits separately for each location while viewing consolidated reports from one dashboard.'
    },
    {
      question: 'What reports does MarketBook provide for retail businesses?',
      answer: 'MarketBook provides daily sales reports, profit calculations, inventory valuation, best-selling products, slow-moving items, customer purchase history, and monthly financial summaries. All reports are automatic and real-time.'
    }
  ]

  const softwareSchema = generateSoftwareSchema({
    name: 'MarketBook Retail POS',
    description: 'Complete POS and inventory management system designed specifically for retail stores, boutiques, and supermarkets in Nigeria',
    url: 'https://marketbook.app/industry/retail',
    featureList: [
      'Barcode Scanning for Retail',
      'Real-Time Inventory Tracking',
      'Multiple Product Variants (Size, Color)',
      'Customer Loyalty Program',
      'Automatic Profit Calculation',
      'Low Stock Alerts',
      'Receipt Printing',
      'Multi-Store Management',
      'Sales Analytics',
      'Employee Management'
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
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-8">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.name}>
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.url ? (
                  <Link href={crumb.url} className="hover:text-purple-600 dark:hover:text-purple-400">
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
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <ShoppingBag className="w-4 h-4" />
                Industry Solution
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                The Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">POS System</span> for Retail Stores
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Built specifically for Nigerian retail businesses. <strong>Barcode scanning</strong>, <strong>instant profit tracking</strong>, and <strong>real-time inventory management</strong>. Perfect for boutiques, supermarkets, electronics shops, and any retail store.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Fast Checkout</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Serve more customers per hour</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Prevent Theft</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track every item precisely</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Know Your Profit</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Daily automatic calculations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Manage Stock</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Never run out of best-sellers</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  🎉 <strong>Special Offer for Retail Stores:</strong> Start with our FREE plan. No credit card needed. Upgrade only when you're ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2">
                  Start Free for Your Retail Store
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/subscription" className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-purple-600 dark:border-purple-400 text-center">
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <ShoppingBag className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Retail Dashboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Today's Performance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Sales</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₦145,000</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">↑ 23% vs yesterday</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Profit</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₦42,500</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">29.3% margin</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Items Sold</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">87</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">45 transactions</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₦2.4M</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">542 products</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-900">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top Selling Today</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Nike Sneakers</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">12 units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Denim Jeans</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">8 units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">T-Shirts</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">15 units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features for Retail */}
        <section className="bg-white dark:bg-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Built Specifically for Retail Businesses
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything a modern retail store needs to succeed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ultra-Fast Checkout</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Scan barcodes for instant checkout. Process multiple customers simultaneously. Reduce queue times and increase daily sales volume.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-green-200 dark:border-green-900">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Inventory Control</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track stock by size, color, and style. Get alerts when best-sellers run low. Know exactly what to reorder and when. Prevent stockouts.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Automatic Profit Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See profit on every sale instantly. Daily and monthly profit reports. Know which products are most profitable. Make data-driven decisions.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-orange-200 dark:border-orange-900">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Customer Loyalty</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Build customer database. Track purchase history. Offer credit to trusted customers. Send automated payment reminders.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-900">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sales Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  View best-selling products, peak sales hours, average transaction value, and customer trends. Optimize your retail strategy with real data.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-900">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multi-Payment Support</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Accept cash, cards, transfers, and mobile money. Split payments across multiple methods. Handle returns and refunds easily.
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
                  <span className="text-purple-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Retail Store?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of Nigerian retail businesses using MarketBook. Start free today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-all border-2 border-white">
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
