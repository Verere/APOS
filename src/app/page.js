import MainNav from "@/components/mainNav";
import { ShoppingCart, BarChart3, Users, Package, TrendingUp, Shield, CheckCircle, Star, Zap, ArrowRight } from "lucide-react";
import Script from "next/script";
import { generateSoftwareSchema, generateOrganizationSchema, generateFAQSchema, SchemaMarkup } from "@/lib/schema";
import { generateMetadata as genMeta } from "@/lib/seo";

// Enhanced SEO Metadata for Homepage
export const metadata = genMeta({
  title: 'MarketBook - Smart POS & Inventory Management Software for African Businesses',
  description: 'All-in-one POS system with automatic daily profit calculation, debt tracking with reminders, inventory management, and financial reports. Free forever plan. No credit card required. Trusted by 10,000+ businesses across Africa.',
  path: '/',
  keywords: [
    'POS system Nigeria',
    'inventory management software',
    'point of sale system',
    'retail POS',
    'restaurant POS',
    'free POS software',
    'profit tracking software',
    'debt management system',
    'sales tracking software',
    'small business POS',
    'cloud POS',
    'barcode POS system',
    'multi-currency POS'
  ],
})

export default function Home() {
  // Homepage FAQ data for schema
  const homepageFAQs = [
    {
      question: 'What is MarketBook?',
      answer: 'MarketBook is an all-in-one business management system that combines POS, inventory management, automatic profit tracking, debt management, and financial reports. It helps African businesses manage sales, track stock, calculate profits daily, and manage customer credit - all in one platform.'
    },
    {
      question: 'How does MarketBook calculate daily revenue and profit?',
      answer: 'MarketBook automatically tracks every sale and compares the selling price to the cost price to calculate profit. At the end of each day, the system generates a complete report showing total revenue, expenses, and net profit. Monthly reports accumulate all daily data for comprehensive financial insights.'
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes! MarketBook offers a forever-free plan that includes essential POS features, inventory management, sales tracking, and receipt printing. You can upgrade anytime as your business grows. No credit card required to start.'
    },
    {
      question: 'How does debt tracking and management work?',
      answer: 'MarketBook maintains a complete database of customers who buy on credit. The system tracks all credit sales, payment history, and outstanding balances. You can set credit limits per customer and enable/disable credit sales. Automated SMS and WhatsApp reminders are sent to debtors to encourage timely payment.'
    },
    {
      question: 'Can MarketBook show total inventory value?',
      answer: 'Yes! MarketBook automatically calculates your total inventory value by multiplying the quantity of each product by its cost price. This helps you understand how much capital is tied up in stock and makes better purchasing decisions.'
    },
  ]

  // Generate schema markup
  const softwareSchema = generateSoftwareSchema({
    name: 'MarketBook',
    description: 'Complete POS and inventory management system with automatic profit tracking, debt management, and financial reports for African businesses',
  })

  const organizationSchema = generateOrganizationSchema()
  const faqSchema = generateFAQSchema(homepageFAQs)

  return (
    <>
    {/* Add Schema Markup for SEO */}
    <SchemaMarkup schema={softwareSchema} />
    <SchemaMarkup schema={organizationSchema} />
    <SchemaMarkup schema={faqSchema} />
    
    <MainNav/>
    
    {/* Tawk.to Chat Widget */}
    <Script
      id="tawk-to-script"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/695f90e3cd470f1979715e8c/1jeekrusb';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-6 sm:space-y-8 order-2 lg:order-1">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold w-fit">
                <CheckCircle className="w-4 h-4" />
                Trusted by 10,000+ Businesses Across Africa
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Grow Your Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">3X Faster</span> with Smart POS
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Complete sales, inventory, and customer management system with <span className="font-bold text-blue-600 dark:text-blue-400">automatic daily & monthly profit calculations</span>, <span className="font-bold text-blue-600 dark:text-blue-400">debt tracking</span>, and <span className="font-bold text-blue-600 dark:text-blue-400">automated reminders</span>. Start FREE, upgrade as you grow. No credit card required.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">Track daily revenue & profit</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">Automated debt reminders</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">Monthly expense reports</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">24/7 support</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/signup" className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-center text-sm sm:text-base flex items-center justify-center gap-2">
                  Start Free Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/subscription" className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-blue-600 dark:border-blue-400 text-center text-sm sm:text-base">
                  View Pricing
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">4.9/5 from 2,500+ reviews</p>
                </div>
              </div>
            </div>
            
            {/* Image */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur-3xl opacity-20"></div>
                <img
                  src="/sales.png"
                  alt="MarketBook System"
                  className="relative w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Financial Features Highlight Section */}
      <section className="relative w-full py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Know Your Numbers, Grow Your Business
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              MarketBook automatically tracks and calculates your financial performance so you always know where your business stands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Daily Financial Tracking */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Daily Revenue & Profit
              </h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                See your daily revenue, expenses, and profit calculations automatically updated in real-time. End-of-day reports show exactly how much you made today.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Automatic daily profit calculation</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Track expenses & operating costs</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Daily sales summaries</span>
                </li>
              </ul>
            </div>

            {/* Monthly Accumulation */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Monthly Reports
              </h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                Watch your business grow with comprehensive monthly summaries. Track revenue trends, expense patterns, and profit margins month-over-month.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Monthly revenue accumulation</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Expense breakdown by category</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Profit margin analysis</span>
                </li>
              </ul>
            </div>

            {/* Debt Management */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Debt Tracking & Reminders
              </h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                Never lose track of money owed to you. MarketBook tracks all debtors and sends automatic SMS/WhatsApp reminders for overdue payments.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Complete debtor management</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Automated payment reminders</span>
                </li>
                <li className="flex items-start gap-3 text-blue-50">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>Payment history tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">100%</div>
              <div className="text-blue-100 font-medium">Automatic Calculations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">Real-Time</div>
              <div className="text-blue-100 font-medium">Financial Updates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">24/7</div>
              <div className="text-blue-100 font-medium">Debt Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative w-full py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Everything You Need
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Built for African Businesses
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              All the tools you need to run a successful retail business in Nigeria and across Africa
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100 dark:border-blue-800">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Flexible Sales & Pricing</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Fast checkout with full control over pricing flexibility and negotiation limits
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Barcode scanning</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Allow/block price negotiation</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Set minimum price limits</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-green-100 dark:border-green-800">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Smart Inventory</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Never run out of stock with automated tracking, low-stock alerts, and total inventory valuation
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Real-time stock updates</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Total stock value tracking</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Product reorder notifications</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Low stock alerts</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-purple-100 dark:border-purple-800">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Customer & Credit Control</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Manage customers with full control over credit sales and individual credit limits
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Customer database</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Enable/disable credit sales</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Set credit limits per customer</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Credit history tracking</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-orange-100 dark:border-orange-800">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Daily & Monthly Financials</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Automatic calculation of revenue, expenses, and profit - daily and monthly
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Daily profit & loss reports</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Monthly revenue summaries</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Expense tracking & analysis</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-teal-100 dark:border-teal-800">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Debt Tracking & Reminders</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Never lose money to unpaid debts with automated tracking and SMS reminders
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Complete debtor database</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Automated payment reminders</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Track payment history</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-indigo-100 dark:border-indigo-800">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Secure & Reliable</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Enterprise-grade security to protect your business data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Start FREE. Upgrade only when you need to.
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
              ✓ No credit card required • Cancel anytime • 24/7 support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* FREE Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₦0</span>
                <span className="text-gray-600 dark:text-gray-400">/forever</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>1 User</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>10 Products</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Basic POS</span>
                </li>
              </ul>
              <a href="/signup" className="block w-full text-center px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all">
                Start Free
              </a>
            </div>

            {/* STARTER Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-500 dark:border-blue-400 relative shadow-xl transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₦70,000</span>
                <span className="text-gray-600 dark:text-gray-400">/year</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>2 Users</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>50 Products</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Inventory Management</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Email Support</span>
                </li>
              </ul>
              <a href="/signup" className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg">
                Get Started
              </a>
            </div>

            {/* PROFESSIONAL Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₦220,000</span>
                <span className="text-gray-600 dark:text-gray-400">/year</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>20 Users</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>5,000 Products</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Multi-Store</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>
              <a href="/signup" className="block w-full text-center px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all">
                Get Started
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/subscription" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              View all plans and features →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              <Shield className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get answers to common questions about MarketBook
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>What is MarketBook?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                MarketBook is a comprehensive point of sale (POS) and business management system designed specifically for African businesses. It helps you manage sales, inventory, customers, and generate detailed reports - all from one platform. Whether you run a retail store, restaurant, or service business, MarketBook streamlines your operations and helps you grow faster.
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Is there a free plan available?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! MarketBook offers a FREE forever plan that includes 1 user, up to 10 products, basic POS features, and 100 orders per month. It's perfect for trying out the system or running a very small business. No credit card required to get started. You can upgrade to a paid plan anytime as your business grows.
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How much does MarketBook cost?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                We offer flexible pricing to match your business size. Plans start from FREE (forever), Starter at ₦70,000/year, Basic at ₦120,000/year, Professional at ₦220,000/year, and Enterprise at ₦500,000/year. All paid plans include more users, products, storage, and advanced features. You can pay semi-annually or annually for better value.
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How quickly can I set up MarketBook?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                You can set up MarketBook in just 5 minutes! Simply sign up, add your business information, create your first products, and you're ready to start selling. No complicated installation or technical expertise required. Our intuitive interface makes it easy to get started, and our 24/7 support team is always available if you need help.
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>What payment methods does MarketBook support?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                MarketBook supports multiple payment methods including Cash, Credit/Debit Cards, Mobile Money (M-Pesa, MTN Mobile Money, etc.), Bank Transfers, and integrated payment gateways like Paystack. You can accept multiple payment methods for a single transaction and track all payments in real-time. We also support split payments and credit sales.
              </div>
            </details>

            {/* FAQ Item 6 - NEW: Daily Revenue Tracking */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How does MarketBook calculate daily revenue and profit?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                MarketBook automatically tracks every sale and calculates your daily revenue in real-time. At the end of each day, the system generates an End-of-Day (EOD) report that shows your total sales, expenses, and net profit. You'll see exactly how much money you made today, broken down by payment method, product categories, and more. No manual calculations needed - everything is done automatically.
              </div>
            </details>

            {/* FAQ Item 7 - NEW: Monthly Reports */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I see monthly revenue and expense reports?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! MarketBook accumulates all your daily data into comprehensive monthly reports. You can view month-over-month revenue trends, track expense patterns, analyze profit margins, and identify your best-selling products. The monthly dashboard gives you a complete financial overview including total sales, total expenses, net profit, and growth percentages compared to previous months. You can also export these reports for accounting or tax purposes.
              </div>
            </details>

            {/* FAQ Item 8 - NEW: Expense Tracking */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How do I track business expenses in MarketBook?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Recording expenses is simple! You can add expenses anytime through the Expenses section - just enter the amount, category (rent, utilities, salaries, supplies, etc.), description, and date. MarketBook automatically includes these expenses in your daily and monthly profit calculations. You can categorize expenses, attach receipts, and generate expense reports by category or date range. This helps you understand where your money is going and identify areas to reduce costs.
              </div>
            </details>

            {/* FAQ Item 9 - NEW: Debt Management */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How does debt tracking and management work?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                MarketBook makes it easy to manage customers who buy on credit. When you make a credit sale, the system automatically creates a debt record with the customer's details, amount owed, and due date. You can view all outstanding debts in the Credit Management section, see payment history, and track who owes you money. The system keeps a complete record of all debtors, partial payments, and outstanding balances so you never lose track of money owed to your business.
              </div>
            </details>

            {/* FAQ Item 10 - NEW: Automated Reminders */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Does MarketBook send automated payment reminders to debtors?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! MarketBook can automatically send payment reminders to customers with outstanding debts via SMS or WhatsApp. You can configure when reminders are sent (e.g., when payment is due, or after it becomes overdue). The reminder messages include the customer's name, amount owed, and payment instructions. This feature helps you recover debts faster without having to manually chase customers. You can also send manual reminders anytime with just one click.
              </div>
            </details>

            {/* FAQ Item 11 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I manage multiple store locations?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! Our Professional and Enterprise plans support multi-store management. You can manage inventory, sales, and staff across all your locations from a single dashboard. Each store can have its own inventory, pricing, and staff permissions while you maintain centralized oversight and consolidated reporting.
              </div>
            </details>

            {/* FAQ Item 12 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Is my business data secure?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Absolutely! We take security seriously. Your data is encrypted both in transit and at rest using industry-standard SSL/TLS encryption. We perform regular backups, have robust access controls, and comply with international data protection standards. Your business data is stored securely in the cloud and is only accessible by you and authorized team members.
              </div>
            </details>

            {/* FAQ Item 13 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Do you offer customer support?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! We provide 24/7 customer support via live chat, email, and phone. Our support team is knowledgeable and ready to help with setup, troubleshooting, or any questions you have. Professional and Enterprise plans also include priority support with faster response times and dedicated account managers.
              </div>
            </details>

            {/* FAQ Item 14 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I cancel my subscription anytime?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your account will remain active until the end of your current billing period, and you'll have access to all your data. You can also downgrade to our FREE plan if you want to continue using basic features without paying.
              </div>
            </details>

            {/* FAQ Item 15 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I access MarketBook on mobile devices?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! MarketBook is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. You can manage your business from anywhere using any device with a web browser. We also support barcode scanning using your phone's camera, making it easy to add products and process sales on the go.
              </div>
            </details>

            {/* FAQ Item 11 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Does MarketBook work offline?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                MarketBook requires an internet connection to sync data in real-time. However, we understand that internet connectivity can be unreliable in some areas. We're working on offline mode capabilities that will allow you to continue processing sales during internet outages, with automatic synchronization when connection is restored.
              </div>
            </details>

            {/* FAQ Item 12 */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I import my existing inventory data?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! You can easily import your existing product inventory, customers, and other data using our bulk import feature. We support CSV and Excel file formats. Simply download our import template, fill in your data, and upload it to MarketBook. Our support team can also help you with data migration if needed.
              </div>
            </details>

            {/* FAQ Item 13 - NEW: Total Stock Value */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-green-200 dark:border-green-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can MarketBook show me the total value of my inventory?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! MarketBook automatically calculates the total value of your inventory in real-time. You can see the total worth of all your stock at any moment - this includes the cost value (what you paid for the items) and the retail value (what you'll sell them for). The inventory dashboard shows you exactly how much money is tied up in stock, helping you make better purchasing decisions and understand your business assets. You can also view stock value by category, supplier, or location.
              </div>
            </details>

            {/* FAQ Item 14 - NEW: Reorder Notifications */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-green-200 dark:border-green-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How do product reorder notifications work?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                When you add products to MarketBook, you can set a minimum stock level (reorder point) for each item. When your stock quantity drops below this level, the system automatically alerts you that it's time to reorder. You'll see notifications on your dashboard, receive email alerts, and can view a complete list of all products that need restocking. This prevents stock-outs and ensures you never lose sales due to items being out of stock. You can also set your preferred suppliers for quick reordering.
              </div>
            </details>

            {/* FAQ Item 15 - NEW: Credit Sales Control */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-purple-200 dark:border-purple-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can I control whether customers can buy on credit?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes! As a business owner, you have complete control over credit sales. You can enable or disable credit sales entirely from your store settings. When enabled, you can choose which customers are allowed to buy on credit and which must pay cash. This gives you full flexibility to manage risk - you might allow credit for trusted, long-term customers while requiring immediate payment from new customers. The system also tracks each customer's credit history to help you make informed decisions.
              </div>
            </details>

            {/* FAQ Item 16 - NEW: Credit Limits */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-purple-200 dark:border-purple-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How do I set credit limits for customers?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                Setting credit limits is easy! For each customer in your database, you can set a maximum credit limit - the total amount they're allowed to owe you at any time. For example, if you set a ₦50,000 limit for a customer, they can buy on credit up to that amount. Once they reach their limit, the system will prevent additional credit sales until they make a payment. You can adjust credit limits anytime based on the customer's payment history and reliability. The system shows you how much credit each customer has used and how much is still available.
              </div>
            </details>

            {/* FAQ Item 17 - NEW: Price Negotiation Control */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>Can staff members negotiate prices with customers?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                You have full control over price negotiation! As the business owner, you can decide whether to allow staff members to adjust prices during checkout. If you enable price adjustments, staff can enter negotiated prices for customers - this is useful for bulk purchases or regular customers. However, the system protects you by ensuring prices cannot go below your set minimum (usually the cost price or selling price). You can also completely disable price adjustments to ensure all items are sold at fixed prices. This flexibility helps you balance customer service with profit protection.
              </div>
            </details>

            {/* FAQ Item 18 - NEW: Minimum Price Protection */}
            <details className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 dark:text-white text-lg">
                <span>How does minimum price protection work?</span>
                <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                When you allow price adjustments, MarketBook automatically protects your profit margins by enforcing minimum price limits. You set the minimum acceptable price for each product (typically your cost price or a minimum selling price), and the system will not allow staff to sell below this amount. For example, if a product's selling price is ₦1,000 and you set a minimum of ₦800, staff can negotiate down to ₦800 but not lower. If they try to enter a price below ₦800, the system will show an error and prevent the sale. This ensures you never sell at a loss while still maintaining pricing flexibility for customer negotiations.
              </div>
            </details>
          </div>

          {/* Still have questions CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our support team is here to help you get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
                Chat with Us
              </a>
              <a href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold rounded-lg transition-all border-2 border-blue-600 dark:border-blue-400">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-4">
            Join 10,000+ businesses using MarketBook across Africa
          </p>
          <p className="text-sm text-blue-200 mb-8">
            Start FREE today. No credit card required. Upgrade anytime.
          </p>
          <a href="/signup" className="inline-flex items-center gap-2 px-8 sm:px-12 py-3 sm:py-4 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl text-sm sm:text-base lg:text-lg">
            Start Free Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </main>
    </>
  );
}