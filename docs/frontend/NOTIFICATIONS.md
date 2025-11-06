# Notifications Feature

## Overview
In-app notifications and Web Push support with per-channel preferences.

## Implementation Status
- ✅ FE-4: Cursor pagination on notification lists
- ✅ FE-16: Notification center with infinite scroll
- ✅ FE-16: Preferences per channel (chat/project/mail)
- ✅ FE-16: Web Push subscription (VAPID)

## In-App Notifications

### NotificationCenter
- Bell icon in header
- Unread badge
- Popover with notification list
- Mark as read
- Click to navigate

### Toast Notifications
- Sonner library
- Success, error, info, warning
- Auto-dismiss or persistent
- Action buttons

## Web Push (PWA)

### Setup
1. Register service worker
2. Request notification permission
3. Subscribe with VAPID keys
4. Send subscription to server

### Notification Types
- New message
- Task assigned
- @mention
- Project update
- System announcements

## Per-Channel Settings

Users can configure notifications per:
- Chat
- Project
- Mail folder

Options:
- Enable/disable
- Push notifications
- Sound
- Desktop notifications

## Notification Center (FE-16)

### List Notifications
```typescript
const { 
  data, 
  fetchNextPage, 
  hasNextPage 
} = useNotifications(50)

// Returns cursor-paginated notifications
// Auto-loads more on scroll
```

### Mark as Read
```typescript
const { mutate: markRead } = useMarkNotificationRead()
markRead(notificationId)

// Mark all as read
const { mutate: markAllRead } = useMarkAllNotificationsAsRead()
markAllRead()
```

## Preferences (FE-16)

### Get Preferences
```typescript
const { data: prefs } = useNotificationPreferences()
// Returns: NotificationPreferences with per-channel settings
```

### Update Preferences
```typescript
const { mutate: updatePrefs } = useUpdateNotificationPreferences()
updatePrefs({
  channels: [
    { 
      chatId: 'chat-123', 
      enabled: true, 
      pushEnabled: true 
    },
    { 
      projectId: 'proj-456', 
      enabled: false, 
      pushEnabled: false 
    }
  ]
})
```

## Web Push Setup (FE-16)

### Check Support
```typescript
import { isWebPushSupported } from '@/lib/utils/web-push'

if (isWebPushSupported()) {
  // Show enable notifications option
}
```

### Request Permission
```typescript
import { requestNotificationPermission } from '@/lib/utils/web-push'

const permission = await requestNotificationPermission()
// Returns: 'granted' | 'denied' | 'default'
```

### Subscribe to Push
```typescript
import { subscribeToPush } from '@/lib/utils/web-push'

const subscription = await subscribeToPush(vapidPublicKey)

// Send to backend
const { mutate: subscribe } = useSubscribeWebPush()
subscribe(subscription)
```

### Unsubscribe
```typescript
import { unsubscribeFromPush } from '@/lib/utils/web-push'

await unsubscribeFromPush()

const { mutate: unsubscribe } = useUnsubscribeWebPush()
unsubscribe()
```

### Service Worker

Located at `/public/sw.js`:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.actionUrl }
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

## Deduplication

Backend implements deduplication window:
- Multiple reactions on same message → single notification
- Configurable window (default: 5 minutes)
- Aggregates similar events

## API Endpoints
- `GET /api/notifications` - List notifications (cursor paginated)
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PATCH /api/notifications/preferences` - Update preferences
- `POST /api/notifications/web-push/subscribe` - Save push subscription
- `POST /api/notifications/web-push/unsubscribe` - Remove subscription
