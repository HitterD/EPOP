/**
 * Service Worker Registration
 * Registers service worker for Web Push and offline support
 */

import { urlBase64ToUint8Array } from '@/lib/utils/web-push';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return null
  }

  try {
    // Wait for page load
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        window.addEventListener('load', resolve, { once: true })
      })
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration.scope)

    // Check for updates every hour
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const unregistered = await registration.unregister()
    console.log('Service Worker unregistered:', unregistered)
    return unregistered
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
    return false
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready

    // Request permission first
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    // Subscribe to push
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey) as BufferSource;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })

    console.log('Push subscription created:', subscription.endpoint)
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return true
    }

    const unsubscribed = await subscription.unsubscribe()
    console.log('Push unsubscribed:', unsubscribed)
    return unsubscribed
  } catch (error) {
    console.error('Push unsubscription failed:', error)
    return false
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Failed to get push subscription:', error)
    return null
  }
}
