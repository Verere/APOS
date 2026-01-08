// SEO configuration and utilities for MarketBook

export const SEO_CONFIG = {
  siteName: 'MarketBook',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://marketbook.app',
  twitterHandle: '@marketbook',
  defaultLocale: 'en',
  
  // Global defaults
  defaultTitle: 'MarketBook - Smart POS & Inventory Management Software for African Businesses',
  defaultDescription: 'All-in-one POS system with automatic daily profit calculation, debt tracking with reminders, inventory management, and financial reports. Free forever plan. No credit card required. Trusted by 10,000+ businesses.',
  
  // Open Graph defaults
  defaultOgImage: '/og-image.png', // 1200x630px
  defaultOgType: 'website',
  
  // Business Info (for Schema)
  business: {
    name: 'MarketBook',
    legalName: 'Averit Technology Limited',
    logo: '/nlogo.svg',
    foundingDate: '2024',
    address: {
      streetAddress: 'Technology House',
      addressLocality: 'Lagos',
      addressRegion: 'Lagos State',
      postalCode: '100001',
      addressCountry: 'NG'
    },
    contactPoint: {
      telephone: '+234-XXX-XXX-XXXX',
      contactType: 'customer support',
      email: 'support@marketbook.app',
      availableLanguage: ['en', 'yo', 'ig', 'ha']
    },
    sameAs: [
      'https://twitter.com/marketbook',
      'https://facebook.com/marketbook',
      'https://linkedin.com/company/marketbook',
      'https://instagram.com/marketbook'
    ]
  }
}

/**
 * Generate comprehensive metadata for pages
 * @param {Object} options - Metadata options
 * @returns {Object} Next.js metadata object
 */
export function generateMetadata({
  title,
  description,
  path = '',
  keywords = [],
  ogImage,
  ogType = 'website',
  noindex = false,
  canonical,
  alternates,
}) {
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle
  
  const fullDescription = description || SEO_CONFIG.defaultDescription
  const url = `${SEO_CONFIG.siteUrl}${path}`
  const canonicalUrl = canonical || url
  const imageUrl = ogImage 
    ? `${SEO_CONFIG.siteUrl}${ogImage}`
    : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultOgImage}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    
    // Canonical
    alternates: {
      canonical: canonicalUrl,
      ...alternates
    },
    
    // Robots
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Open Graph
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: url,
      title: fullTitle,
      description: fullDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || SEO_CONFIG.defaultTitle,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      creator: SEO_CONFIG.twitterHandle,
      images: [imageUrl],
    },
    
    // Additional
    applicationName: SEO_CONFIG.siteName,
    authors: [{ name: SEO_CONFIG.business.legalName }],
    creator: SEO_CONFIG.business.legalName,
    publisher: SEO_CONFIG.business.legalName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    
    // Verification (add your codes here)
    verification: {
      google: 'your-google-site-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  }
}

/**
 * Generate breadcrumb structured data
 * @param {Array} items - Breadcrumb items [{name, url}]
 * @returns {Object} Breadcrumb schema
 */
export function generateBreadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SEO_CONFIG.siteUrl}${item.url}` : undefined,
    })),
  }
}

/**
 * Get SEO-optimized title for feature pages
 * @param {string} feature - Feature name
 * @param {string} benefit - Main benefit
 * @returns {string} Optimized title
 */
export function getFeatureTitle(feature, benefit) {
  return `${feature} - ${benefit} | ${SEO_CONFIG.siteName}`
}

/**
 * Get SEO-optimized title for industry pages
 * @param {string} industry - Industry name
 * @param {string} location - Location (optional)
 * @returns {string} Optimized title
 */
export function getIndustryTitle(industry, location = 'Nigeria') {
  return `Best POS System for ${industry} in ${location} | ${SEO_CONFIG.siteName}`
}

/**
 * Get SEO-optimized title for blog posts
 * @param {string} title - Post title
 * @param {number} year - Current year (optional)
 * @returns {string} Optimized title
 */
export function getBlogTitle(title, year) {
  const suffix = year ? ` (${year})` : ''
  return `${title}${suffix} | ${SEO_CONFIG.siteName} Blog`
}

/**
 * Generate JSON-LD script tag
 * @param {Object} schema - Schema.org object
 * @returns {JSX} Script tag with JSON-LD
 */
export function SchemaScript({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      key={`schema-${schema['@type']}`}
    />
  )
}
