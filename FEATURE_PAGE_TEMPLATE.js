/**
 * FEATURE PAGE TEMPLATE
 * 
 * Copy this file to create new feature pages quickly
 * 
 * Steps:
 * 1. Copy to src/app/features/[feature-name]/page.js
 * 2. Search and replace "FEATURE_NAME" with actual feature
 * 3. Update metadata, keywords, and content
 * 4. Add to sitemap.js
 * 5. Deploy!
 */

import MainNav from "@/components/mainNav"
import { generateMetadata as genMeta } from "@/lib/seo"
import { generateSoftwareSchema, generateBreadcrumbSchema, generateFAQSchema, SchemaMarkup } from "@/lib/schema"
import { CheckCircle, Zap, BarChart3, Package, TrendingUp, ArrowRight, Shield, Users } from "lucide-react"
import Link from "next/link"

// ============================================
// 1. UPDATE METADATA (Required)
// ============================================
export const metadata = genMeta({
  title: 'FEATURE_NAME - Main Benefit | MarketBook',
  description: 'Compelling description with keywords. Include benefit and CTA. From ₦0/month. Try free - no credit card needed.',
  path: '/features/feature-name',
  keywords: [
    'primary keyword',
    'secondary keyword',
    'related keyword 1',
    'related keyword 2',
    'related keyword 3',
    'long-tail keyword 1',
    'long-tail keyword 2',
  ],
})

export default function FeatureNamePage() {
  // ============================================
  // 2. UPDATE BREADCRUMBS (Required)
  // ============================================
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'FEATURE_NAME', url: '/features/feature-name' }
  ]

  // ============================================
  // 3. CREATE 8 FAQ QUESTIONS (Required)
  // Target "People Also Ask" in Google
  // ============================================
  const faqs = [
    {
      question: 'What is [feature name]?',
      answer: 'Clear explanation of what it is and how it helps businesses. 60-120 words with benefits.'
    },
    {
      question: 'How does [feature] work in MarketBook?',
      answer: 'Step-by-step explanation or key functionality description.'
    },
    {
      question: 'Do I need [related feature] to use this?',
      answer: 'Address common prerequisite or integration questions.'
    },
    {
      question: 'Can I [common user action]?',
      answer: 'Answer specific use case questions.'
    },
    {
      question: 'Is [feature] included in the free plan?',
      answer: 'Clear yes/no with plan details if applicable.'
    },
    {
      question: 'How much does [feature] cost?',
      answer: 'Pricing information and value justification.'
    },
    {
      question: 'Can I [related action or integration]?',
      answer: 'Address integration or advanced usage questions.'
    },
    {
      question: 'Does [feature] work on mobile?',
      answer: 'Mobile/accessibility question. Usually yes for MarketBook.'
    }
  ]

  // ============================================
  // 4. GENERATE SCHEMA (Update featureList)
  // ============================================
  const softwareSchema = generateSoftwareSchema({
    name: 'MarketBook FEATURE_NAME',
    description: 'Brief description for schema markup',
    url: 'https://marketbook.app/features/feature-name',
    featureList: [
      'Key Feature 1',
      'Key Feature 2',
      'Key Feature 3',
      'Key Feature 4',
      'Key Feature 5',
    ]
  })

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)
  const faqSchema = generateFAQSchema(faqs)

  return (
    <>
      {/* Schema Markup - Don't remove */}
      <SchemaMarkup schema={softwareSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <SchemaMarkup schema={faqSchema} />
      
      <MainNav />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* ============================================ */}
        {/* BREADCRUMBS - Keep as is */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* HERO SECTION - UPDATE ALL TEXT */}
        {/* ============================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Choose appropriate badge text
              </div>
              
              {/* H1 - Include primary keyword */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                Compelling Headline <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">With Gradient</span>
              </h1>
              
              {/* Description - 2-3 sentences */}
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Compelling description with <strong>key benefits highlighted</strong>. Mention specific features and value. End with clear benefit statement.
              </p>

              {/* 4 Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Benefit 1 Title</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short description</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Benefit 2 Title</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short description</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Benefit 3 Title</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short description</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Benefit 4 Title</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short description</p>
                  </div>
                </div>
              </div>

              {/* CTAs - Standard, don't change much */}
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

            {/* Visual Demo - Replace with feature-specific mockup */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400 py-20">
                  [Create feature-specific visual demo here]
                  <br />
                  Examples: dashboard mockup, flow diagram, sample data
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURES SECTION - 6 FEATURE CARDS */}
        {/* ============================================ */}
        <section className="bg-white dark:bg-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Section Heading with Keywords
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Supporting description (1-2 sentences)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 1 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-green-200 dark:border-green-900">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 2 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 3 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-orange-200 dark:border-orange-900">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 4 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>

              {/* Feature Card 5 */}
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-900">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 5 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>

              {/* Feature Card 6 */}
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-900">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Feature 6 Name</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed description of feature benefit. 80-120 words explaining what it does and why it matters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FAQ SECTION - Keep structure, update questions */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* CTA SECTION - Standard, minimal changes */}
        {/* ============================================ */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to [Action Related to Feature]?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 10,000+ businesses using MarketBook. Start free today - no credit card required.
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
