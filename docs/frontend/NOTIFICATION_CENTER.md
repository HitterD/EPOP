# Notification Center & Web Push - Detailed UI/UX Specification

## Objective
Provide real-time notification system with in-app center, Web Push support, and granular per-channel preferences to keep users informed without overwhelming them.

## User Roles
- **All Users**: Can receive notifications, manage preferences, subscribe to Web Push
- **Admin**: Can view notification analytics, configure system-wide notification policies

## Implementation Status
- ⬜ FE-18a: Notification center UI component (PENDING)
- ⬜ FE-18b: Notification settings page (PENDING)
- ⬜ FE-18c: Web Push subscription flow (PENDING)

---

## Information Architecture

### Routes
- `/notifications` - Full-page notification center (optional, if opened from mobile)
- `/settings/notifications` - Notification preferences page

### Component Hierarchy
```
TopHeader
└── NotificationBell
    ├── UnreadBadge (count)
    └── NotificationPopover
        ├── PopoverHeader ("Notifications", "Mark all as read")
        ├── NotificationList (infinite scroll)
        │   └── NotificationItem
        │       ├── NotificationIcon (type-specific)
        │       ├── NotificationContent (title, message, timestamp)
        │       ├── UnreadIndicator (blue dot)
        │       └── NotificationActions (mark read, delete)
        └── PopoverFooter ("View all", "Settings")

NotificationSettingsPage
├── SettingsHeader
├── GeneralSettings
│   ├── EnableNotifications (master toggle)
│   ├── EnableWebPush (with permission status)
│   ├── EnableSound
│   └── EnableDesktop
├── ChannelSettings
│   ├── ChatNotifications
│   │   └── ChatChannelList (per-chat preferences)
│   ├── ProjectNotifications
│   │   └── ProjectChannelList (per-project preferences)
│   ├── MailNotifications
│   │   └── FolderPreferences (received/sent)
│   └── SystemNotifications (announcements, updates)
└── DoNotDisturbSchedule (quiet hours)

WebPushSetupDialog
├── Step1: ExplainBenefits
├── Step2: RequestPermission (browser prompt)
├── Step3: SubscribeVAPID
└── Step4: TestNotification

NotificationToast (Sonner)
├── ToastIcon
├── ToastContent (title, message)
├── ToastActions (optional buttons)
└── ToastProgress (auto-dismiss timer)
```

---

## State Model (Zustand Slice)

### NotificationStore (`lib/stores/notification-store.ts`)

```typescript
interface NotificationState {
  notifications: Map<string, Notification>
  unreadCount: number
  preferences: NotificationPreferences | null
  webPushSubscription: PushSubscription | null
  webPushEnabled: boolean
  
  // Actions
  setNotifications(notifications: Notification[]): void
  addNotification(notification: Notification): void
  markAsRead(id: string): void
  markAllAsRead(): void
  removeNotification(id: string): void
  
  // Preferences
  setPreferences(prefs: NotificationPreferences): void
  updateChannelPref(channelId: string, channelType: string, enabled: boolean): void
  
  // Web Push
  setWebPushSubscription(subscription: PushSubscription | null): void
  setWebPushEnabled(enabled: boolean): void
}

interface Notification {
  id: string
  type: 'chat_message' | 'chat_mention' | 'task_assigned' | 'project_update' | 'system_announcement'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string // Navigate on click
  metadata?: {
    chatId?: string
    projectId?: string
    senderId?: string
    senderName?: string
    senderAvatar?: string
  }
}

interface NotificationPreferences {
  enabled: boolean
  webPushEnabled: boolean
  soundEnabled: boolean
  desktopEnabled: boolean
  doNotDisturb: {
    enabled: boolean
    startTime: string // "22:00"
    endTime: string // "08:00"
  }
  channels: ChannelPreference[]
}

interface ChannelPreference {
  channelId: string
  channelType: 'chat' | 'project' | 'mail' | 'system'
  channelName: string
  enabled: boolean
  pushEnabled: boolean
  soundEnabled: boolean
  mentionsOnly: boolean // For chats: only notify on @mention
}
```

---

## UX Flows

### Flow 1: View Notifications in Popover (FE-18a)

**Trigger**: User clicks bell icon in header

**Steps**:
1. Popover opens below bell icon (animated slide down)
2. **Client fetches** `useNotifications(20)` if not already loaded
3. Display notification list with infinite scroll
4. Each notification shows:
   - **Icon**: Type-specific (💬 chat, 📋 task, 📧 mail, 🔔 system)
   - **Avatar**: Sender avatar (if applicable)
   - **Title**: Bold, 1-line truncate (e.g., "New message from John")
   - **Message**: Gray, 2-line truncate (preview of content)
   - **Timestamp**: Relative ("2 min ago") or absolute (hover for full date)
   - **Unread indicator**: Blue dot on left
