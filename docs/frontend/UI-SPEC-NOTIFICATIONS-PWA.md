# UI Specification: Notifications & PWA

## 1. Notification Components

### NotificationCenter
**Purpose:** Central hub for all notifications

**Props:** `notifications`, `onRead`, `onReadAll`, `onClear`, `filters`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Notifications                          [Mark all read]│
├─────────────────────────────────────────────────────┤
│ Filters: [All] [Unread (5)] [Mentions] [Messages]  │
├─────────────────────────────────────────────────────┤
│ TODAY                                               │
│ ● Alice mentioned you in #general           2m ago  │
│   "Can you review the @you design specs?"          │
│                                                     │
│   Bob assigned you to EPIC-123              10m ago │
│   "Setup API infrastructure"                       │
│                                                     │
│ YESTERDAY                                           │
│   Carol uploaded project-spec.pdf           1d ago  │
│   In Projects > Q1                                 │
├─────────────────────────────────────────────────────┤
│ [Load more...]                                      │
└─────────────────────────────────────────────────────┘
```

**Trigger:**
- Click bell icon in header
- Badge shows unread count
- Keyboard: `Shift+N`

**Layout:**
- Panel slides from right
- Overlay dims background
- Max width: `w-96` (384px)

**Notification Item:**
- **Unread:** Blue dot `●` + `bg-accent/10`
- **Read:** No dot, normal background
- **Hover:** `bg-accent/5` + show actions (mark read, delete)

**Actions:**
- Click notification → Navigate to context (message, project, file)
- Mark as read (checkmark icon)
- Delete (X icon)
- Mark all as read (header button)

**Grouping:**
- By date: Today, Yesterday, This Week, Older
- Show max 20 per load, load more on scroll

**Empty State:**
- "You're all caught up! 🎉"
- "No new notifications."

**Keyboard:**
- `↑↓` navigate items
- `Enter` open notification
- `M` mark as read
- `Del` delete
- `Escape` close panel

**A11y:**
- `role="region" aria-label="Notifications"`
- Unread count: `aria-live="polite"` announcement
- Items: `role="list"`, `role="listitem"`

---

### NotificationItem
**Purpose:** Single notification with action context

**Props:** `notification`, `onRead`, `onClick`, `onDelete`

**Types & Icons:**
- **Mention:** `@` icon, blue
- **Assignment:** `📋` icon, green
- **Message:** `💬` icon, gray
- **File:** `📎` icon, purple
- **Calendar:** `📅` icon, orange
- **System:** `⚙️` icon, gray

**Layout:**
```
┌─────────────────────────────────────────┐
│ ● [Icon] Title                    2m ago│
│         Preview text...                 │
│         [Action: View Project]          │
└─────────────────────────────────────────┘
```

**Content:**
- **Title:** Bold, 1 line max with ellipsis
- **Preview:** 2 lines max, truncated
- **Timestamp:** Relative (2m ago, 1h ago, 1d ago)

**Actions (hover):**
- Mark as read/unread
- Delete
- Mute similar notifications

**Click Behavior:**
- Mark as read automatically
- Navigate to source (deep link)

**A11y:** `aria-label` with full context

---

### NotificationBadge
**Purpose:** Show unread count on bell icon

**Props:** `count`, `max`

**Visual:**
```
🔔 [5]  ← Badge with count
🔔 [9+] ← Badge if count > max (default 9)
```

**Styles:**
- Badge: `bg-red-500 text-white rounded-full`
- Position: Absolute top-right of bell icon
- Pulsing animation on new notification

**States:**
- **Zero:** Hide badge
- **1-9:** Show number
- **10+:** Show "9+"

**A11y:** `aria-label="5 unread notifications"`

---

### NotificationToast
**Purpose:** Temporary in-app notification

**Props:** `notification`, `duration`, `onClose`, `action`

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💬 New message from Alice               │
│    "Can you review the design?"         │
│    [Reply] [Dismiss]              [×]   │
└─────────────────────────────────────────┘
```

**Position:** 
- Desktop: Bottom-right, stacked
- Mobile: Top-center, full width

**Duration:**
- Default: 5 seconds
- Hover: Pause auto-dismiss
- Action toast: 10 seconds (longer read time)

**Types:**
- **Info:** Blue border
- **Success:** Green border
- **Warning:** Yellow border
- **Error:** Red border

**Animation:**
- Slide in from right
- Slide out to right on dismiss
- Smooth transitions, respect `prefers-reduced-motion`

**Actions:**
- **Reply:** Opens composer with context
- **View:** Navigates to source
- **Dismiss:** Closes toast
- **Undo:** For destructive actions (delete, archive)

