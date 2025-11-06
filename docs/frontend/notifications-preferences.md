# Email Notifications & Preferences UI

## Overview

The Notifications Preferences UI allows users to customize how they receive notifications across different channels (in-app, email, web push) and configure quiet hours. This feature provides granular control over notification behavior for each event type.

## Features

### Wave-3 (Planned)
- **Preferences Matrix**: Grid layout for event types × notification channels
- **Event Categories**:
  - Chat mentions (@mentions in messages)
  - Task assignments (assigned as owner/reviewer)
  - Important mail (flagged emails)
  - Calendar reminders (upcoming events)
  - Project updates (status changes, milestone completions)
  - System alerts (storage limits, failed jobs)
- **Notification Channels**:
  - In-app notifications (bell icon in nav bar)
  - Email notifications (sent to user's email)
  - Web push notifications (browser notifications)
- **Quiet Hours**: Configure time periods to suppress notifications
- **Digest Mode**: Group notifications into daily/weekly digests
- **Save/Reset**: Save preferences or reset to defaults

### Wave-4 (Future)
- **Smart Notifications**: AI-powered priority detection
- **Channel Priority**: Set preferred channel per event urgency
- **Custom Rules**: Advanced rules engine (if X then Y)
- **Notification Templates**: Customize email/push message format

## File Locations

```
app/(shell)/settings/notifications/page.tsx    # Preferences page
features/notifications/components/             # Notification components
lib/api/hooks/use-notification-settings.ts    # Settings API hooks
```

## UI Layout

### Preferences Matrix

```
┌─────────────────────────────────────────────────────────────┐
│ Event Type             │ In-App │ Email │ Web Push │        │
├─────────────────────────────────────────────────────────────┤
│ Chat Mentions          │   ✓    │   ✓   │    ✓     │  Edit  │
│ Task Assigned          │   ✓    │   ✓   │    ✓     │  Edit  │
│ Important Mail         │   ✓    │   -   │    ✓     │  Edit  │
│ Calendar Reminder      │   ✓    │   ✓   │    ✓     │  Edit  │
│ Project Updates        │   ✓    │   -   │    -     │  Edit  │
│ System Alerts          │   ✓    │   ✓   │    -     │  Edit  │
└─────────────────────────────────────────────────────────────┘
```

### Quiet Hours Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ Quiet Hours                                                  │
├─────────────────────────────────────────────────────────────┤
│ Enable quiet hours:  ☑                                      │
│                                                              │
│ From:  [22:00] ▼    To:  [07:00] ▼                         │
│                                                              │
│ Days:  ☑ Mon  ☑ Tue  ☑ Wed  ☑ Thu  ☑ Fri  ☐ Sat  ☐ Sun    │
│                                                              │
│ During quiet hours:                                          │
│ • In-app: Show badge count only (no popups)                │
│ • Email: Hold until quiet hours end                         │
│ • Web Push: Suppress all notifications                      │
│                                                              │
│ Exceptions: ☑ Allow urgent/critical alerts                 │
└─────────────────────────────────────────────────────────────┘
```

## Backend Contract

### Get Notification Settings

```
GET /api/v1/notifications/settings

Response:
{
  preferences: {
    chatMentions: {
      inApp: boolean,
      email: boolean,
      webPush: boolean,
      digest: boolean
    },
    taskAssigned: { /* same structure */ },
    importantMail: { /* same structure */ },
    calendarReminder: { /* same structure */ },
    projectUpdates: { /* same structure */ },
    systemAlerts: { /* same structure */ }
  },
  quietHours: {
    enabled: boolean,
    from: string, // "22:00"
    to: string,   // "07:00"
    days: number[], // [1,2,3,4,5] = Mon-Fri
    allowUrgent: boolean
  },
  digest: {
    enabled: boolean,
    frequency: 'daily' | 'weekly',
    time: string, // "09:00"
    day?: number  // For weekly: 1 = Monday
  }
}
```

### Update Notification Settings

```
PUT /api/v1/notifications/settings

Body:
{
  preferences?: {
    [eventType: string]: {
      inApp?: boolean,
      email?: boolean,
      webPush?: boolean
    }
  },
  quietHours?: {
    enabled: boolean,
    from: string,
    to: string,
    days: number[],
    allowUrgent: boolean
  },
  digest?: {
    enabled: boolean,
    frequency: 'daily' | 'weekly',
    time: string,
    day?: number
  }
}

Response:
{
  settings: { /* Full settings object */ }
}
```

### Test Notification

```
POST /api/v1/notifications/test

Body:
{
  eventType: string,
  channels: ('inApp' | 'email' | 'webPush')[]
}

Response:
{
  sent: {
    inApp: boolean,
    email: boolean,
    webPush: boolean
  },
  suppressedBy?: 'quietHours' | 'userPreference'
}
```

## Component Architecture

### Preferences Matrix Component

```typescript
interface NotificationPreference {
  eventType: string
  label: string
  description: string
  defaultChannels: {
    inApp: boolean
    email: boolean
    webPush: boolean
  }
}

const eventTypes: NotificationPreference[] = [
  {
    eventType: 'chatMentions',
    label: 'Chat Mentions',
    description: 'When someone @mentions you in a chat',
    defaultChannels: { inApp: true, email: true, webPush: true }
  },
  // ... more event types
]

function PreferencesMatrix() {
  const { data: settings, mutate } = useNotificationSettings()
  
  const toggleChannel = (eventType: string, channel: string) => {
    mutate({
      preferences: {
        ...settings.preferences,
        [eventType]: {
          ...settings.preferences[eventType],
          [channel]: !settings.preferences[eventType][channel]
        }
      }
    })
  }
  
  return (
    <table>
      <thead>
        <tr>
          <th>Event Type</th>
          <th>In-App</th>
          <th>Email</th>
          <th>Web Push</th>
        </tr>
      </thead>
      <tbody>
        {eventTypes.map((event) => (
          <tr key={event.eventType}>
            <td>
              <div>{event.label}</div>
              <div className="text-sm text-muted">{event.description}</div>
            </td>
            <td>
              <Checkbox
                checked={settings.preferences[event.eventType]?.inApp}
                onCheckedChange={() => toggleChannel(event.eventType, 'inApp')}
              />
            </td>
            <td>
              <Checkbox
                checked={settings.preferences[event.eventType]?.email}
                onCheckedChange={() => toggleChannel(event.eventType, 'email')}
              />
            </td>
            <td>
              <Checkbox
                checked={settings.preferences[event.eventType]?.webPush}
                onCheckedChange={() => toggleChannel(event.eventType, 'webPush')}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Quiet Hours Component

```typescript
function QuietHoursSettings() {
  const { data: settings, mutate } = useNotificationSettings()
  const [enabled, setEnabled] = useState(settings.quietHours.enabled)
  const [from, setFrom] = useState(settings.quietHours.from)
  const [to, setTo] = useState(settings.quietHours.to)
  const [days, setDays] = useState(settings.quietHours.days)
  
  const handleSave = () => {
    mutate({
      quietHours: { enabled, from, to, days, allowUrgent: true }
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiet Hours</CardTitle>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From</Label>
              <Select value={from} onValueChange={setFrom}>
                {/* Time options */}
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select value={to} onValueChange={setTo}>
                {/* Time options */}
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Days</Label>
            <div className="flex gap-2 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <Button
                  key={day}
                  variant={days.includes(i + 1) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(i + 1)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
          
          <Button onClick={handleSave}>Save Quiet Hours</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Notification Delivery Logic

### Backend Processing

When an event occurs that triggers a notification:

1. **Check User Preferences**: Query user's notification settings
2. **Apply Quiet Hours**: If in quiet hours, hold or suppress
3. **Channel Routing**: Send to enabled channels only
4. **Digest Accumulation**: If digest mode, queue for batch send
5. **Delivery**: Execute actual notification send

```typescript
// Backend pseudo-code
async function sendNotification(userId: string, event: NotificationEvent) {
  const settings = await getNotificationSettings(userId)
  const preference = settings.preferences[event.type]
  
  // Check quiet hours
  if (isInQuietHours(settings.quietHours) && !event.urgent) {
    await queueForLater(userId, event)
    return
  }
  
  // Send to enabled channels
  if (preference.inApp) {
    await sendInAppNotification(userId, event)
  }
  
  if (preference.email) {
    if (settings.digest.enabled) {
      await queueForDigest(userId, event)
    } else {
      await sendEmailNotification(userId, event)
    }
  }
  
  if (preference.webPush) {
    await sendWebPushNotification(userId, event)
  }
}
```

## Web Push Setup

### Service Worker Registration

```typescript
// lib/notifications/push.ts
export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported')
  }
  
  const registration = await navigator.serviceWorker.register('/sw.ts')
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  })
  
  // Send subscription to backend
  await saveSubscription(subscription)
}
```

### Permission Request

```typescript
function NotificationPermissionPrompt() {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      await registerPushNotifications()
      toast.success('Push notifications enabled')
    } else {
      toast.error('Push notification permission denied')
    }
  }
  
  return (
    <Alert>
      <AlertTitle>Enable Browser Notifications</AlertTitle>
      <AlertDescription>
        Get instant alerts even when EPop is not open
      </AlertDescription>
      <Button onClick={requestPermission}>Enable</Button>
    </Alert>
  )
}
```

## Accessibility

- **Clear Labels**: All checkboxes have descriptive labels
- **Keyboard Navigation**: Tab through all settings, Space to toggle
- **Screen Reader**: 
  - Announces preference changes
  - Describes quiet hours configuration
- **Visual Feedback**: Changes show immediate visual confirmation

## Testing

### Unit Tests

```typescript
describe('Notification settings', () => {
  it('toggles notification channel', () => {
    const { result } = renderHook(() => useNotificationSettings())
    
    act(() => result.current.toggleChannel('chatMentions', 'email'))
    
    expect(result.current.settings.preferences.chatMentions.email).toBe(false)
  })
  
  it('applies quiet hours', () => {
    const settings = {
      quietHours: { enabled: true, from: '22:00', to: '07:00' }
    }
    
    expect(isInQuietHours(settings, new Date('2024-01-01T23:00:00')))
      .toBe(true)
    expect(isInQuietHours(settings, new Date('2024-01-01T15:00:00')))
      .toBe(false)
  })
})
```

### E2E Tests

```typescript
test('Configure notification preferences', async ({ page }) => {
  await page.goto('/settings/notifications')
  
  // Disable email for chat mentions
  await page.uncheck('[data-testid="chatMentions-email"]')
  await page.click('[data-testid="save-preferences"]')
  await expect(page.locator('.toast')).toContainText('Settings saved')
  
  // Configure quiet hours
  await page.check('[data-testid="enable-quiet-hours"]')
  await page.selectOption('[data-testid="from-time"]', '22:00')
  await page.selectOption('[data-testid="to-time"]', '07:00')
  await page.click('[data-testid="save-quiet-hours"]')
  
  // Verify saved
  await page.reload()
  await expect(page.locator('[data-testid="enable-quiet-hours"]'))
    .toBeChecked()
})
```

## Related Documentation

- [Web Push Implementation](./web-push.md)
- [Notification Center UI](./NOTIFICATION_CENTER.md)
- [Backend Notification Service](../backend/notifications.md)