5. User hovers → show "Mark as read" and "Delete" buttons
6. User clicks notification → navigate to `actionUrl`, mark as read
7. User scrolls to bottom → load next 20 notifications
8. User clicks "Mark all as read" → all unread notifications marked

**Popover Behavior**:
- **Max height**: 500px (scrollable)
- **Width**: 380px
- **Position**: Below bell, right-aligned
- **Close on**: Click outside, press Esc, navigate away
- **Auto-update**: New notifications appear at top with slide-in animation

**Empty State**:
```
┌────────────────────────────┐
│   🔔                       │
│   No notifications yet     │
│                            │
│   You're all caught up!    │
└────────────────────────────┘
```

---

### Flow 2: Configure Notification Preferences (FE-18b)

**Trigger**: User clicks "Settings" in notification popover or navigates to `/settings/notifications`

**Steps**:

#### General Settings
1. **Master toggle**: "Enable notifications" (on/off)
   - When off, all other settings disabled (grayed out)
2. **Web Push toggle**: "Enable push notifications"
   - Shows permission status: "Granted" (green), "Denied" (red), "Not requested" (gray)
   - If not granted, shows "Enable" button → triggers permission flow
3. **Sound toggle**: "Play sound for notifications"
4. **Desktop toggle**: "Show desktop notifications" (browser native)

#### Channel Settings
5. User expands "Chat notifications" accordion
6. Shows list of all chats user is member of:
   ```
   [x] #general (Engineering)
       [x] Push notifications
       [x] Sound
       [ ] Mentions only
   
   [ ] #random (Company)
       (all sub-options grayed out)
   ```
7. User can toggle individual chat or apply bulk settings
8. Same pattern for Projects, Mail, System

#### Do Not Disturb
9. User enables "Quiet hours"
10. Select start time (22:00) and end time (08:00)
11. During quiet hours: no push, no sound, desktop only for urgent

**Save Behavior**:
- **Auto-save**: Each toggle triggers `useUpdateNotificationPreferences()`
- **Optimistic update**: UI updates instantly
- **Error handling**: Rollback on error, show toast

---

### Flow 3: Subscribe to Web Push (FE-18c)

**Trigger**: User clicks "Enable push notifications" in settings

**Steps**:

#### Pre-Flight Checks
1. **Check browser support**: `isWebPushSupported()`
   - If not supported, show error: "Your browser does not support push notifications"
2. **Check current permission**: `Notification.permission`
   - If "denied", show: "You blocked notifications. Please enable in browser settings."

#### Permission Request
3. Open `WebPushSetupDialog` (modal)
4. **Step 1 - Benefits**:
   - "Stay updated even when EPOP is closed"
   - "Get instant alerts for important messages"
   - Icons showing example notifications
   - "Continue" button
5. **Step 2 - Request Permission**:
   - Click "Allow notifications" → browser shows native permission prompt
   - User grants or denies
6. If denied → show error and close dialog
7. If granted → proceed to Step 3

#### VAPID Subscription
8. **Step 3 - Subscribe**:
   - **Client calls** `subscribeToPush(vapidPublicKey)`
   - Registers service worker at `/sw.js`
   - Creates `PushSubscription` object
   - **API call** `useSubscribeWebPush(subscription)`
   - Backend stores subscription with user ID and device info
9. Show success message: "Push notifications enabled!"
10. **Step 4 - Test**:
    - "Send test notification" button
    - **API call** `POST /notifications/test` → backend sends test push
    - User receives notification: "🎉 Push notifications are working!"

#### Service Worker Registration
```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.notificationId, // For deduplication
    data: { 
      url: data.actionUrl,
      notificationId: data.notificationId
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: data.priority === 'urgent'
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
  
  // Mark as read
  fetch('/api/notifications/' + event.notification.data.notificationId + '/read', {
    method: 'POST',
    credentials: 'include'
  })
})
```

---

### Flow 4: Receive Real-Time Notification (Socket.IO)

**Trigger**: Backend publishes `notification:created` event

**Steps**:
1. **Socket.IO listener** in `useNotificationEvents()`:
   ```typescript
   socket.on('notification:created', (event) => {
     // event.notification: Notification object
     notificationStore.addNotification(event.notification)
     notificationStore.unreadCount++
   })
   ```
2. **In-app behavior**:
   - Notification appears at top of bell popover list
   - Unread badge increments (shows count)
   - If sound enabled, play notification sound (`/sounds/notification.mp3`)
