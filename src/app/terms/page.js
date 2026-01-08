import MainNav from "@/components/mainNav"
import Link from "next/link"
import { FileText, Scale, Shield } from "lucide-react"

export const metadata = {
  title: 'Terms of Service | MarketBook',
  description: 'Terms of Service and User Agreement for MarketBook - POS and inventory management software',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return (
    <>
      <MainNav />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Last Updated: January 8, 2026
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please read these terms carefully before using MarketBook
            </p>
          </div>

          {/* Notice Box */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Important Notice</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This document is a legal agreement between you and Averit Technology Limited. By using MarketBook, you agree to these terms. If you do not agree, please do not use our services.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 space-y-8">
            
            {/* Table of Contents */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
              <ol className="space-y-2 text-blue-600 dark:text-blue-400">
                <li><a href="#definitions" className="hover:underline">1. Definitions</a></li>
                <li><a href="#acceptance" className="hover:underline">2. Acceptance of Terms</a></li>
                <li><a href="#eligibility" className="hover:underline">3. Eligibility and Account Use</a></li>
                <li><a href="#services" className="hover:underline">4. Description of Services</a></li>
                <li><a href="#user-responsibilities" className="hover:underline">5. User Responsibilities</a></li>
                <li><a href="#offline-usage" className="hover:underline">6. Offline Usage and Data Synchronization</a></li>
                <li><a href="#payments" className="hover:underline">7. Payments and Subscriptions</a></li>
                <li><a href="#acceptable-use" className="hover:underline">8. Acceptable Use Policy</a></li>
                <li><a href="#data-ownership" className="hover:underline">9. Data Ownership and Privacy</a></li>
                <li><a href="#intellectual-property" className="hover:underline">10. Intellectual Property Rights</a></li>
                <li><a href="#service-availability" className="hover:underline">11. Service Availability and Modifications</a></li>
                <li><a href="#termination" className="hover:underline">12. Termination</a></li>
                <li><a href="#warranties" className="hover:underline">13. Disclaimers and Warranties</a></li>
                <li><a href="#limitation" className="hover:underline">14. Limitation of Liability</a></li>
                <li><a href="#indemnification" className="hover:underline">15. Indemnification</a></li>
                <li><a href="#governing-law" className="hover:underline">16. Governing Law and Dispute Resolution</a></li>
                <li><a href="#changes" className="hover:underline">17. Changes to Terms</a></li>
                <li><a href="#general" className="hover:underline">18. General Provisions</a></li>
                <li><a href="#contact" className="hover:underline">19. Contact Information</a></li>
              </ol>
            </div>

            {/* Section 1: Definitions */}
            <section id="definitions">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Definitions</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>"MarketBook"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong> refers to Averit Technology Limited and the MarketBook software platform.</p>
                
                <p><strong>"User"</strong>, <strong>"you"</strong>, or <strong>"your"</strong> refers to any individual or entity that creates an account or uses the MarketBook services.</p>
                
                <p><strong>"Services"</strong> means the MarketBook software platform, including the point of sale (POS) system, inventory management tools, financial tracking features, customer management, and any related functionalities provided through our website or applications.</p>
                
                <p><strong>"Account"</strong> means your registered user account on the MarketBook platform.</p>
                
                <p><strong>"Subscription"</strong> means any paid plan or service tier you purchase to access premium features of MarketBook.</p>
                
                <p><strong>"Content"</strong> means any data, information, text, images, or other materials you upload, store, or transmit through the Services, including product listings, customer data, financial records, and inventory information.</p>
                
                <p><strong>"Store"</strong> means your business location(s) or online presence managed through the MarketBook platform.</p>
              </div>
            </section>

            {/* Section 2: Acceptance */}
            <section id="acceptance">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Acceptance of Terms</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>By accessing or using MarketBook, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</p>
                
                <p>If you are using MarketBook on behalf of a business or organization, you represent and warrant that you have the authority to bind that entity to these Terms.</p>
                
                <p>If you do not agree to these Terms, you must not access or use the Services.</p>
              </div>
            </section>

            {/* Section 3: Eligibility */}
            <section id="eligibility">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Eligibility and Account Use</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.1 Age and Authority</h3>
                <p>You must be at least 18 years old to create an account and use MarketBook. By creating an account, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.2 Account Registration</h3>
                <p>To use certain features of MarketBook, you must register for an account by providing accurate, complete, and current information. You agree to update your information promptly if it changes.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.3 Account Security</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials (username and password) and for all activities that occur under your account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use a strong, unique password</li>
                  <li>Not share your account credentials with others</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                  <li>Log out of your account at the end of each session on shared devices</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.4 Account Responsibility</h3>
                <p>You are solely responsible for all activities conducted through your account, whether or not you authorized such activities. MarketBook will not be liable for any loss or damage arising from your failure to maintain account security.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">3.5 Prohibited Account Actions</h3>
                <p>You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create multiple accounts to circumvent restrictions or fees</li>
                  <li>Sell, transfer, or assign your account to another party</li>
                  <li>Use another user's account without permission</li>
                  <li>Create an account using false information or impersonating another person or entity</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Services */}
            <section id="services">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Description of Services</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">4.1 Software Tools</h3>
                <p>MarketBook provides software tools to help businesses manage their operations, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Point of sale (POS) system for processing transactions</li>
                  <li>Inventory management and stock tracking</li>
                  <li>Financial tracking and profit calculation</li>
                  <li>Customer management and credit control</li>
                  <li>Debt tracking and automated reminders</li>
                  <li>Sales reports and analytics</li>
                  <li>Multi-store management</li>
                  <li>Employee access management</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">4.2 Software-Only Service</h3>
                <p><strong>Important:</strong> MarketBook provides software tools only. We do NOT:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Act as a marketplace operator or merchant of record</li>
                  <li>Process payments on your behalf (except for MarketBook subscription fees)</li>
                  <li>Own, sell, or take responsibility for your products or services</li>
                  <li>Assume liability for your inventory, pricing, or business operations</li>
                  <li>Provide legal, tax, or accounting advice</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">4.3 Service Plans</h3>
                <p>MarketBook offers multiple subscription plans with varying features and limitations. The specific features available to you depend on your chosen plan. We reserve the right to modify plan features and pricing with reasonable notice.</p>
              </div>
            </section>

            {/* Section 5: User Responsibilities */}
            <section id="user-responsibilities">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. User Responsibilities</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.1 Data Accuracy</h3>
                <p>You are solely responsible for the accuracy, completeness, and legality of all information you enter into MarketBook, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Product names, descriptions, and images</li>
                  <li>Pricing information (cost price, selling price, discounts)</li>
                  <li>Inventory quantities and stock levels</li>
                  <li>Customer information and credit limits</li>
                  <li>Financial data and transactions</li>
                  <li>Tax rates and calculations</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.2 Legal Compliance</h3>
                <p>You are responsible for ensuring that your use of MarketBook complies with all applicable laws and regulations, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Business registration and licensing requirements</li>
                  <li>Tax obligations and reporting</li>
                  <li>Consumer protection laws</li>
                  <li>Data protection and privacy regulations</li>
                  <li>Employment laws (if managing staff through MarketBook)</li>
                  <li>Industry-specific regulations (e.g., pharmacy, alcohol sales)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.3 Business Operations</h3>
                <p>You acknowledge and agree that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for all business decisions made using MarketBook data</li>
                  <li>You must independently verify critical information before making business decisions</li>
                  <li>You are responsible for backing up your business-critical data</li>
                  <li>You must maintain appropriate insurance for your business operations</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">5.4 Customer Service</h3>
                <p>You are solely responsible for providing customer service to your customers, including handling complaints, returns, refunds, and disputes. MarketBook is not responsible for resolving issues between you and your customers.</p>
              </div>
            </section>

            {/* Section 6: Offline Usage */}
            <section id="offline-usage">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Offline Usage and Data Synchronization</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.1 Offline Mode</h3>
                <p>MarketBook may offer offline functionality that allows you to continue using certain features without an internet connection. However, offline mode has inherent limitations and risks.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.2 Eventual Consistency</h3>
                <p>When using offline mode, data synchronization occurs when your device reconnects to the internet. This means:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Data entered offline will not be immediately visible on other devices</li>
                  <li>There may be delays between when you make changes and when those changes appear across all devices</li>
                  <li>Inventory levels shown offline may not reflect the actual current state if changes were made on other devices</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.3 Conflict Resolution</h3>
                <p>If conflicting data is entered on multiple devices during offline periods, MarketBook will attempt to resolve conflicts automatically. However:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Automatic conflict resolution may not always produce the desired result</li>
                  <li>In some cases, manual review and correction may be required</li>
                  <li>You are responsible for monitoring and resolving data conflicts</li>
                  <li>Loss of data may occur in rare conflict scenarios</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.4 Stock Integrity Disclaimer</h3>
                <p><strong>Important:</strong> MarketBook makes a best-effort attempt to maintain accurate inventory counts, but we cannot guarantee real-time accuracy, especially when:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Multiple devices are used simultaneously</li>
                  <li>Offline mode is being used</li>
                  <li>Network connectivity is unstable</li>
                  <li>High transaction volumes are occurring</li>
                </ul>
                <p>You are responsible for conducting periodic physical inventory counts and reconciling them with MarketBook records.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">6.5 Offline Usage Risks</h3>
                <p>By using offline mode, you acknowledge and accept the risks including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Overselling products due to outdated stock information</li>
                  <li>Duplicate sales if transactions are recorded on multiple devices</li>
                  <li>Incorrect pricing if price changes haven't synced</li>
                  <li>Data loss if devices are damaged, lost, or stolen before syncing</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Payments */}
            <section id="payments">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Payments and Subscriptions</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.1 Subscription Fees</h3>
                <p>Access to certain features of MarketBook requires a paid subscription. Subscription fees are stated in Nigerian Naira (₦) or other currencies as applicable and are subject to change with reasonable notice.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.2 Billing Cycles</h3>
                <p>Subscriptions are billed on a recurring basis according to your chosen billing cycle (monthly, semi-annually, or annually). Payments are due at the beginning of each billing period and are non-refundable except as expressly stated in these Terms.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.3 Payment Methods</h3>
                <p>You agree to provide current, complete, and accurate payment information. You authorize us to charge your chosen payment method for all fees incurred under your account.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.4 Failed Payments</h3>
                <p>If payment fails for any reason:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We will notify you and attempt to collect payment again</li>
                  <li>Your access to premium features may be suspended or restricted</li>
                  <li>We may charge a reasonable fee for failed payment processing</li>
                  <li>Repeated payment failures may result in account termination</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.5 Refund Policy</h3>
                <p>Subscription fees are generally non-refundable. However, we may offer refunds at our sole discretion in cases of:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Technical issues that prevent you from using the service</li>
                  <li>Duplicate charges due to system errors</li>
                  <li>Cancellation within 14 days of initial subscription purchase (new customers only)</li>
                </ul>
                <p>Refund requests must be submitted through our official support channels.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.6 Taxes</h3>
                <p>All fees are exclusive of applicable taxes (including VAT, sales tax, GST) unless otherwise stated. You are responsible for paying all taxes associated with your use of MarketBook and your business operations.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">7.7 Price Changes</h3>
                <p>We reserve the right to modify subscription pricing. We will provide at least 30 days' notice before any price increase affects your account. Your continued use of the service after the price change constitutes acceptance of the new pricing.</p>
              </div>
            </section>

            {/* Section 8: Acceptable Use */}
            <section id="acceptable-use">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Acceptable Use Policy</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>You agree not to use MarketBook for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">8.1 Prohibited Activities</h3>
                <p>You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Illegal Activities:</strong> Use MarketBook for any illegal purpose, including selling prohibited or restricted goods</li>
                  <li><strong>Fraud:</strong> Engage in fraudulent activities, including fake transactions or manipulation of financial records</li>
                  <li><strong>Abuse:</strong> Harass, threaten, or harm other users or our staff</li>
                  <li><strong>Unauthorized Access:</strong> Attempt to gain unauthorized access to any part of the service, other users' accounts, or our systems</li>
                  <li><strong>Reverse Engineering:</strong> Decompile, reverse engineer, or attempt to extract source code from MarketBook</li>
                  <li><strong>Scraping:</strong> Use automated tools to scrape, crawl, or index the service without permission</li>
                  <li><strong>Reselling:</strong> Resell, sublicense, or redistribute MarketBook without our written consent</li>
                  <li><strong>Malware:</strong> Upload or transmit viruses, malware, or other malicious code</li>
                  <li><strong>Spam:</strong> Send unsolicited communications or spam through the service</li>
                  <li><strong>Misrepresentation:</strong> Misrepresent your identity, business, or affiliation</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">8.2 Consequences of Violations</h3>
                <p>Violation of this Acceptable Use Policy may result in:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Immediate suspension or termination of your account</li>
                  <li>Legal action, including reporting to law enforcement</li>
                  <li>Liability for damages caused by your violations</li>
                </ul>
              </div>
            </section>

            {/* Section 9: Data Ownership */}
            <section id="data-ownership">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Data Ownership and Privacy</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.1 Your Data Ownership</h3>
                <p>You retain all ownership rights to the Content you submit to MarketBook. We do not claim ownership of your business data, customer information, product listings, or other Content.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.2 License to Process Data</h3>
                <p>By using MarketBook, you grant us a limited, non-exclusive license to store, process, and display your Content solely for the purpose of providing the Services to you. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Storing your data on our servers</li>
                  <li>Processing data to generate reports and analytics</li>
                  <li>Displaying data in your dashboard and mobile apps</li>
                  <li>Backing up data for disaster recovery</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.3 Data Privacy</h3>
                <p>Your use of MarketBook is also governed by our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information and business data.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.4 Data Retention</h3>
                <p>We retain your data for as long as your account is active and for a reasonable period afterward to comply with legal obligations and resolve disputes. You can request deletion of your data as described in our Privacy Policy.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.5 Data Export</h3>
                <p>You may export your data from MarketBook at any time using our data export features. We recommend regular backups of business-critical data.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">9.6 Aggregated Data</h3>
                <p>We may use aggregated, anonymized data derived from your use of MarketBook for analytics, research, and service improvement purposes. This aggregated data does not identify you or your business individually.</p>
              </div>
            </section>

            {/* Section 10: Intellectual Property */}
            <section id="intellectual-property">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Intellectual Property Rights</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">10.1 MarketBook Ownership</h3>
                <p>MarketBook and all related trademarks, logos, software, designs, and content are owned by Averit Technology Limited and are protected by intellectual property laws. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The MarketBook software and source code</li>
                  <li>The MarketBook name, logo, and branding</li>
                  <li>Documentation, tutorials, and help content</li>
                  <li>Website design and user interfaces</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">10.2 Restrictions</h3>
                <p>You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Copy, modify, or create derivative works of MarketBook</li>
                  <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                  <li>Use the MarketBook name or logo without written permission</li>
                  <li>Claim ownership of any part of the MarketBook platform</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">10.3 Feedback</h3>
                <p>If you provide feedback, suggestions, or ideas about MarketBook, you grant us a perpetual, worldwide, royalty-free license to use, modify, and incorporate such feedback into our services without any obligation to you.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">10.4 Third-Party Services</h3>
                <p>MarketBook may integrate with third-party services (payment processors, messaging services, etc.). Your use of such services is subject to their respective terms and conditions.</p>
              </div>
            </section>

            {/* Section 11: Service Availability */}
            <section id="service-availability">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Service Availability and Modifications</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.1 "As-Is" Service</h3>
                <p>MarketBook is provided on an "as-is" and "as-available" basis. We strive to maintain high availability but do not guarantee uninterrupted or error-free service.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.2 Maintenance and Downtime</h3>
                <p>We may perform scheduled maintenance, updates, or repairs that may temporarily interrupt service. We will attempt to provide advance notice of planned downtime when possible, but we are not obligated to do so.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.3 Service Modifications</h3>
                <p>We reserve the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify, add, or remove features at any time</li>
                  <li>Change the design or functionality of the platform</li>
                  <li>Discontinue any aspect of the service with reasonable notice</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">11.4 No Uptime Guarantee</h3>
                <p>Unless explicitly stated in a separate Service Level Agreement (SLA), we do not guarantee any specific uptime percentage. We are not liable for any business losses resulting from service interruptions.</p>
              </div>
            </section>

            {/* Section 12: Termination */}
            <section id="termination">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Termination</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">12.1 Termination by You</h3>
                <p>You may terminate your account at any time by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Using the account cancellation feature in your settings, or</li>
                  <li>Contacting our support team</li>
                </ul>
                <p>Termination does not relieve you of any fees owed for services already provided.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">12.2 Termination by MarketBook</h3>
                <p>We may suspend or terminate your account immediately if:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You violate these Terms of Service</li>
                  <li>You fail to pay subscription fees</li>
                  <li>You engage in fraudulent or illegal activities</li>
                  <li>Your account has been inactive for an extended period</li>
                  <li>We are required to do so by law</li>
                  <li>Continuing to provide service would create legal or security risks</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">12.3 Effects of Termination</h3>
                <p>Upon termination of your account:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to MarketBook will be immediately revoked</li>
                  <li>We may delete your data after a reasonable grace period (typically 30-90 days)</li>
                  <li>You remain responsible for any outstanding fees</li>
                  <li>Sections of these Terms that by their nature should survive (e.g., liability limitations, indemnification) will continue to apply</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">12.4 Data Retrieval</h3>
                <p>After termination, you have a limited time (typically 30 days) to export your data. After this grace period, we may permanently delete your data and cannot guarantee its recovery.</p>
              </div>
            </section>

            {/* Section 13: Warranties */}
            <section id="warranties">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Disclaimers and Warranties</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.1 No Warranty</h3>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARKETBOOK IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Warranties of merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Accuracy, reliability, or completeness of data</li>
                  <li>Uninterrupted or error-free operation</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.2 Data Accuracy Disclaimer</h3>
                <p>While we strive to provide accurate calculations and data management, we do not guarantee that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Financial calculations (profit, revenue, expenses) are error-free</li>
                  <li>Inventory counts are always accurate in real-time</li>
                  <li>Reports are suitable for tax or accounting purposes without independent verification</li>
                  <li>Data synchronization will occur without conflicts or data loss</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.3 Professional Advice Disclaimer</h3>
                <p>MarketBook is not a substitute for professional advice. We do not provide:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Legal advice</li>
                  <li>Tax advice</li>
                  <li>Accounting services</li>
                  <li>Business consulting</li>
                </ul>
                <p>You should consult qualified professionals for such advice.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">13.4 Third-Party Services</h3>
                <p>We are not responsible for the performance, availability, or content of third-party services integrated with MarketBook.</p>
              </div>
            </section>

            {/* Section 14: Limitation of Liability */}
            <section id="limitation">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">14.1 Exclusion of Damages</h3>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARKETBOOK AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Loss of profits, revenue, or business</li>
                  <li>Loss of data or information</li>
                  <li>Business interruption</li>
                  <li>Loss of goodwill or reputation</li>
                  <li>Cost of substitute services</li>
                </ul>
                <p>This limitation applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise), even if we were advised of the possibility of such damages.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">14.2 Liability Cap</h3>
                <p>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO YOUR USE OF MARKETBOOK SHALL NOT EXCEED THE GREATER OF:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The amount you paid to MarketBook in the 12 months preceding the claim, or</li>
                  <li>₦100,000 (One Hundred Thousand Naira)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">14.3 Basis of the Bargain</h3>
                <p>You acknowledge that we have set our prices and entered into these Terms in reliance upon the disclaimers and limitations of liability set forth herein, which form an essential basis of the bargain between you and MarketBook.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">14.4 Jurisdictional Limitations</h3>
                <p>Some jurisdictions do not allow the exclusion or limitation of certain warranties or damages. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.</p>
              </div>
            </section>

            {/* Section 15: Indemnification */}
            <section id="indemnification">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Indemnification</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>You agree to indemnify, defend, and hold harmless MarketBook, Averit Technology Limited, and our officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use or misuse of MarketBook</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any laws or regulations</li>
                  <li>Your violation of any third-party rights, including intellectual property, privacy, or publicity rights</li>
                  <li>Any Content you submit to MarketBook</li>
                  <li>Your business operations, products, or services</li>
                  <li>Disputes between you and your customers or suppliers</li>
                  <li>Any tax obligations or regulatory non-compliance related to your business</li>
                </ul>
                <p>We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you will cooperate with us in asserting any available defenses.</p>
              </div>
            </section>

            {/* Section 16: Governing Law */}
            <section id="governing-law">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Governing Law and Dispute Resolution</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">16.1 Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">16.2 Jurisdiction</h3>
                <p>You agree that any legal action or proceeding arising out of or relating to these Terms or your use of MarketBook shall be brought exclusively in the courts located in Lagos, Nigeria, and you consent to the personal jurisdiction of such courts.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">16.3 Dispute Resolution Process</h3>
                <p>Before initiating any legal action, you agree to first contact us at support@marketbook.app to attempt to resolve the dispute informally. We will work in good faith to resolve disputes amicably.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">16.4 Class Action Waiver</h3>
                <p>To the extent permitted by law, you agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>
              </div>
            </section>

            {/* Section 17: Changes to Terms */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">17. Changes to Terms</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">17.1 Right to Modify</h3>
                <p>We reserve the right to modify these Terms at any time. When we make changes, we will:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Update the "Last Updated" date at the top of this page</li>
                  <li>Notify you via email or through the MarketBook platform</li>
                  <li>Provide a summary of material changes when practical</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">17.2 Acceptance of Changes</h3>
                <p>Your continued use of MarketBook after any changes to these Terms constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using MarketBook and may terminate your account.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">17.3 Material Changes</h3>
                <p>For material changes that negatively affect your rights, we will provide at least 30 days' advance notice before the changes take effect (except where required by law to implement changes immediately).</p>
              </div>
            </section>

            {/* Section 18: General */}
            <section id="general">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">18. General Provisions</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.1 Entire Agreement</h3>
                <p>These Terms, together with our Privacy Policy and any other legal notices or agreements published by us, constitute the entire agreement between you and MarketBook regarding your use of the Services.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.2 Severability</h3>
                <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.3 Waiver</h3>
                <p>No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term. Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.4 Assignment</h3>
                <p>You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction. Any attempted transfer or assignment in violation of this section will be null and void.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.5 Force Majeure</h3>
                <p>We shall not be liable for any failure or delay in performing our obligations due to causes beyond our reasonable control, including natural disasters, war, terrorism, riots, embargoes, acts of government, power failures, or internet disruptions.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.6 Relationship</h3>
                <p>No agency, partnership, joint venture, employer-employee, or franchiser-franchisee relationship is intended or created by these Terms.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">18.7 Survival</h3>
                <p>Provisions that by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnification, and limitations of liability.</p>
              </div>
            </section>

            {/* Section 19: Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">19. Contact Information</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>If you have questions, concerns, or disputes regarding these Terms of Service, please contact us:</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">Averit Technology Limited (MarketBook)</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> support@marketbook.app</p>
                    <p><strong>Legal Email:</strong> legal@marketbook.app</p>
                    <p><strong>Website:</strong> <a href="https://marketbook.app" className="text-blue-600 dark:text-blue-400 hover:underline">https://marketbook.app</a></p>
                    <p><strong>Address:</strong> Technology House, Lagos, Nigeria</p>
                  </div>
                </div>
                
                <p className="mt-6 text-sm">For general support inquiries, please use our in-app support chat or visit our help center. For legal matters specifically, use the legal email address above.</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Acknowledgment</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  BY USING MARKETBOOK, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SERVICE.
                </p>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Last Updated: January 8, 2026</p>
                <p className="mt-2">Version 1.0</p>
              </div>
            </div>

          </div>

          {/* Bottom Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              <FileText className="w-4 h-4" />
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