**Keyboard:**
- `Tab` to focus action buttons
- `Escape` to dismiss

**A11y:**
- `role="alert"` for assertive announcements
- `aria-live="polite"` for non-urgent
- `aria-atomic="true"`

---

### NotificationSettings
**Purpose:** Configure notification preferences

**Props:** `settings`, `onSave`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Notification Settings                               │
├─────────────────────────────────────────────────────┤
│ In-App Notifications:                               │
│ [✓] Mentions                                        │
│ [✓] Direct messages                                 │
│ [✓] Project assignments                             │
│ [ ] All messages (can be noisy)                     │
│                                                     │
│ Push Notifications:                                 │
│ [✓] Mentions                                        │
│ [✓] Direct messages                                 │
│ [ ] Project updates                                 │
│ [ ] File uploads                                    │
│                                                     │
│ Email Notifications:                                │
│ [ ] Daily digest                                    │
│ [✓] Weekly summary                                  │
│ [ ] Real-time (every notification)                  │
│                                                     │
│ Do Not Disturb:                                     │
│ [✓] Enable DND from 10 PM to 8 AM                   │
│ [ ] Mute all notifications on weekends              │
│                                                     │
│                          [Cancel]  [Save Settings]  │
└─────────────────────────────────────────────────────┘
```

**Categories:**
- In-app (always available)
- Push (requires permission)
- Email (requires email setup)
- DND schedule

**Validation:**
- At least one notification type enabled
- DND time range valid

**A11y:** Checkboxes with clear labels, group with `<fieldset>`

---

## 2. PWA Components

### InstallPrompt
**Purpose:** Encourage users to install PWA

**Props:** `onInstall`, `onDismiss`, `onDefer`

**Layout (Banner):**
```
┌─────────────────────────────────────────────────────┐
│ 📱 Install EPOP for faster access                   │
│    Works offline, get push notifications            │
│    [Install] [Not now]                        [×]   │
└─────────────────────────────────────────────────────┘
```

**Layout (Modal - iOS Safari):**
```
┌─────────────────────────────────────────┐
│ Install EPOP                            │
├─────────────────────────────────────────┤
│ Add this app to your home screen:       │
│                                         │
│ 1. Tap Share button ⎙                  │
│ 2. Tap "Add to Home Screen"            │
│ 3. Tap "Add"                            │
│                                         │
│ [Screenshot showing steps]              │
│                                         │
│              [Got it]                   │
└─────────────────────────────────────────┘
```

**Trigger Conditions:**
- User visited 3+ times
- At least 5 min total session time
- Not previously dismissed
- PWA not already installed

**Defer Logic:**
- If "Not now" clicked: Don't show for 7 days
- If dismissed (×): Don't show for 30 days
- If installed: Never show again

**Platform Detection:**
- Chrome/Edge: Use `beforeinstallprompt` event
- iOS Safari: Show manual instructions
- Firefox: Link to about:addons

**A11y:** `role="dialog"`, clear instructions with visual aids

---

### OfflineBanner
**Purpose:** Indicate offline status and limitations

**Props:** `isOnline`, `syncStatus`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ You're offline. Some features are limited.       │
│    [Retry connection] [Learn more]            [×]   │
└─────────────────────────────────────────────────────┘
```

**Colors:**
- **Offline:** Yellow/orange `bg-yellow-500`
- **Reconnecting:** Blue `bg-blue-500` with spinner
- **Online:** Green `bg-green-500` (briefly, then auto-hide)

**Position:** 
- Fixed top banner
- Above main content
- Pushes content down (no overlap)

**States:**
- **Just went offline:** Show banner immediately
- **Reconnecting:** Show spinner + "Reconnecting..."
- **Back online:** Show "Back online" + auto-hide after 3s

**Learn More:**
- Opens modal explaining offline capabilities:
  - View cached messages
  - Read files
  - Compose drafts (send when online)
  - What doesn't work: Search, file upload

**A11y:** `role="alert" aria-live="assertive"`

---

### ServiceWorkerUpdate
**Purpose:** Prompt to reload when new version available

