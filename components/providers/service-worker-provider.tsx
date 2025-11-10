'use client'

import { useEffect } from 'react'
import { registerServiceWorker, unregisterServiceWorker } from '@/lib/service-worker/register'
import { toast } from 'sonner'

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // In production: register SW. In dev: ensure any existing SW is unregistered.
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('✅ Service Worker registered successfully')

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    toast.info('Update available!', {
                      description: 'Refresh to get the latest version',
                      action: {
                        label: 'Refresh',
                        onClick: () => window.location.reload(),
                      },
                    })
                  }
                })
              }
            })
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Dev: try to unregister to avoid stale precache errors
      unregisterServiceWorker().catch(() => {})
    }
  }, [])

  return <>{children}</>
}
