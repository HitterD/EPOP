/**
 * Web Push Notification utilities
 */

/**
 * Check if Web Push is supported by the browser
 */
export function isWebPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription> {
  if (!isWebPushSupported()) {
    throw new Error('Web Push not supported')
  }

  // Register service worker if not already registered
  let registration = await navigator.serviceWorker.getRegistration()
  
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js')
  }

  // Wait for service worker to be ready
  await navigator.serviceWorker.ready

  // Check existing subscription
  let subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    return subscription
  }

  // Create new subscription
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  })

  return subscription
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isWebPushSupported()) {
    return false
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return false
  }

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    return false
  }

  return await subscription.unsubscribe()
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) {
    return null
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return null
  }

  return await registration.pushManager.getSubscription()
}

/**
 * Convert URL-safe base64 to Uint8Array for VAPID key
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Show local notification (for testing or fallback)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('Notification' in window)) {
    return
  }

  if (Notification.permission !== 'granted') {
    await requestNotificationPermission()
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}
