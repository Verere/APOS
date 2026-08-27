const CACHE_NAME = 'marketbook-pos-v2'
const OFFLINE_FALLBACK_URL = '/offline'
const PRECACHE_URLS = ['/', OFFLINE_FALLBACK_URL, '/manifest.webmanifest']

const PUBLIC_NAVIGATION_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/features',
  '/industry',
]

function isPublicNavigationPath(pathname) {
  return PUBLIC_NAVIGATION_PATHS.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

function isExcludedRequest(request) {
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return true

  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/subscription') ||
    url.pathname.startsWith('/referral') ||
    url.pathname.startsWith('/store') ||
    url.pathname.includes('/api/auth/session')
  )
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith('/_next/static/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(url.pathname)
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (isExcludedRequest(event.request)) return

  const requestUrl = new URL(event.request.url)
  const isNavigation = event.request.mode === 'navigate'
  const shouldCacheAsset = isStaticAsset(event.request)

  if (isNavigation) {
    const isPublicNavigation = isPublicNavigationPath(requestUrl.pathname)

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (isPublicNavigation && response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          }

          return response
        })
        .catch(async () => {
          if (isPublicNavigation) {
            const cachedPage = await caches.match(event.request)
            if (cachedPage) return cachedPage
          }

          return caches.match(OFFLINE_FALLBACK_URL)
        })
    )
    return
  }

  if (!shouldCacheAsset) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
        return response
      }).catch(() => {
        if (isNavigation) {
          return caches.match('/')
        }
        return Response.error()
      })
    })
  )
})
