// EPOP Service Worker for Web Push Notifications
// Version: 1.0.0

const CACHE_NAME = 'epop-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event)

  let notificationData = {
    title: 'EPOP Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: '/',
    },
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || 'epop-notification',
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || data.actionUrl || '/',
          notificationId: data.id,
          type: data.type,
          ...data.data,
        },
      }
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    })
  )
})

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open with this URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event)
})

// Fetch event - network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // If network fails, try cache; on navigation, fall back to offline page
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
          return undefined
        })
      })
  )
})

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('[Service Worker] Loaded')

// Outbox helpers (IndexedDB)
const OUTBOX_DB = 'epop'
const OUTBOX_STORE = 'outbox'

function openOutboxDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OUTBOX_DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAllOutbox() {
  const db = await openOutboxDb()
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly')
    const req = tx.objectStore(OUTBOX_STORE).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

async function deleteOutbox(id) {
  const db = await openOutboxDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(OUTBOX_STORE).delete(id)
  })
}

async function flushOutbox() {
  const items = await getAllOutbox()
  if (!items || items.length === 0) return
  for (const item of items) {
    try {
      const resp = await fetch(item.url, {
        method: item.method || 'POST',
        headers: item.headers || {},
        body: item.body,
        credentials: 'include',
      })
      if (resp && resp.ok) {
        await deleteOutbox(item.id)
      }
    } catch (err) {
      // keep it for next retry
      console.warn('[Service Worker] Outbox send failed; will retry later', err)
    }
  }
}

// Background Sync: process outbox when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'outbox-sync') {
    console.log('[Service Worker] Background sync: outbox-sync')
    event.waitUntil(flushOutbox())
  }
})

// Trigger outbox from clients (when online detected)
self.addEventListener('message', (event) => {
  if (event?.data?.type === 'TRIGGER_OUTBOX') {
    event.waitUntil?.(flushOutbox())
  }
})
