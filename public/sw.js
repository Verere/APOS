const CACHE_NAME = 'marketbook-pos-v4'
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
    url.pathname.includes('/api/auth/session') ||
    url.pathname === '/offline' ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.webmanifest'
  )
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.startsWith('/_next/static/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|webmanifest)$/i.test(url.pathname)
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
  const isPublicNavigation = isPublicNavigationPath(requestUrl.pathname)

  // Leave app chunks and static files alone to avoid breaking Next.js runtime chunks.
  // Only do a custom offline fallback for public page navigations when the browser is truly offline.
  if (isNavigation) {
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
          if (isPublicNavigation && typeof navigator !== 'undefined' && navigator.onLine === false) {
            const cachedPage = await caches.match(event.request)
            if (cachedPage) return cachedPage

            const cachedHome = await caches.match('/')
            if (cachedHome) return cachedHome

            return caches.match(OFFLINE_FALLBACK_URL)
          }

          return fetch(event.request, { cache: 'no-store' }).catch(() => Response.error())
        })
    )
    return
  }

  // Do not intercept /_next chunks, manifest, favicon, or other static resources.
  if (isStaticAsset(event.request)) {
    event.respondWith(fetch(event.request).catch(() => Response.error()))
    return
  }

  // For all other requests, fall back to normal network behavior.
  event.respondWith(fetch(event.request).catch(() => Response.error()))
})
