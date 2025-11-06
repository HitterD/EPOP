'use client'

import { useEffect, useState } from 'react'
import {
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  requestNotificationPermission,
} from './register'

interface UseServiceWorkerReturn {
  isSupported: boolean
  isRegistered: boolean
  isSubscribed: boolean
  permission: NotificationPermission
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  requestPermission: () => Promise<NotificationPermission>
}

/**
 * Hook to manage service worker and push notifications
 */
export function useServiceWorker(vapidPublicKey?: string): UseServiceWorkerReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if service worker is supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)

      // Check current permission
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }

      // Register service worker
      registerServiceWorker().then((registration) => {
        if (registration) {
          setIsRegistered(true)

          // Check if already subscribed to push
          getPushSubscription().then((subscription) => {
            setIsSubscribed(!!subscription)
          })
        }
      })
    }
  }, [])

  const subscribe = async (): Promise<boolean> => {
    if (!vapidPublicKey) {
      console.error('VAPID public key not provided')
      return false
    }

    const subscription = await subscribeToPush(vapidPublicKey)
    if (subscription) {
      setIsSubscribed(true)
      setPermission('granted')

      // Send subscription to backend
      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      } catch (error) {
        console.error('Failed to save subscription to backend:', error)
      }

      return true
    }

    return false
  }

  const unsubscribe = async (): Promise<boolean> => {
    const success = await unsubscribeFromPush()
    if (success) {
      setIsSubscribed(false)

      // Remove subscription from backend
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to remove subscription from backend:', error)
      }
    }

    return success
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    const newPermission = await requestNotificationPermission()
    setPermission(newPermission)
    return newPermission
  }

  return {
    isSupported,
    isRegistered,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}