3. **Toast notification** (if app is focused):
   - Show Sonner toast with notification content
   - Auto-dismiss after 5 seconds (unless urgent)
   - Click toast → navigate to `actionUrl`
4. **Web Push** (if app is not focused and push enabled):
   - Backend sends push via Web Push API
   - Service worker shows native notification
   - User clicks → app opens to `actionUrl`

**Deduplication**:
- Backend aggregates similar events within 5-minute window
- Example: "John, Sarah, and 3 others reacted to your message"
- Prevents notification spam

---

## Empty/Loading/Error States

### Empty States

**Notification Popover (no notifications)**:
```
┌────────────────────────────┐
│   🔔                       │
│   No notifications         │
│                            │
│   You're all caught up!    │
└────────────────────────────┘
```

**Notification Settings (no channels)**:
```
No chats or projects yet.
Join a chat or create a project to configure notifications.
```

### Loading States

**Popover Loading**:
- Show 3 skeleton notification items with shimmer
- Preserve height to prevent layout shift

**Settings Loading**:
- Show skeleton toggles and channel lists
- Disable all interactions

### Error States

**Permission Denied**:
```
❌ Notifications blocked
You've blocked notifications in your browser.
To enable, click the lock icon in the address bar.
```

**Subscription Failed**:
```
❌ Failed to enable push notifications
Please check your network connection and try again.
[Retry]
```

**Web Push Not Supported**:
```
⚠️ Push notifications not supported
Your browser doesn't support push notifications.
Try using Chrome, Firefox, or Edge.
```

---

## Edge Cases & Validation

### Browser Compatibility
- **Supported**: Chrome 42+, Firefox 44+, Edge 17+, Safari 16+ (iOS 16.4+)
- **Not supported**: IE, Opera Mini, older Safari versions
- Show graceful degradation: in-app notifications only

### Permission States
- **Default**: Not yet requested, show "Enable" button
- **Granted**: Push enabled, show "Disable" button
- **Denied**: Show instructions to enable in browser settings

### Service Worker Lifecycle
- **Registration failure**: Fallback to in-app only, log error
- **Update available**: Prompt user to reload app for new SW
- **Unregister on logout**: Clean up subscriptions

### Notification Limits
- **Max in-app storage**: 100 notifications (oldest auto-deleted)
- **Max unread count display**: "99+" (if >99 unread)
- **Push rate limit**: Max 10 push per hour per user (backend enforced)

---

## Acceptance Criteria

### FE-18a: Notification Center UI
- [x] Bell icon shows unread count badge
- [x] Click bell → popover opens with notification list
- [x] Infinite scroll loads next page on bottom reach
- [x] Click notification → navigates to actionUrl and marks as read
- [x] "Mark all as read" button clears all unread
- [x] New notifications appear at top with slide-in animation
- [x] Relative timestamps update every minute

### FE-18b: Notification Settings
- [x] Master toggle disables all notification types
- [x] Per-channel toggles work for chat/project/mail
- [x] "Mentions only" toggle filters chat notifications
- [x] Do Not Disturb schedule works (quiet hours)
- [x] Settings auto-save on toggle change
- [x] Optimistic update with rollback on error

### FE-18c: Web Push Subscription
- [x] Browser compatibility check works
- [x] Permission request shows native browser prompt
- [x] VAPID subscription sends to backend successfully
- [x] Service worker registered and active
- [x] Test notification button sends push
- [x] Click push notification → app opens to correct URL
- [x] Push works when app is closed (background)
- [x] Unsubscribe removes subscription from backend

---

## WebSocket Events Consumed

### Notification Events
```typescript
socket.on('notification:created', (event: NotificationEvent) => {
  // event.notification: full Notification object
  // Add to store, show toast if app focused, increment badge
})

socket.on('notification:read', (event: NotificationEvent) => {
  // event.notificationId
  // Mark as read in store, decrement unread count
})

socket.on('notification:deleted', (event: NotificationEvent) => {
  // event.notificationId
  // Remove from store
})
```

---

## API Endpoints Required

### Already Documented (need implementation)
- `GET /notifications` - List notifications (cursor paginated)
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/preferences` - Get user preferences
- `PATCH /notifications/preferences` - Update preferences
- `POST /notifications/web-push/subscribe` - Save push subscription
- `POST /notifications/web-push/unsubscribe` - Remove subscription

### New (Backend Contract Request)
- `POST /notifications/test` - Send test push notification
  - **Response**: `{ success: true, message: "Test notification sent" }`
- `GET /notifications/stats` - Get notification analytics (admin only)
  - **Response**: `{ totalSent: number, deliveryRate: number, clickRate: number }`

---

## Design Tokens

### Notification Type Colors
- **Chat message**: Blue (`#3B82F6`)
- **Mention**: Orange (`#F59E0B`)
- **Task assigned**: Purple (`#8B5CF6`)
- **Project update**: Green (`#10B981`)
- **System announcement**: Red (`#EF4444`)

