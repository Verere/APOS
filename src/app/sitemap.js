import { fetchAllStores } from "@/actions"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketbook.app'

// Define static pages with priorities and change frequencies
const staticPages = [
  // Core pages (highest priority)
  { url: '', changefreq: 'daily', priority: 1.0 },
  { url: '/signup', changefreq: 'monthly', priority: 0.9 },
  { url: '/login', changefreq: 'monthly', priority: 0.8 },
  { url: '/subscription', changefreq: 'weekly', priority: 0.9 },
  
  // Feature pages (HIGH PRIORITY - main SEO targets)
  { url: '/features/pos-system', changefreq: 'weekly', priority: 0.9 },
  { url: '/features/inventory-management', changefreq: 'weekly', priority: 0.9 },
  { url: '/features/financial-tracking', changefreq: 'weekly', priority: 0.9 },
  { url: '/features/debt-management', changefreq: 'weekly', priority: 0.9 },
  { url: '/features/credit-control', changefreq: 'weekly', priority: 0.8 },
  { url: '/features/barcode-scanner', changefreq: 'monthly', priority: 0.8 },
  { url: '/features/multi-store', changefreq: 'monthly', priority: 0.8 },
  { url: '/features/expense-tracking', changefreq: 'monthly', priority: 0.8 },
  { url: '/features/sales-reports', changefreq: 'monthly', priority: 0.8 },
  { url: '/features/customer-management', changefreq: 'monthly', priority: 0.7 },
  { url: '/features/employee-management', changefreq: 'monthly', priority: 0.7 },
  { url: '/features/pricing-controls', changefreq: 'monthly', priority: 0.7 },
  { url: '/features/low-stock-alerts', changefreq: 'monthly', priority: 0.7 },
  
  // Industry pages (HIGH PRIORITY)
  { url: '/industry/retail', changefreq: 'weekly', priority: 0.8 },
  { url: '/industry/restaurant', changefreq: 'weekly', priority: 0.8 },
  { url: '/industry/pharmacy', changefreq: 'weekly', priority: 0.8 },
  { url: '/industry/supermarket', changefreq: 'weekly', priority: 0.8 },
  { url: '/industry/fashion-boutique', changefreq: 'monthly', priority: 0.7 },
  { url: '/industry/hardware-store', changefreq: 'monthly', priority: 0.7 },
  { url: '/industry/salon-spa', changefreq: 'monthly', priority: 0.7 },
  { url: '/industry/bar-lounge', changefreq: 'monthly', priority: 0.7 },
  
  // Solution pages (problem-first approach)
  { url: '/solutions/track-business-profit', changefreq: 'monthly', priority: 0.7 },
  { url: '/solutions/manage-debtors', changefreq: 'monthly', priority: 0.7 },
  { url: '/solutions/prevent-stock-theft', changefreq: 'monthly', priority: 0.7 },
  { url: '/solutions/replace-manual-books', changefreq: 'monthly', priority: 0.7 },
  { url: '/solutions/multi-currency-sales', changefreq: 'monthly', priority: 0.7 },
  
  // Comparison pages
  { url: '/compare/best-free-pos-software', changefreq: 'monthly', priority: 0.7 },
  { url: '/compare/pos-systems-nigeria', changefreq: 'monthly', priority: 0.7 },
  { url: '/compare/marketbook-vs-loyverse', changefreq: 'monthly', priority: 0.6 },
  { url: '/compare/marketbook-vs-square', changefreq: 'monthly', priority: 0.6 },
  
  // Trust & info pages (E-E-A-T)
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/security', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'monthly', priority: 0.5 },
  { url: '/terms', changefreq: 'monthly', priority: 0.5 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  
  // Blog
  { url: '/blog', changefreq: 'daily', priority: 0.7 },
]

export default async function sitemap() {
  try {
    // Get dynamic store pages
    const stores = await fetchAllStores()
    const storeUrls = stores?.map((store) => ({
      url: `${BASE_URL}/${store?.slug}`,
      lastModified: store.createdAt ? new Date(store.createdAt) : new Date(),
      changefreq: 'weekly',
      priority: 0.6,
    })) || []
    
    // Combine static and dynamic URLs
    const staticUrls = staticPages.map(page => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
      changefreq: page.changefreq,
      priority: page.priority,
    }))
    
    return [...staticUrls, ...storeUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return minimal sitemap on error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changefreq: 'daily',
        priority: 1.0,
      }
    ]
  }
}