**Props:** `onUpdate`, `onDismiss`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 🔄 New version available!                           │
│    Update now to get the latest features            │
│    [Update] [Later]                                 │
└─────────────────────────────────────────────────────┘
```

**Trigger:**
- Service worker detects new version
- Show banner at top (non-blocking)

**Actions:**
- **Update:** Call `skipWaiting()` + reload page
- **Later:** Dismiss, will update on next page load

**Auto-update:**
- If user idle for 30 min, auto-update silently
- Show toast: "App updated to v2.1.0"

**A11y:** `role="status" aria-live="polite"`

---

### PushPermissionPrompt
**Purpose:** Request push notification permission

**Props:** `onAllow`, `onDeny`, `onDefer`

**Layout:**
```
┌─────────────────────────────────────────┐
│ Stay updated with notifications        │
├─────────────────────────────────────────┤
│ Get notified about:                     │
│ • Mentions and direct messages          │
│ • Project assignments                   │
│ • Important updates                     │
│                                         │
│ You can change this later in settings.  │
│                                         │
│    [Enable Notifications] [Not now]     │
└─────────────────────────────────────────┘
```

**Timing:**
- Don't show on first visit (too early)
- Show after user engages (sent message, created project)
- Only show if not previously denied

**Platform Behavior:**
- **Chrome/Firefox:** Browser native prompt after [Enable] click
- **Safari:** Browser native prompt
- **Denied:** Hide prompt forever, show instructions to re-enable in settings

**A11y:** `role="dialog"`, clear benefit explanation

---

### OfflineFallback
**Purpose:** Page shown when offline and route not cached

**Layout:**
```
┌─────────────────────────────────────────┐
│          🌐                             │
│    You're offline                       │
│                                         │
│    This page isn't available offline.   │
│    Check your connection and try again. │
│                                         │
│    [Retry] [Go to Home]                 │
│                                         │
│    Available offline:                   │
│    • Recent messages                    │
│    • Cached projects                    │
│    • Your files                         │
└─────────────────────────────────────────┘
```

**Served by:** Service worker when fetch fails

**Actions:**
- **Retry:** Attempt to reload page
- **Go to Home:** Navigate to cached home route

**A11y:** Semantic HTML, focus on retry button

---

### SyncStatusIndicator
**Purpose:** Show background sync status

**Props:** `pendingActions`, `syncStatus`

**Layout (bottom-right corner):**
```
[🔄 Syncing... (3)] ← Small badge/toast
```

**States:**
- **Idle:** Hidden
- **Syncing:** Show spinner + count of pending actions
- **Success:** Green checkmark + auto-hide
- **Failed:** Red X + "Sync failed. [Retry]"

**Pending Actions:**
- Sent messages
- Uploaded files
- Created/updated projects

**Interaction:**
- Click to expand: Show list of pending actions
- Retry individual or all

**A11y:** `aria-live="polite"` for status changes

---

## 3. User Flows

**Receive Notification:**
1. Server sends push → Service worker receives
2. Show browser notification (if permission granted)
3. User clicks notification → Opens app to context
4. Notification marked as read in NotificationCenter

**Enable Push Notifications:**
1. User clicks bell icon → NotificationCenter opens
2. Banner: "Enable push to get notified on desktop"
3. Click [Enable] → PushPermissionPrompt shows
4. User clicks [Enable Notifications]
5. Browser native prompt appears → User allows
6. Subscription sent to server
7. Toast: "Notifications enabled! ✓"

**Install PWA (Chrome):**
1. User visits site 3rd time
2. InstallPrompt banner shows
3. User clicks [Install]
4. Browser shows install dialog
5. User confirms → App installs
6. Opens in standalone window
7. Toast: "EPOP installed! 🎉"

**Go Offline:**
1. Network connection lost
2. OfflineBanner appears: "You're offline"
3. User tries to search → Disabled, tooltip "Unavailable offline"
4. User views cached messages → Works normally
5. User composes message → Queued for send
6. Network reconnects → Banner: "Back online" + sync starts
7. Queued message sends → Toast: "Message sent"

**Service Worker Update:**
1. New version deployed
2. SW detects update in background
3. ServiceWorkerUpdate banner shows
4. User clicks [Update] → Page reloads with new version
5. Toast: "Updated to v2.1.0"

**DND Schedule:**
1. User opens NotificationSettings
2. Enable DND from 10 PM to 8 AM
3. At 10 PM → All notifications muted
4. Badge still shows count, but no toasts/sounds
5. At 8 AM → Notifications resume
6. Toast: "Do Not Disturb ended. You have 5 new notifications."

---

## 4. States & Copy

**Notifications:**
- Empty: "You're all caught up! 🎉"
- Error loading: "Failed to load notifications. [Retry]"

**Offline:**
- Banner: "You're offline. Some features are limited."
- Reconnecting: "Reconnecting..."
- Back online: "Back online! ✓"

**PWA Install:**
- Prompt: "Install EPOP for faster access and offline support"
- Success: "EPOP installed successfully! 🎉"
- Deferred: (Hidden for 7 days)

**Push Permission:**
- Prompt: "Stay updated with push notifications"
- Granted: "Notifications enabled! ✓"
- Denied: "Notifications blocked. Enable in browser settings."

**Sync:**
- Syncing: "Syncing 3 pending actions..."
- Success: "All changes synced ✓"
- Failed: "Sync failed. Check connection. [Retry]"

**Service Worker:**
- Update available: "New version available! [Update]"
- Updated: "App updated to v2.1.0 ✓"

---

## 5. Layout Tokens

**NotificationCenter:**
- Width: `w-96` (384px)
- Max height: `h-screen`
- Position: Fixed right

**Toasts:**
- Desktop: Bottom-right, `max-w-md`
- Mobile: Top-center, full width
- Gap between toasts: `space-y-2`

**Banners:**
- Height: `h-12` (48px)
- Full width
- Fixed top position

**Z-index:**
- Toasts: `z-100`
- Banners: `z-50`
- NotificationCenter: `z-50`
- Modals: `z-50`

---

## 6. Animation & Motion

**Respect `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Animations:**
- Toast slide-in: `slide-in-right` 200ms ease
- Banner slide-down: `slide-down` 300ms ease
- Badge pulse: Gentle scale on new notification
- Loading spinner: Smooth rotation