### Notification Icons (Lucide)
- **Chat**: `MessageCircle`
- **Mention**: `AtSign`
- **Task**: `CheckSquare`
- **Project**: `Folder`
- **System**: `Bell`
- **Mail**: `Mail`

### Sound Assets
- **Notification sound**: `/sounds/notification.mp3` (short, pleasant chime)
- **Mention sound**: `/sounds/mention.mp3` (more attention-grabbing)
- **Urgent sound**: `/sounds/urgent.mp3` (persistent alert)

### Popover Dimensions
- **Width**: 380px
- **Max height**: 500px (scrollable)
- **Item height**: 80px (fixed for virtualization)
- **Border radius**: 8px
- **Shadow**: `shadow-lg`

---

## Performance Considerations

### Infinite Scroll
- Load 20 notifications per page
- Virtualize list if >100 notifications (react-window)
- Debounce scroll event (16ms)

### Web Push Optimization
- **Batching**: Backend aggregates events within 5-minute window
- **Deduplication**: Use `tag` in push options to replace older notifications
- **Compression**: Minimize push payload size (<1KB)

### Cache Strategy
- Notifications cached with `staleTime: 60_000` (1 minute)
- Invalidate on `notification:created` event
- Persist unread count in localStorage for offline indicator

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- `Alt+N` → Open notification popover
- `Tab` → Focus next notification
- `Enter` → Open notification link
- `Delete` → Delete focused notification
- `Esc` → Close popover

### Screen Reader Support
- Bell icon: `aria-label="Notifications, ${unreadCount} unread"`
- Notification items: `aria-label="${title}, from ${sender}, ${timestamp}"`
- Mark as read: `aria-label="Mark notification as read"`
- Popover: `role="dialog"` with `aria-labelledby`

### Focus Management
- When popover opens, focus moves to first notification
- When popover closes, focus returns to bell icon
- Focus trap inside popover (cannot tab outside)

### Visual Indicators
- Unread notifications have 3px blue left border + blue dot
- Keyboard focus has 2px outline
- Color-blind safe: icons supplement colors

---

## Testing Strategy

### Unit Tests
- `NotificationBell` displays correct unread count
- `NotificationItem` renders all metadata fields
- `useNotificationPreferences` updates optimistically

### E2E Tests (Playwright)
1. Open notification popover → verify list renders
2. Click notification → verify navigates to correct URL
3. Mark all as read → verify unread count becomes 0
4. Enable Web Push → verify permission prompt appears
5. Receive Socket.IO event → verify notification appears in list
6. Update preferences → verify auto-saves and refetches

### Web Push Tests (Manual)
1. Subscribe to push → send test notification
2. Close app → send push → verify notification appears
3. Click notification → verify app opens to correct page
4. Unsubscribe → verify no more pushes received

---

## Progressive Web App (PWA) Integration

### Manifest (`public/manifest.json`)
```json
{
  "name": "EPOP",
  "short_name": "EPOP",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6264A7",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Scope
- Scope: `/` (entire app)
- Cache strategy: Network-first for API, cache-first for assets
- Background sync: Retry failed notification reads when online

---

## Security Considerations

### VAPID Keys
- Public key: Embedded in frontend code (safe)
- Private key: Stored in backend `.env` (never exposed)
- Rotation: Generate new keys annually, re-subscribe users

### Push Payload Encryption
- Web Push API uses ECDH encryption (automatic)
- Backend does not log push payloads (privacy)

### Rate Limiting
- Max 10 push per hour per user (prevent spam)
- Max 100 notifications stored per user (prevent DoS)

---

## Migration & Rollout Plan

### Phase 1: In-App Notifications (Week 1)
- Implement `NotificationBell` and popover
- Socket.IO event integration
- Preferences page (without Web Push)

### Phase 2: Web Push (Week 2)
- Implement service worker
- VAPID subscription flow
- Test on all supported browsers

### Phase 3: Polish (Week 3)
- Do Not Disturb scheduling
- Notification sounds
- Analytics dashboard (admin)

### Phase 4: Rollout (Week 4)
- Beta test with 10% of users
- Monitor error rates and delivery metrics
- Full rollout to all users

---

## References
- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID specification](https://datatracker.ietf.org/doc/html/rfc8292)
- Backend notifications service: `c:/EPop/backend/src/notifications/notifications.service.ts`
- Sonner toast library: [sonner.emilkowal.ski](https://sonner.emilkowal.ski/)
