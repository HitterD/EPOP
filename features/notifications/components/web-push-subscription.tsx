'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, BellOff, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'

interface WebPushSubscriptionProps {
  onSubscribe?: (subscription: PushSubscription) => Promise<void>
  onUnsubscribe?: () => Promise<void>
}

export function WebPushSubscription({ onSubscribe, onUnsubscribe }: WebPushSubscriptionProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if service worker and Push API are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        toast.error('Notification permission denied')
        setIsLoading(false)
        return
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
      }

      // Get VAPID public key from backend
      // In production, this should come from your API
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      
      if (!vapidPublicKey) {
        toast.error('VAPID public key not configured')
        setIsLoading(false)
        return
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      // Send subscription to backend
      if (onSubscribe) {
        await onSubscribe(subscription)
      }

      setIsSubscribed(true)
      toast.success('Push notifications enabled!')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to enable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        
        if (onUnsubscribe) {
          await onUnsubscribe()
        }

        setIsSubscribed(false)
        toast.success('Push notifications disabled')
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      toast.error('Notification permission not granted')
      return
    }

    // Show a test notification
    const registration = await navigator.serviceWorker.ready
    
    registration.showNotification('Test Notification', {
      body: 'This is a test notification from EPOP',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        url: window.location.origin,
      },
    })

    toast.success('Test notification sent!')
  }

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle size={16} />
        <AlertDescription>
          Push notifications are not supported in this browser.
          Please use Chrome, Firefox, or Edge.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} />
          Web Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications even when EPOP is closed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div>
            <p className="text-sm font-medium">Permission Status</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {permission === 'granted' && 'Granted ✓'}
              {permission === 'denied' && 'Denied ✗'}
              {permission === 'default' && 'Not requested'}
            </p>
          </div>
          <div>
            {permission === 'granted' ? (
              <Check className="text-green-500" size={24} />
            ) : permission === 'denied' ? (
              <BellOff className="text-red-500" size={24} />
            ) : (
              <Bell className="text-gray-400" size={24} />
            )}
          </div>
        </div>

        {/* Subscription status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div>
            <p className="text-sm font-medium">Subscription Status</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isSubscribed ? 'Subscribed' : 'Not subscribed'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={isLoading}
              >
                {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            )}
          </div>
        </div>

        {/* Test notification button */}
        {isSubscribed && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-dashed">
            <div>
              <p className="text-sm font-medium">Test Notification</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Send a test push notification
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleTestNotification}>
              Send Test
            </Button>
          </div>
        )}

        {/* Instructions */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle size={16} />
            <AlertDescription className="text-xs">
              You have blocked notifications. To enable them, click the lock icon in your browser's
              address bar and change the notification permission.
            </AlertDescription>
          </Alert>
        )}

        {!isSubscribed && permission === 'default' && (
          <Alert>
            <AlertDescription className="text-xs">
              Click "Subscribe" to enable push notifications. You'll be asked to grant permission.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
