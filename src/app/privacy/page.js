import MainNav from "@/components/mainNav"
import Link from "next/link"
import { Shield, Lock, Eye, UserCheck, Database, Globe } from "lucide-react"

export const metadata = {
  title: 'Privacy Policy | MarketBook',
  description: 'Privacy Policy for MarketBook - How we collect, use, and protect your personal information and business data',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <MainNav />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Last Updated: January 8, 2026
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              How we collect, use, and protect your information
            </p>
          </div>

          {/* Trust Badge */}
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">Your Privacy Matters</h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  MarketBook does not sell your personal information or business data to third parties. We collect only what's necessary to provide our services and keep your account secure.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 space-y-8">
            
            {/* Table of Contents */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
              <ol className="space-y-2 text-blue-600 dark:text-blue-400">
                <li><a href="#introduction" className="hover:underline">1. Introduction</a></li>
                <li><a href="#information-collected" className="hover:underline">2. Information We Collect</a></li>
                <li><a href="#how-we-use" className="hover:underline">3. How We Use Your Information</a></li>
                <li><a href="#how-we-share" className="hover:underline">4. How We Share Information</a></li>
                <li><a href="#cookies" className="hover:underline">5. Cookies and Tracking Technologies</a></li>
                <li><a href="#data-security" className="hover:underline">6. Data Security</a></li>
                <li><a href="#data-retention" className="hover:underline">7. Data Retention</a></li>
                <li><a href="#your-rights" className="hover:underline">8. Your Privacy Rights</a></li>
                <li><a href="#children" className="hover:underline">9. Children's Privacy</a></li>
                <li><a href="#international" className="hover:underline">10. International Data Transfers</a></li>
                <li><a href="#third-party" className="hover:underline">11. Third-Party Services</a></li>
                <li><a href="#business-transfers" className="hover:underline">12. Business Transfers</a></li>
                <li><a href="#changes" className="hover:underline">13. Changes to This Privacy Policy</a></li>
                <li><a href="#contact" className="hover:underline">14. Contact Us</a></li>
              </ol>
            </div>

            {/* Section 1: Introduction */}
            <section id="introduction">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">1.1 Who We Are</h3>
                <p>MarketBook is a software-as-a-service (SaaS) platform operated by Averit Technology Limited. We provide point of sale (POS), inventory management, and business management tools to help businesses operate more efficiently.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">1.2 What This Policy Covers</h3>
                <p>This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use MarketBook. It applies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our website (marketbook.app and related domains)</li>
                  <li>Our mobile applications (iOS and Android)</li>
                  <li>Our web application and dashboard</li>
                  <li>Any other services we provide</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">1.3 Relationship to Terms of Service</h3>
                <p>This Privacy Policy works together with our <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>. By using MarketBook, you agree to both documents.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">1.4 Legal Disclaimer</h3>
                <p className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                  <strong>Important:</strong> This Privacy Policy is a draft for informational purposes and does NOT constitute legal advice. It should be reviewed by a qualified lawyer before being relied upon for legal compliance.
                </p>
              </div>
            </section>

            {/* Section 2: Information Collected */}
            <section id="information-collected">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>We collect different types of information depending on how you use MarketBook. Here's what we collect and why:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  2.1 Information You Provide Directly
                </h3>
                <p>This is information you actively give us when you sign up, use our services, or contact us:</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Account Information</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Name:</strong> Your full name or business contact name</li>
                    <li><strong>Email Address:</strong> Used for login, communication, and account recovery</li>
                    <li><strong>Phone Number:</strong> Optional, for account security and notifications</li>
                    <li><strong>Password:</strong> Encrypted and never stored in plain text</li>
                    <li><strong>Profile Picture:</strong> Optional, for account personalization</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Business Information</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Business Name:</strong> Your store or company name</li>
                    <li><strong>Business Address:</strong> Physical location of your business</li>
                    <li><strong>Business Type/Industry:</strong> Category of business (retail, restaurant, etc.)</li>
                    <li><strong>Tax Information:</strong> Tax ID or registration numbers (if provided)</li>
                    <li><strong>Logo and Branding:</strong> Images uploaded for receipts and invoices</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Business Data (Content)</h4>
                  <p className="text-sm mb-3">Information you enter into MarketBook to operate your business:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Product Information:</strong> Names, descriptions, images, prices, stock quantities</li>
                    <li><strong>Customer Data:</strong> Customer names, phone numbers, email addresses, purchase history, credit balances</li>
                    <li><strong>Transaction Records:</strong> Sales, purchases, payments, refunds, expenses</li>
                    <li><strong>Financial Data:</strong> Revenue, costs, profits, debts, credits</li>
                    <li><strong>Inventory Records:</strong> Stock levels, stock movements, adjustments</li>
                    <li><strong>Employee Data:</strong> Names, roles, permissions (if you use multi-user features)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Billing Address:</strong> For processing subscription payments</li>
                    <li><strong>Payment Method Details:</strong> Card information is collected and processed by third-party payment processors (Paystack, Stripe, etc.) - we do NOT store full credit card numbers</li>
                    <li><strong>Transaction History:</strong> Records of your subscription payments</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Communications</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Support Tickets:</strong> Messages, questions, and feedback you send us</li>
                    <li><strong>Survey Responses:</strong> Feedback about our service (if you participate)</li>
                    <li><strong>Email Correspondence:</strong> Communication with our support team</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  2.2 Information Collected Automatically
                </h3>
                <p>When you use MarketBook, we automatically collect certain technical information:</p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Device and Browser Information</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>IP Address:</strong> Used for security, fraud prevention, and analytics (not stored long-term)</li>
                    <li><strong>Browser Type and Version:</strong> Chrome, Safari, Firefox, Edge, etc.</li>
                    <li><strong>Operating System:</strong> Windows, macOS, iOS, Android, Linux</li>
                    <li><strong>Device Type:</strong> Desktop, tablet, mobile phone</li>
                    <li><strong>Screen Resolution:</strong> To optimize display</li>
                    <li><strong>Language Preferences:</strong> Browser language settings</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Usage Data</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Pages Visited:</strong> Which features and pages you access</li>
                    <li><strong>Time Spent:</strong> How long you use different features</li>
                    <li><strong>Click Data:</strong> Which buttons and links you interact with</li>
                    <li><strong>Session Data:</strong> Login times, logout times, session duration</li>
                    <li><strong>Feature Usage:</strong> Which features you use most frequently</li>
                    <li><strong>Error Logs:</strong> Technical errors to help us fix bugs</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Location Information</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>General Location:</strong> Country and city inferred from IP address (not precise GPS location)</li>
                    <li><strong>Time Zone:</strong> To display times correctly in your local time zone</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  2.3 Information from Third Parties
                </h3>
                <p>In limited cases, we may receive information about you from third parties:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li><strong>Payment Processors:</strong> Transaction status, payment success/failure (no full card numbers)</li>
                  <li><strong>Authentication Providers:</strong> If you sign in with Google or other OAuth providers</li>
                  <li><strong>Analytics Services:</strong> Aggregated usage statistics from Google Analytics or similar tools</li>
                  <li><strong>Referral Sources:</strong> How you found MarketBook (e.g., from a link, ad, or search engine)</li>
                </ul>
              </div>
            </section>

            {/* Section 3: How We Use Information */}
            <section id="how-we-use">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>We use the information we collect for specific, legitimate business purposes. We do NOT sell your information to third parties.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.1 To Provide and Operate the Service</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create and manage your account</li>
                  <li>Process and record your business transactions</li>
                  <li>Store and organize your product inventory</li>
                  <li>Track sales, expenses, and financial data</li>
                  <li>Generate reports and analytics for your business</li>
                  <li>Synchronize data across your devices</li>
                  <li>Enable offline functionality</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.2 To Process Payments</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Charge subscription fees through third-party payment processors</li>
                  <li>Send payment receipts and invoices</li>
                  <li>Manage billing cycles and renewals</li>
                  <li>Handle refunds when applicable</li>
                  <li>Prevent fraudulent transactions</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.3 To Communicate With You</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send important service notifications (e.g., account changes, security alerts)</li>
                  <li>Respond to your support requests and questions</li>
                  <li>Send updates about new features or changes to our service</li>
                  <li>Send marketing emails (only if you opt-in - you can unsubscribe anytime)</li>
                  <li>Notify you about subscription renewals or payment issues</li>
                  <li>Request feedback through surveys (optional participation)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.4 To Improve Our Service</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analyze usage patterns to understand which features are most valuable</li>
                  <li>Identify and fix bugs and technical issues</li>
                  <li>Develop new features based on user needs</li>
                  <li>Optimize performance and loading times</li>
                  <li>Conduct A/B testing to improve user experience</li>
                  <li>Train our support team to better assist users</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.5 For Security and Fraud Prevention</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Detect and prevent unauthorized account access</li>
                  <li>Identify suspicious activity and potential fraud</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect against spam and abuse</li>
                  <li>Investigate security incidents</li>
                  <li>Monitor for malicious activity</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.6 For Legal Compliance</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with applicable laws and regulations</li>
                  <li>Respond to legal requests from authorities</li>
                  <li>Enforce our legal rights</li>
                  <li>Resolve disputes</li>
                  <li>Maintain records for tax and accounting purposes</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.7 For Marketing and Analytics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Understand how users find and use MarketBook</li>
                  <li>Measure the effectiveness of our marketing campaigns</li>
                  <li>Analyze aggregate trends and statistics (anonymized data)</li>
                  <li>Send promotional content (only with your consent)</li>
                </ul>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r mt-6">
                  <p className="text-sm"><strong>Legal Basis for Processing (GDPR):</strong> If you're in the European Economic Area, we process your data based on: (1) your consent, (2) performance of our contract with you, (3) our legitimate business interests, or (4) legal obligations.</p>
                </div>
              </div>
            </section>

            {/* Section 4: How We Share Information */}
            <section id="how-we-share">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. How We Share Information</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-r">
                  <strong>Important:</strong> We do NOT sell your personal information or business data to third parties for their marketing purposes.
                </p>

                <p className="mt-4">We may share your information only in the following limited circumstances:</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.1 With Service Providers</h3>
                <p>We share data with third-party companies that help us operate MarketBook. These service providers are contractually obligated to protect your data and use it only for the services they provide to us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li><strong>Cloud Hosting Providers:</strong> To store data securely (e.g., AWS, Google Cloud, Azure)</li>
                  <li><strong>Payment Processors:</strong> To handle subscription payments (e.g., Paystack, Stripe)</li>
                  <li><strong>Email Service Providers:</strong> To send transactional and marketing emails (e.g., SendGrid, Mailgun)</li>
                  <li><strong>Analytics Providers:</strong> To analyze usage patterns (e.g., Google Analytics)</li>
                  <li><strong>Customer Support Tools:</strong> To manage support tickets (e.g., Intercom, Zendesk)</li>
                  <li><strong>Security Services:</strong> To protect against fraud and attacks</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.2 With Your Consent</h3>
                <p>We may share your information with third parties if you explicitly give us permission to do so.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.3 For Legal Reasons</h3>
                <p>We may disclose your information if required by law or if we believe it's necessary to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Comply with legal process (subpoenas, court orders, etc.)</li>
                  <li>Respond to requests from law enforcement or government authorities</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Protect the rights, property, or safety of our users or the public</li>
                  <li>Prevent fraud, security threats, or illegal activity</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.4 Business Transfers</h3>
                <p>If MarketBook is involved in a merger, acquisition, sale of assets, or bankruptcy, your information may be transferred as part of that transaction. We will notify you via email or prominent notice on our website before your information becomes subject to a different privacy policy.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.5 Aggregated and Anonymized Data</h3>
                <p>We may share aggregated, anonymized data that does not identify you personally. For example:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>"50% of MarketBook users are in the retail industry"</li>
                  <li>"Average inventory value tracked on MarketBook is ₦2.5 million"</li>
                </ul>
                <p>This type of statistical data cannot be used to identify you or your business.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4.6 Within Your Organization</h3>
                <p>If you use MarketBook's multi-user or multi-store features, your business data is shared with other users you've granted access to (employees, managers, etc.). You control who has access to your data within your account.</p>
              </div>
            </section>

            {/* Section 5: Cookies */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.1 What Are Cookies?</h3>
                <p>Cookies are small text files stored on your device by your web browser. They help websites remember information about your visit, such as your login status and preferences.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.2 Types of Cookies We Use</h3>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Essential Cookies (Required)</h4>
                  <p className="text-sm">These cookies are necessary for the service to function and cannot be disabled:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li><strong>Session Cookies:</strong> Keep you logged in as you navigate between pages</li>
                    <li><strong>Security Cookies:</strong> Protect against fraud and unauthorized access</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings (language, theme, etc.)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Analytics Cookies (Optional)</h4>
                  <p className="text-sm">These cookies help us understand how you use MarketBook:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li><strong>Google Analytics:</strong> Tracks page views, session duration, and user behavior</li>
                    <li><strong>Performance Monitoring:</strong> Identifies slow pages and technical issues</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Marketing Cookies (Optional)</h4>
                  <p className="text-sm">These cookies track the effectiveness of our marketing:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li><strong>Conversion Tracking:</strong> Measures which marketing channels bring users to MarketBook</li>
                    <li><strong>Retargeting:</strong> Shows relevant ads to people who visited our website (if you consent)</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">5.3 Other Tracking Technologies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Local Storage:</strong> Stores data locally on your device for offline functionality</li>
                  <li><strong>Session Storage:</strong> Temporarily stores data during your browsing session</li>
                  <li><strong>Web Beacons/Pixels:</strong> Small images used to track email opens and page loads</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">5.4 Managing Cookies</h3>
                <p>You can control cookies through:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                  <li><strong>Cookie Preferences:</strong> We provide a cookie consent banner where you can accept or reject optional cookies</li>
                  <li><strong>Opt-Out Tools:</strong> Google Analytics Opt-out Browser Add-on, NAI Opt-Out page</li>
                </ul>
                <p className="mt-3 text-sm bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                  <strong>Note:</strong> Blocking essential cookies may prevent you from using MarketBook or certain features may not work correctly.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">5.5 Do Not Track</h3>
                <p>Some browsers have a "Do Not Track" (DNT) feature. MarketBook respects DNT signals for analytics and marketing cookies, but essential cookies will still be used to provide the service.</p>
              </div>
            </section>

            {/* Section 6: Data Security */}
            <section id="data-security">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>We take data security seriously and implement industry-standard measures to protect your information.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.1 Security Measures</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-600" />
                      Encryption
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• HTTPS/TLS for data in transit</li>
                      <li>• Encryption for data at rest</li>
                      <li>• Password hashing (bcrypt/Argon2)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Access Controls
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Role-based access controls</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Strict employee access policies</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      Infrastructure
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Secure cloud hosting</li>
                      <li>• Regular security audits</li>
                      <li>• Automatic backups</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-orange-600" />
                      Monitoring
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• 24/7 security monitoring</li>
                      <li>• Intrusion detection systems</li>
                      <li>• Automated threat response</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">6.2 Your Responsibility</h3>
                <p>While we implement strong security measures, you also play a role in protecting your account:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication (2FA) if available</li>
                  <li>Don't share your login credentials</li>
                  <li>Log out on shared devices</li>
                  <li>Keep your devices and browsers updated</li>
                  <li>Be cautious of phishing emails</li>
                  <li>Report suspicious activity immediately</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">6.3 Data Breach Notification</h3>
                <p>In the unlikely event of a data breach that affects your personal information, we will:</p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Notify affected users within 72 hours (or as required by law)</li>
                  <li>Explain what information was compromised</li>
                  <li>Describe the steps we're taking to address the breach</li>
                  <li>Provide guidance on how you can protect yourself</li>
                  <li>Notify relevant regulatory authorities as required</li>
                </ul>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r mt-6">
                  <p className="text-sm"><strong>Important Disclaimer:</strong> No method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. Use MarketBook at your own risk.</p>
                </div>
              </div>
            </section>

            {/* Section 7: Data Retention */}
            <section id="data-retention">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.1 How Long We Keep Your Data</h3>
                <p>We retain your information for different periods depending on the type of data and legal requirements:</p>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Active Accounts</h4>
                  <p className="text-sm">While your account is active, we retain all your data to provide the service.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Closed Accounts</h4>
                  <p className="text-sm">After you close your account:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li><strong>30-90 Days:</strong> Grace period where you can recover your account and data</li>
                    <li><strong>After Grace Period:</strong> Most data is permanently deleted</li>
                    <li><strong>Exceptions:</strong> Some data may be retained longer for legal, security, or fraud prevention purposes</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Financial Records</h4>
                  <p className="text-sm">Transaction records related to subscription payments may be retained for up to 7 years for tax, accounting, and legal compliance purposes.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Backup Data</h4>
                  <p className="text-sm">Data in backups is retained for disaster recovery purposes and is automatically deleted according to our backup retention schedule (typically 30-90 days).</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Analytics Data</h4>
                  <p className="text-sm">Aggregated, anonymized analytics data may be retained indefinitely for research and service improvement.</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">7.2 Legal Requirements</h3>
                <p>We may retain certain data longer if required by law or if we have a legitimate reason to do so (e.g., resolving disputes, enforcing agreements, preventing fraud).</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">7.3 Deleting Your Data</h3>
                <p>You can request deletion of your data at any time. See section 8 (Your Privacy Rights) for details.</p>
              </div>
            </section>

            {/* Section 8: Your Rights */}
            <section id="your-rights">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Your Privacy Rights</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>You have important rights regarding your personal information. The specific rights available to you may depend on your location.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">8.1 Access Your Data</h3>
                <p>You have the right to know what personal information we hold about you. You can:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>View most of your data directly in your MarketBook dashboard</li>
                  <li>Request a copy of all your data by contacting support</li>
                  <li>We will provide your data in a portable format (JSON, CSV, etc.)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.2 Correct Your Data</h3>
                <p>You have the right to update or correct inaccurate information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Edit your account settings and profile information anytime</li>
                  <li>Update your business information in the dashboard</li>
                  <li>Contact support if you can't update something yourself</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.3 Delete Your Data</h3>
                <p>You have the right to request deletion of your personal information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Close your account through account settings</li>
                  <li>Request permanent deletion by contacting support</li>
                  <li>We will delete your data within 30-90 days (except where we must retain it for legal reasons)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.4 Export Your Data</h3>
                <p>You have the right to receive your data in a portable format:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Use our data export feature to download your business data</li>
                  <li>Export products, customers, transactions, and reports</li>
                  <li>Take your data to another service (data portability)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.5 Restrict Processing</h3>
                <p>You can limit how we use your data:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Opt out of marketing emails (unsubscribe link in every email)</li>
                  <li>Disable optional cookies through your browser or cookie settings</li>
                  <li>Request that we stop processing certain data (though this may limit service functionality)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.6 Object to Processing</h3>
                <p>You can object to certain uses of your data, particularly for marketing or profiling purposes.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.7 Withdraw Consent</h3>
                <p>If we process your data based on your consent, you can withdraw that consent at any time. This won't affect processing that occurred before you withdrew consent.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.8 File a Complaint</h3>
                <p>If you believe we've violated your privacy rights, you can:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Contact us first at privacy@marketbook.app</li>
                  <li>File a complaint with the Nigerian Data Protection Commission (NDPC)</li>
                  <li>If you're in the EU, contact your local data protection authority</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">8.9 How to Exercise Your Rights</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r mt-4">
                  <p className="text-sm">To exercise any of these rights, contact us at:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li><strong>Email:</strong> privacy@marketbook.app</li>
                    <li><strong>Subject Line:</strong> "Privacy Rights Request - [Type of Request]"</li>
                    <li><strong>Include:</strong> Your name, email, and account details</li>
                  </ul>
                  <p className="text-sm mt-3">We will respond within 30 days (or as required by applicable law).</p>
                </div>
              </div>
            </section>

            {/* Section 9: Children */}
            <section id="children">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>MarketBook is not intended for children under the age of 18. We do not knowingly collect personal information from children.</p>
                
                <p>If you are under 18, you may not create an account or use MarketBook without the consent and supervision of a parent or legal guardian.</p>
                
                <p>If we become aware that we have inadvertently collected personal information from a child under 18 without proper parental consent, we will take steps to delete that information as quickly as possible.</p>
                
                <p>If you believe we have collected information from a child, please contact us immediately at privacy@marketbook.app.</p>
              </div>
            </section>

            {/* Section 10: International */}
            <section id="international">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                10. International Data Transfers
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">10.1 Where Your Data Is Stored</h3>
                <p>MarketBook operates globally. Your data may be stored and processed in countries other than where you live, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Nigeria (our primary operations)</li>
                  <li>United States (cloud hosting providers)</li>
                  <li>European Union (data centers)</li>
                  <li>Other countries where our service providers operate</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">10.2 Data Protection Standards</h3>
                <p>When we transfer data across borders, we ensure appropriate safeguards are in place:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>We use cloud providers that comply with international data protection standards</li>
                  <li>Data transfers to the EU are covered by Standard Contractual Clauses (SCCs)</li>
                  <li>We require service providers to maintain adequate data protection measures</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">10.3 Your Consent</h3>
                <p>By using MarketBook, you consent to the transfer of your information to countries outside your residence, including countries that may have different data protection laws than your country.</p>
              </div>
            </section>

            {/* Section 11: Third-Party Services */}
            <section id="third-party">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Third-Party Services</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.1 Third-Party Links</h3>
                <p>MarketBook may contain links to third-party websites, services, or resources. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.2 Third-Party Integrations</h3>
                <p>If you integrate MarketBook with third-party services (e.g., accounting software, payment gateways, messaging services), those services may collect and use your data according to their own privacy policies. Examples include:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Payment Processors:</strong> Paystack, Stripe (handle payment card information)</li>
                  <li><strong>Analytics:</strong> Google Analytics (tracks website usage)</li>
                  <li><strong>Communication:</strong> WhatsApp, SMS providers (send notifications)</li>
                </ul>
                <p className="mt-3">Review the privacy policies of any third-party services you connect to MarketBook.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">11.3 Social Media Features</h3>
                <p>Our website may include social media features (e.g., Facebook Like button, Twitter Share). These features may collect your IP address and which page you're visiting, and may set a cookie. Social media features are hosted by the respective social media platform and are governed by their privacy policies.</p>
              </div>
            </section>

            {/* Section 12: Business Transfers */}
            <section id="business-transfers">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Business Transfers</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>If MarketBook or Averit Technology Limited is involved in a business transaction such as:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Merger or acquisition by another company</li>
                  <li>Sale of assets or business</li>
                  <li>Bankruptcy or insolvency proceedings</li>
                  <li>Reorganization or restructuring</li>
                </ul>
                <p className="mt-3">Your information may be transferred as part of that transaction. In such cases:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>We will notify you via email and/or prominent notice on our website</li>
                  <li>The acquiring party will be required to continue to protect your information as described in this Privacy Policy</li>
                  <li>If the new owner plans to use your data differently, you will be notified and given the option to delete your account</li>
                </ul>
              </div>
            </section>

            {/* Section 13: Changes */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Changes to This Privacy Policy</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.1 Right to Modify</h3>
                <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.2 Notification of Changes</h3>
                <p>When we make changes, we will:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Update the "Last Updated" date at the top of this page</li>
                  <li>Notify you via email for material changes</li>
                  <li>Display a prominent notice on our website or in the app</li>
                  <li>Provide at least 30 days' notice before material changes take effect</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.3 Your Acceptance</h3>
                <p>Your continued use of MarketBook after changes to this Privacy Policy constitutes your acceptance of the updated policy. If you do not agree to the changes, you should stop using MarketBook and may delete your account.</p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.4 Review Regularly</h3>
                <p>We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.</p>
              </div>
            </section>

            {/* Section 14: Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact Us</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">Data Protection Contact</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Company:</strong> Averit Technology Limited (MarketBook)</p>
                    <p><strong>Privacy Email:</strong> privacy@marketbook.app</p>
                    <p><strong>General Support:</strong> support@marketbook.app</p>
                    <p><strong>Data Protection Officer:</strong> dpo@marketbook.app</p>
                    <p><strong>Website:</strong> <a href="https://marketbook.app" className="text-blue-600 dark:text-blue-400 hover:underline">https://marketbook.app</a></p>
                    <p><strong>Address:</strong> Technology House, Lagos, Nigeria</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r mt-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Response Time</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    We aim to respond to all privacy inquiries within 30 days. For urgent matters, please mark your email as "Urgent" in the subject line.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 p-4 rounded-r mt-6">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Regulatory Authority</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                    If you are not satisfied with our response, you may file a complaint with:
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Nigeria Data Protection Commission (NDPC)</strong><br />
                    Website: <a href="https://ndpc.gov.ng" className="underline">https://ndpc.gov.ng</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Final Notice */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Acknowledgment</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  BY USING MARKETBOOK, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY AND AGREE TO THE COLLECTION, USE, AND DISCLOSURE OF YOUR INFORMATION AS DESCRIBED HEREIN.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-r-lg mt-6">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Legal Review Required</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This Privacy Policy is a DRAFT and should be reviewed by a qualified lawyer before being used for legal compliance. It does not constitute legal advice.
                </p>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Last Updated: January 8, 2026</p>
                <p className="mt-2">Version 1.0 (Draft)</p>
              </div>
            </div>

          </div>

          {/* Bottom Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Terms of Service
            </Link>
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact Us
            </Link>
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
