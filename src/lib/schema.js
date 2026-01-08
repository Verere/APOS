// Schema.org structured data generators for MarketBook

import { SEO_CONFIG } from './seo'

/**
 * Generate SoftwareApplication schema for homepage and feature pages
 * @param {Object} options - Software schema options
 * @returns {Object} SoftwareApplication schema
 */
export function generateSoftwareSchema({
  name = 'MarketBook',
  description,
  url = SEO_CONFIG.siteUrl,
  operatingSystem = 'Web Browser, iOS, Android',
  category = 'BusinessApplication',
  offers = [],
  featureList = []
} = {}) {
  const defaultFeatures = [
    'Point of Sale System',
    'Inventory Management',
    'Automatic Daily Profit Calculation',
    'Monthly Financial Reports',
    'Debt Tracking & Automated Reminders',
    'Credit Limit Control',
    'Multi-Store Management',
    'Barcode Scanning',
    'Expense Tracking',
    'Customer Management',
    'Sales Analytics',
    'Low Stock Alerts',
    'Receipt Printing',
    'Multi-Currency Support (18 currencies)',
    'Employee Access Management'
  ]

  const defaultOffers = [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      name: 'Free Plan',
      description: 'Forever free plan with essential POS and inventory features',
      availability: 'https://schema.org/InStock',
      url: `${SEO_CONFIG.siteUrl}/signup`,
    },
    {
      '@type': 'Offer',
      price: '35000',
      priceCurrency: 'NGN',
      name: 'Starter Plan',
      description: 'For growing businesses with advanced features',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: `${SEO_CONFIG.siteUrl}/subscription`,
    },
    {
      '@type': 'Offer',
      price: '60000',
      priceCurrency: 'NGN',
      name: 'Basic Plan',
      description: 'Most popular plan for small to medium businesses',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: `${SEO_CONFIG.siteUrl}/subscription`,
    },
    {
      '@type': 'Offer',
      price: '110000',
      priceCurrency: 'NGN',
      name: 'Professional Plan',
      description: 'For growing businesses with multiple locations',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: `${SEO_CONFIG.siteUrl}/subscription`,
    }
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name,
    url: url,
    description: description || SEO_CONFIG.defaultDescription,
    applicationCategory: category,
    operatingSystem: operatingSystem,
    offers: offers.length > 0 ? offers : defaultOffers,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1'
    },
    softwareVersion: '2.0',
    softwareRequirements: 'Modern web browser with JavaScript enabled',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    screenshot: `${SEO_CONFIG.siteUrl}/screenshots/dashboard.png`,
    featureList: featureList.length > 0 ? featureList : defaultFeatures,
    author: {
      '@type': 'Organization',
      name: SEO_CONFIG.business.legalName,
      url: SEO_CONFIG.siteUrl,
    },
    provider: {
      '@type': 'Organization',
      name: SEO_CONFIG.business.legalName,
      url: SEO_CONFIG.siteUrl,
    },
    downloadUrl: `${SEO_CONFIG.siteUrl}/signup`,
    installUrl: `${SEO_CONFIG.siteUrl}/signup`,
  }
}

/**
 * Generate Organization schema for company pages
 * @returns {Object} Organization schema
 */
export function generateOrganizationSchema() {
  const business = SEO_CONFIG.business
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: business.name,
    legalName: business.legalName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}${business.logo}`,
    foundingDate: business.foundingDate,
    description: 'Leading provider of POS and inventory management software for African businesses',
    address: {
      '@type': 'PostalAddress',
      ...business.address
    },
    contactPoint: {
      '@type': 'ContactPoint',
      ...business.contactPoint
    },
    sameAs: business.sameAs,
    founder: {
      '@type': 'Organization',
      name: business.legalName
    }
  }
}

/**
 * Generate FAQPage schema
 * @param {Array} faqs - Array of {question, answer} objects
 * @returns {Object} FAQPage schema
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

/**
 * Generate Product schema for subscription plans
 * @param {Object} options - Product schema options
 * @returns {Object} Product schema
 */
export function generateProductSchema({
  name,
  description,
  image,
  brand = SEO_CONFIG.business.name,
  category = 'Software',
  sku,
  offers = []
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    category: category,
    sku: sku,
    offers: offers.map(offer => ({
      '@type': 'Offer',
      ...offer,
      availability: offer.availability || 'https://schema.org/InStock',
      url: offer.url || `${SEO_CONFIG.siteUrl}/subscription`,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1'
    }
  }
}

/**
 * Generate Article schema for blog posts
 * @param {Object} options - Article schema options
 * @returns {Object} Article schema
 */
export function generateArticleSchema({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  authorName = SEO_CONFIG.business.legalName,
  category,
  keywords = []
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}/og-image.png`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SEO_CONFIG.siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.business.legalName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.business.logo}`,
        width: 512,
        height: 512
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || SEO_CONFIG.siteUrl
    },
    articleSection: category,
    keywords: keywords.join(', ')
  }
}

/**
 * Generate BreadcrumbList schema
 * @param {Array} items - Array of {name, url} objects
 * @returns {Object} BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items) {
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
 * Generate Review schema
 * @param {Object} review - Review data
 * @returns {Object} Review schema
 */
export function generateReviewSchema({
  reviewBody,
  reviewRating,
  authorName,
  datePublished,
  itemReviewed = 'MarketBook POS Software'
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewBody: reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewRating,
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Person',
      name: authorName
    },
    datePublished: datePublished,
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: itemReviewed
    }
  }
}

/**
 * Generate HowTo schema for tutorial/guide content
 * @param {Object} options - HowTo schema options
 * @returns {Object} HowTo schema
 */
export function generateHowToSchema({
  name,
  description,
  image,
  estimatedCost,
  steps = []
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: name,
    description: description,
    image: image ? `${SEO_CONFIG.siteUrl}${image}` : undefined,
    estimatedCost: estimatedCost || {
      '@type': 'MonetaryAmount',
      currency: 'NGN',
      value: '0'
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? `${SEO_CONFIG.siteUrl}${step.image}` : undefined,
      url: step.url ? `${SEO_CONFIG.siteUrl}${step.url}` : undefined
    }))
  }
}

/**
 * Helper component to inject schema into page
 * @param {Object} schema - Schema.org object
 * @returns {JSX} Script tag with JSON-LD
 */
export function SchemaMarkup({ schema }) {
  if (!schema) return null
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
