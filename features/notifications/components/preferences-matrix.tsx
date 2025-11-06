'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, Smartphone, Info } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  [eventType: string]: {
    inApp: boolean
    email: boolean
    webPush: boolean
  }
}

const eventTypes = [
  {
    id: 'chatMentions',
    label: 'Chat Mentions',
    description: 'When someone @mentions you in a message',
    default: { inApp: true, email: true, webPush: true },
  },
  {
    id: 'taskAssigned',
    label: 'Task Assigned',
    description: 'When you are assigned as owner or reviewer',
    default: { inApp: true, email: true, webPush: true },
  },
  {
    id: 'importantMail',
    label: 'Important Mail',
    description: 'High priority or flagged emails',
    default: { inApp: true, email: false, webPush: true },
  },
  {
    id: 'calendarReminder',
    label: 'Calendar Reminder',
    description: 'Upcoming events and meetings',
    default: { inApp: true, email: true, webPush: true },
  },
  {
    id: 'projectUpdates',
    label: 'Project Updates',
    description: 'Status changes, milestone completions',
    default: { inApp: true, email: false, webPush: false },
  },
  {
    id: 'systemAlerts',
    label: 'System Alerts',
    description: 'Storage limits, failed jobs, errors',
    default: { inApp: true, email: true, webPush: false },
  },
]

export function PreferencesMatrix() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    // Initialize with defaults
    const initial: NotificationPreferences = {}
    eventTypes.forEach((event) => {
      initial[event.id] = { ...event.default }
    })
    return initial
  })

  const [hasChanges, setHasChanges] = useState(false)

  const toggleChannel = (eventType: string, channel: 'inApp' | 'email' | 'webPush') => {
    setPreferences((prev) => ({
      ...prev,
      [eventType]: {
        ...prev[eventType],
        [channel]: !prev[eventType][channel],
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In production: await updateNotificationPreferences(preferences)
    toast.success('Notification preferences saved')
    setHasChanges(false)
  }

  const handleReset = () => {
    const initial: NotificationPreferences = {}
    eventTypes.forEach((event) => {
      initial[event.id] = { ...event.default }
    })
    setPreferences(initial)
    setHasChanges(true)
    toast.info('Preferences reset to defaults')
  }

  const getChannelCount = (channel: 'inApp' | 'email' | 'webPush') => {
    return Object.values(preferences).filter((pref) => pref[channel]).length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications for each event type
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
              Reset to Defaults
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Badges */}
        <div className="mb-6 flex gap-3">
          <Badge variant="secondary" className="gap-2">
            <Bell className="h-3 w-3" />
            In-App: {getChannelCount('inApp')}/{eventTypes.length}
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Mail className="h-3 w-3" />
            Email: {getChannelCount('email')}/{eventTypes.length}
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Smartphone className="h-3 w-3" />
            Push: {getChannelCount('webPush')}/{eventTypes.length}
          </Badge>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left font-semibold">Event Type</th>
                <th className="pb-4 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs">In-App</span>
                  </div>
                </th>
                <th className="pb-4 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">Email</span>
                  </div>
                </th>
                <th className="pb-4 text-center font-semibold">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">Web Push</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((event, index) => (
                <tr
                  key={event.id}
                  className={`border-b transition-colors hover:bg-muted/50 ${
                    index % 2 === 0 ? 'bg-muted/20' : ''
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div>
                      <div className="font-medium">{event.label}</div>
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={preferences[event.id]?.inApp ?? false}
                        onCheckedChange={() => toggleChannel(event.id, 'inApp')}
                      />
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={preferences[event.id]?.email ?? false}
                        onCheckedChange={() => toggleChannel(event.id, 'email')}
                      />
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={preferences[event.id]?.webPush ?? false}
                        onCheckedChange={() => toggleChannel(event.id, 'webPush')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Note */}
        <div className="mt-6 flex gap-2 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/20">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">About Notification Channels</p>
            <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>
                <strong>In-App:</strong> Bell icon in navigation bar with badge count
              </li>
              <li>
                <strong>Email:</strong> Sent to your registered email address
              </li>
              <li>
                <strong>Web Push:</strong> Browser notifications (requires permission)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
