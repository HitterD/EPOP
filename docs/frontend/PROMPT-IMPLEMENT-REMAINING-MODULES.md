# Implementation Prompt: Files, Search, Directory, Notifications & PWA

**Target:** Claude Sonnet 4.5  
**Purpose:** Generate remaining components, stories, and tests  
**References:**
- [UI-SPEC-FILES-UPLOAD-PREVIEW.md](./UI-SPEC-FILES-UPLOAD-PREVIEW.md)
- [UI-SPEC-GLOBAL-SEARCH.md](./UI-SPEC-GLOBAL-SEARCH.md)
- [UI-SPEC-DIRECTORY-ADMIN.md](./UI-SPEC-DIRECTORY-ADMIN.md)
- [UI-SPEC-NOTIFICATIONS-PWA.md](./UI-SPEC-NOTIFICATIONS-PWA.md)

---

## Module 1: Files Components (in `components/files/`)

### Core Components

**FileUploadZone.tsx** — Drag-drop upload area, validation, states (idle/hover/dragging/uploading)

**FileUploadQueue.tsx** — Multi-file progress tracker with progress bars, retry, cancel

**FileList.tsx** — Grid/list view with thumbnails, sorting, filtering, search

**FilePreviewModal.tsx** — Universal preview (images, PDF, video, text, Office docs)

**FolderTree.tsx** — Navigable folder hierarchy with expand/collapse

**StorageQuota.tsx** — Usage indicator with color-coded progress bar

### Storybook Stories
- FileUploadZone: Idle, hover, dragging, uploading, error
- FileUploadQueue: Multiple files, uploading, complete, error, retry
- FileList: Grid view, list view, loading, empty, filtered
- FilePreviewModal: Image, PDF, video, text, unsupported type
- StorageQuota: 25%, 80%, 95% (color changes)

### Tests
- Upload validation (size, type)
- Drag & drop events
- Preview rendering per file type
- Keyboard navigation in tree
- Storage quota calculations

**Reference:** UI-SPEC-FILES-UPLOAD-PREVIEW.md Sections 1-6

---

## Module 2: Search Components (in `components/search/`)

### Core Components

**SearchCommandPalette.tsx** — ⌘K overlay with input, scope filters, grouped results

**ScopeFilter.tsx** — Tab-like chips (All, Messages, Projects, Files, Users)

**SearchResultItem.tsx** — Context-aware result with match highlighting

**RecentSearches.tsx** — List of recent queries with click to populate

**SearchFilters.tsx** — Advanced filters (date range, author, tags)

**SearchEmptyState.tsx** — No results with spell suggestions

### Storybook Stories
- CommandPalette: Empty (recents), typing (loading), results (grouped), no results
- ResultItem: Message result, project result, file result, user result (each with highlights)
- ScopeFilter: All selected, specific scope selected, with counts
- SearchFilters: Expanded, with active filters

### Tests
- Keyboard nav (↑/↓/Enter/Escape)
- Debounced search (300ms)
- Match highlighting logic
- Recent searches localStorage
- Focus trap in modal

**Reference:** UI-SPEC-GLOBAL-SEARCH.md Sections 1-6

---

## Module 3: Directory & Admin Components (in `components/directory/`)

### Core Components

**OrganizationTree.tsx** — Hierarchical company structure with expand/collapse

**UserCard.tsx** — Detailed profile with presence, contact info, actions

**UserListView.tsx** — Grid/list view of all users with filters

**UserFormDialog.tsx** — Create/edit user form with validation

**BulkImportDialog.tsx** — Excel/CSV upload with preview & validation

**RolePermissionsMatrix.tsx** — Checkbox grid of roles × permissions

**AuditLogViewer.tsx** — Activity history table with filters

### Storybook Stories
- OrganizationTree: Expanded, collapsed, with search
- UserCard: Online user, with custom status, offline
- UserListView: Grid view, list view, filtered, loading
- UserFormDialog: Create mode, edit mode, validation errors
- BulkImportDialog: Steps 1-4, validation errors, success
- RolePermissionsMatrix: Interactive checkboxes

### Tests
- Tree keyboard nav (↑/↓/←/→)
- Form validation (email, required fields)
- Bulk import CSV parsing
- RBAC permission checks
- Audit log filtering