**Transitions:**
- Hover states: 150ms
- Panel open/close: 250ms
- Toast dismiss: 200ms

---

## 7. A11y Checklist

✅ Notifications: `role="region"`, live regions for count  
✅ Toasts: `role="alert"` for urgent, `role="status"` for non-urgent  
✅ Banners: `role="alert"` for offline warning  
✅ Keyboard: All actions accessible (Tab, Enter, Escape)  
✅ Screen reader: Announce new notifications, sync status  
✅ Focus: Trap in modals, return after close  
✅ Contrast: All text 4.5:1, icons 3:1  
✅ Motion: Respect `prefers-reduced-motion`  
✅ Sound: Provide visual alternatives (no sound-only alerts)

---

## 8. Edge Cases

**Permission denied:** Show instructions to re-enable in browser settings

**Service worker registration fails:** Fallback to normal web app, show warning

**Notification click on closed app:** Open app + navigate to context

**Offline queue full (>100 actions):** Show warning, oldest actions dropped

**DND conflict with urgent notification:** Allow "break-through" for critical alerts (system outage)

**Multiple tabs open:** Sync notification state across tabs (BroadcastChannel)

**Stale notifications:** Auto-archive >30 days old

**Push token expired:** Re-subscribe silently, show toast if fails

---

## 9. Performance

**Notification fetch:** Paginate 20 per load, lazy load on scroll

**Push registration:** Register on first enable, cache token

**Service worker:** Cache critical resources, network-first for API

**Background sync:** Batch actions, retry with exponential backoff

**Toast queue:** Max 3 visible, queue others, dismiss oldest first

---

## 10. Service Worker Strategy

**Cache Strategy:**
```javascript
// Static assets: Cache-first
workbox.routing.registerRoute(
  /\.(js|css|png|jpg|svg)$/,
  new workbox.strategies.CacheFirst()
);

// API: Network-first, fallback to cache
workbox.routing.registerRoute(
  /\/api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
);

// HTML: Network-first
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.NetworkFirst()
);
```

**Background Sync:**
```javascript
// Queue actions when offline
workbox.backgroundSync.registerQueue('actionsQueue');

// Retry on reconnect
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncPendingActions());
  }
});
```

**Push Notifications:**
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: data.url },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

---

## 11. PWA Manifest

```json
{
  "name": "EPOP - Enterprise Collaboration",
  "short_name": "EPOP",
  "description": "Team collaboration platform with chat, projects, and files",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "business"],
  "shortcuts": [
    {
      "name": "New Message",
      "url": "/chat?compose=true",
      "icons": [{ "src": "/shortcuts/message.png", "sizes": "96x96" }]
    },
    {
      "name": "My Projects",
      "url": "/projects",
      "icons": [{ "src": "/shortcuts/projects.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 12. API Endpoints

```
GET    /api/notifications?page=1&limit=20&filter=unread
PATCH  /api/notifications/{id}/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/{id}

GET    /api/notifications/settings
PATCH  /api/notifications/settings  (in-app, push, email prefs)

POST   /api/push/subscribe            (push subscription object)
DELETE /api/push/unsubscribe

GET    /api/sync/status                (pending actions count)
POST   /api/sync/actions               (batch sync queued actions)
```

---

**Success Criteria:** 
✅ Notifications work across web/push/email  
✅ PWA installs on all platforms  
✅ Offline mode graceful (cached content, queued actions)  
✅ Background sync reliable  
✅ Settings granular and clear  
✅ WCAG AA compliant  
✅ `prefers-reduced-motion` respected  
✅ No dev questions needed
