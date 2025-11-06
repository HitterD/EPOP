// EPOP Service Worker
// Handles Web Push notifications and offline caching

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'epop-v1'
const RUNTIME_CACHE = 'epop-runtime'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache on network error
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline')
        })
      })
  )
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options: NotificationOptions = {
    body: data.body || 'New notification',
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'epop-notification',
    data: data.data || {},
    requireInteraction: false,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'EPOP', options)
  )
})

// Notification click event - focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if found
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

export {}