**Reference:** UI-SPEC-DIRECTORY-ADMIN.md Sections 1-7

---

## Module 4: Notifications & PWA Components (in `components/notifications/`)

### Core Components

**NotificationCenter.tsx** — Slide-out panel with notification list, filters

**NotificationItem.tsx** — Single notification with icon, title, preview, actions

**NotificationBadge.tsx** — Unread count badge on bell icon

**NotificationToast.tsx** — Temporary toast with actions (reply/dismiss)

**NotificationSettings.tsx** — Preference form (in-app, push, email, DND)

**InstallPrompt.tsx** — PWA install banner/modal (platform-specific)

**OfflineBanner.tsx** — Connection status banner (offline/reconnecting/online)

**ServiceWorkerUpdate.tsx** — Update available prompt

**PushPermissionPrompt.tsx** — Request notification permission dialog

**SyncStatusIndicator.tsx** — Background sync status badge

### Storybook Stories
- NotificationCenter: With notifications, empty, filtered (mentions only)
- NotificationItem: Mention, assignment, message, file, calendar, system
- NotificationToast: Info, success, warning, error, with actions
- InstallPrompt: Desktop banner, iOS instructions modal
- OfflineBanner: Offline (yellow), reconnecting (blue spinner), online (green)
- ServiceWorkerUpdate: Update prompt
- PushPermissionPrompt: Permission request dialog

### Tests
- Notification grouping by date
- Toast auto-dismiss (5s)
- Toast pause on hover
- Badge count display (5, 9+)
- DND schedule logic
- Offline detection
- Service worker registration

**Reference:** UI-SPEC-NOTIFICATIONS-PWA.md Sections 1-3

---

## Service Worker Setup

### `public/sw.js`
```javascript
// Cache-first for static assets
workbox.routing.registerRoute(
  /\.(js|css|png|jpg|svg)$/,
  new workbox.strategies.CacheFirst()
);

// Network-first for API
workbox.routing.registerRoute(
  /\/api\//,
  new workbox.strategies.NetworkFirst()
);

// Background sync
workbox.backgroundSync.registerQueue('actionsQueue');

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url },
    })
  );
});
```

---

## PWA Manifest

### `public/manifest.json`
```json
{
  "name": "EPOP - Enterprise Collaboration",
  "short_name": "EPOP",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Implementation Guidelines

### File Previews
```typescript
// Image preview
<img src={fileUrl} alt={fileName} loading="lazy" />

// PDF preview
<iframe src={pdfUrl} width="100%" height="600px" />

// Video preview
<video src={videoUrl} controls />

// Text preview (with syntax highlighting)
<pre><code className="language-javascript">{content}</code></pre>
```

### Search Highlighting
```typescript
function highlightMatch(text: string, query: string) {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  )
}
```

### Notification Toast Queue
```typescript
const [toasts, setToasts] = useState<Toast[]>([])

// Add toast
const addToast = (toast: Toast) => {
  setToasts(prev => [...prev, toast])
  setTimeout(() => removeToast(toast.id), 5000)
}

// Max 3 visible
const visibleToasts = toasts.slice(-3)
```

---

## Commands

```bash
# Install dependencies
pnpm add workbox-webpack-plugin next-pwa

# Storybook
pnpm storybook

# Tests
pnpm test files
pnpm test search
pnpm test directory
pnpm test notifications
```

---

## Verification Checklist

**Files:**
- [ ] Upload with progress tracking
- [ ] Preview all supported types
- [ ] Folder navigation
- [ ] Storage quota display

**Search:**
- [ ] ⌘K opens palette
- [ ] Debounced search (300ms)
- [ ] Match highlighting
- [ ] Recent searches persist

**Directory:**
- [ ] Org tree expand/collapse
- [ ] User CRUD forms
- [ ] Bulk import CSV
- [ ] Audit log filtering

**Notifications:**
- [ ] In-app notification center
- [ ] Toast auto-dismiss
- [ ] PWA install prompt
- [ ] Offline banner
- [ ] Push permission request
- [ ] Service worker caching

---

## Success Criteria

✅ All components render in Storybook  
✅ File upload & preview functional  
✅ Search with highlighting works  
✅ Directory tree navigable  
✅ PWA installable  
✅ Offline mode works  
✅ Notifications functional  
✅ All accessibility tests pass
