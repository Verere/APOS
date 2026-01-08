// Dynamic robots.txt for SEO optimization

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketbook.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/*?*utm_source=*', // Block URL tracking parameters from indexing
          '/*?*sessionid=*',
          '/*?*ref=*',
          '/[slug]/dashboard/',
          '/[slug]/cart/',
          '/[slug]/pos/',
          '/auth/',
          '/forgot-password/',
          '/reset-password/',
        ],
      },
      // Allow major search engine bots full access to public pages
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/auth/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
