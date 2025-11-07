'use client'

import { useEffect, useState } from 'react'
import type { NotificationPreferences } from '@/types'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/lib/api/hooks/use-notifications'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Bell, MessageCircle, Folder, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationSettingsPage() {
  const { data: preferences, isLoading } = useNotificationPreferences()
  const { mutate: updatePreferences } = useUpdateNotificationPreferences()

  const defaultPrefs: NotificationPreferences = {
    enabled: true,
    webPushEnabled: false,
    soundEnabled: true,
    desktopEnabled: true,
    doNotDisturb: { enabled: false, startTime: '22:00', endTime: '08:00' },
    channels: [],
  }
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences ?? defaultPrefs)

  useEffect(() => {
    if (preferences) {
      const dnd = preferences.doNotDisturb ?? { enabled: false, startTime: '22:00', endTime: '08:00' }
      setLocalPrefs({
        enabled: preferences.enabled,
        webPushEnabled: preferences.webPushEnabled,
        soundEnabled: preferences.soundEnabled,
        desktopEnabled: preferences.desktopEnabled,
        doNotDisturb: dnd,
        channels: preferences.channels ?? [],
        ...(preferences.userId ? { userId: preferences.userId } : {}),
      })
    }
  }, [preferences])

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const updated: NotificationPreferences = { ...localPrefs, [key]: value } as NotificationPreferences
    setLocalPrefs(updated)
    
    // Auto-save with optimistic update
    updatePreferences(updated, {
      onError: () => {
        setLocalPrefs(preferences ?? defaultPrefs) // Rollback on error
        toast.error('Failed to update settings')
      },
      onSuccess: () => {
        toast.success('Settings updated')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            General
          </CardTitle>
          <CardDescription>
            Master controls for all notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications for activity
              </p>
            </div>
            <Switch
              checked={localPrefs?.enabled ?? true}
              onCheckedChange={(checked) => handleToggle('enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive push notifications when app is closed
              </p>
            </div>
            <Switch
              checked={localPrefs?.webPushEnabled ?? false}
              onCheckedChange={(checked) => handleToggle('webPushEnabled', checked)}
              disabled={!localPrefs?.enabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Play sound for new notifications
              </p>
            </div>
            <Switch
              checked={localPrefs?.soundEnabled ?? true}
              onCheckedChange={(checked) => handleToggle('soundEnabled', checked)}
              disabled={!localPrefs?.enabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Desktop notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show desktop notifications
              </p>
            </div>
            <Switch
              checked={localPrefs?.desktopEnabled ?? true}
              onCheckedChange={(checked) => handleToggle('desktopEnabled', checked)}
              disabled={!localPrefs?.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Quiet hours - no notifications during this time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable quiet hours</Label>
            <Switch
              checked={localPrefs?.doNotDisturb?.enabled ?? false}
              onCheckedChange={(checked) =>
                setLocalPrefs({
                  ...localPrefs,
                  doNotDisturb: {
                    enabled: checked,
                    startTime: localPrefs?.doNotDisturb?.startTime ?? '22:00',
                    endTime: localPrefs?.doNotDisturb?.endTime ?? '08:00',
                  },
                })
              }
            />
          </div>

          {localPrefs?.doNotDisturb?.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <input
                    type="time"
                    value={localPrefs?.doNotDisturb?.startTime || '22:00'}
                    onChange={(e) =>
                      setLocalPrefs({
                        ...localPrefs,
                        doNotDisturb: {
                          enabled: localPrefs?.doNotDisturb?.enabled ?? true,
                          startTime: e.target.value,
                          endTime: localPrefs?.doNotDisturb?.endTime ?? '08:00',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <input
                    type="time"
                    value={localPrefs?.doNotDisturb?.endTime || '08:00'}
                    onChange={(e) =>
                      setLocalPrefs({
                        ...localPrefs,
                        doNotDisturb: {
                          enabled: localPrefs?.doNotDisturb?.enabled ?? true,
                          startTime: localPrefs?.doNotDisturb?.startTime ?? '22:00',
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Channel-specific settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            Chat Notifications
          </CardTitle>
          <CardDescription>
            Per-chat notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage notification settings for individual chats in the chat settings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder size={20} />
            Project Notifications
          </CardTitle>
          <CardDescription>
            Per-project notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage notification settings for individual projects in the project settings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Mail Notifications
          </CardTitle>
          <CardDescription>
            Email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New mail in inbox</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified for new emails
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
