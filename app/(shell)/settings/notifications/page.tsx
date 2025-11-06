'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useSubscribeWebPush,
  useUnsubscribeWebPush,
} from '@/lib/api/hooks/use-notifications'
import {
  isWebPushSupported,
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPush,
  getCurrentSubscription,
  unsubscribeFromPush,
} from '@/lib/utils/web-push'

export default function NotificationSettingsPage() {
  const { data: prefs } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()
  const subscribePush = useSubscribeWebPush()
  const unsubscribePush = useUnsubscribeWebPush()

  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(isWebPushSupported())
    setPermission(getNotificationPermission())
  }, [])

  const channels = useMemo(() => prefs?.channels || [], [prefs])

  const handleEnablePush = async () => {
    try {
      if (!supported) return
      const perm = await requestNotificationPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      if (!vapidKey) throw new Error('VAPID key missing')

      const sub = await subscribeToPush(vapidKey)
      await subscribePush.mutateAsync(sub)
    } catch {}
  }

  const handleDisablePush = async () => {
    try {
      const sub = await getCurrentSubscription()
      await unsubscribeFromPush()
      await unsubscribePush.mutateAsync()
    } catch {}
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage in-app and push notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">Web Push</div>
                <div className="text-sm text-muted-foreground">
                  {supported ? (
                    permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked by browser' : 'Not enabled'
                  ) : (
                    'Not supported on this browser'
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDisablePush} disabled={!supported || permission !== 'granted' || unsubscribePush.isPending}>
                  Disable
                </Button>
                <Button onClick={handleEnablePush} disabled={!supported || subscribePush.isPending}>
                  Enable
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Channels</div>
              {channels.length === 0 && (
                <div className="rounded border p-3 text-sm text-muted-foreground">No channels configured.</div>
              )}
              {channels.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between rounded border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.channelType === 'chat' ? 'Chat' : c.channelType === 'project' ? 'Project' : 'General'}</Badge>
                    <div className="text-sm text-muted-foreground">{c.channelId || 'All'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={c.enabled ? 'secondary' : 'outline'}
                      onClick={() => updatePrefs.mutate({ channels: channels.map((x, i) => i === idx ? { ...x, enabled: !x.enabled } : x) })}
                      disabled={updatePrefs.isPending}
                    >
                      {c.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
