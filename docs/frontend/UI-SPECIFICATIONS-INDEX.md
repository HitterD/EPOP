# UI Specifications Index — EPOP Collaboration Platform

> **Design System:** Tailwind CSS + shadcn/ui + Lucide Icons  
> **Accessibility:** WCAG 2.1 AA Compliant  
> **Architecture:** Keyboard-first, Dark/Light mode, Offline-capable  
> **Target Audience:** Frontend developers ready for implementation

---

## Overview

Ini adalah koleksi lengkap spesifikasi UI/UX untuk 7 modul inti aplikasi kolaborasi EPOP. Setiap spesifikasi mencakup:

✅ **Component inventory** dengan props, states, variants  
✅ **User flows** end-to-end untuk setiap fitur  
✅ **Interaction rules** (hover, focus, keyboard, touch)  
✅ **Copywriting** untuk semua state (empty, error, success)  
✅ **Layout tokens** (spacing, responsive breakpoints, z-index)  
✅ **Accessibility checklist** (ARIA roles, keyboard nav, screen reader)  
✅ **Edge cases** dan error handling  
✅ **Performance targets** dan optimization strategies  
✅ **API endpoint mapping** untuk integrasi backend

---

## Specifications

### 1. Real-time Chat & Presence
**File:** [`UI-SPEC-CHAT-PRESENCE.md`](./UI-SPEC-CHAT-PRESENCE.md)

**Cakupan:**
- Chat list dengan presence indicators
- Thread view dengan nested replies
- Message composer (emoji, file attach, @mentions)
- Reactions dan read receipts
- Typing indicators
- Reconnect banner & offline handling
- WebSocket state management

**Komponen Utama:**
- `ChatList` — Conversation list dengan unread counts
- `ThreadView` — Message thread dengan virtualization
- `MessageComposer` — Rich input dengan autocomplete
- `PresenceBadge` — Online/away/offline indicator
- `ReconnectBanner` — Connection status & retry

**Keyboard Shortcuts:**
- `↓/↑` Navigate chats
- `Enter` Open conversation
- `R` Reply to message
- `E` React with emoji
- `Cmd+K` Quick switch
- `N` Jump to next unread

**Edge Cases Handled:**
- Duplicate message delivery (dedupe by ID)
- Message send failures (retry queue)
- Offline message queueing
- Scroll position preservation
- Read receipt race conditions

---

### 2. Mail Compose & Folders
**File:** [`UI-SPEC-MAIL-COMPOSE.md`](./UI-SPEC-MAIL-COMPOSE.md)

**Cakupan:**
- Folder navigation (Inbox, Sent, Deleted, Drafts, Archive)
- Rich text compose dengan toolbar
- Attachment management dengan progress
- Priority marking
- Bulk actions (delete, archive, move)
- Draft auto-save & recovery

**Komponen Utama:**
- `MailSidebar` — Folder list dengan unread counts
- `MailList` — Message list dengan vim-style keyboard nav
- `MailDetail` — Full message view
- `MailComposer` — Rich text editor dengan attachments
- `RecipientInput` — Autocomplete untuk To/Cc/Bcc

**Keyboard Shortcuts:**
- `J/K` Navigate messages
- `X` Select message
- `Enter` Open message
- `R` Reply
- `A` Reply all
- `F` Forward
- `Shift+D` Delete
- `E` Archive
- `C` Compose

**Edge Cases Handled:**
- Duplicate send prevention
- Large attachment blocking (>25MB)
- Offline compose (localStorage draft)
- Draft conflict (multi-tab sync)
- Empty subject warning
- Upload retry logic

---

### 3. Projects (Kanban/Gantt)
**File:** [`UI-SPEC-PROJECTS-KANBAN-GANTT.md`](./UI-SPEC-PROJECTS-KANBAN-GANTT.md)

**Cakupan:**
- Kanban board (6 lanes: Backlog → Done)
- Gantt chart (custom CSS Grid, no external lib)
- Table view (TanStack Table + Virtual)
- Drag & drop dengan keyboard fallback
- WIP limits per lane
- Task dependencies
- Filtering & bulk actions

**Komponen Utama:**
- `KanbanBoard` — Drag-drop lanes dengan WIP limits
- `GanttChart` — Timeline dengan bars & dependencies
- `ProjectTable` — Virtualized table dengan sort/filter
- `TaskDetailModal` — Full task CRUD form
- `FilterBar` — Global task filtering

**Keyboard Shortcuts:**
- `1/2/3` Switch views (Kanban/Gantt/List)
- `N` New task
- `M` Move card (keyboard fallback)
- `+/-` Zoom Gantt
- `T` Jump to today

**Edge Cases Handled:**
- Circular dependency detection
- Concurrent edit warnings
- Overdue task highlighting
- WIP limit exceeded warnings
- Gantt date conflicts
- Large dataset virtualization (1k+ tasks)

---

### 4. Files Upload & Preview
**File:** [`UI-SPEC-FILES-UPLOAD-PREVIEW.md`](./UI-SPEC-FILES-UPLOAD-PREVIEW.md)

**Cakupan:**
- Drag & drop upload zone
- Multi-file queue dengan progress
- Preview modal (images, PDF, video, text, Office)
- Folder tree navigation
- Storage quota tracking
- Virus scanning status

**Komponen Utama:**
- `FileUploadZone` — Drag-drop area dengan validation
- `FileUploadQueue` — Progress tracker untuk multi-file
- `FileList` — Grid/list view dengan thumbnails
- `FilePreviewModal` — Universal file preview
- `StorageQuota` — Usage indicator

**Preview Support:**
- Images (PNG, JPG, GIF, WebP, SVG)
- PDF (embedded viewer)
- Text (syntax highlighting)
- Video/Audio (native players)
- Office docs (server-side conversion)

**Edge Cases Handled:**
- Duplicate filename (auto-rename)
- Large file chunked upload (>100MB)
- Concurrent upload queue (3 parallel max)
- Offline upload queue
- Virus scan pending state
- Preview timeout handling

---

### 5. Global Search
**File:** [`UI-SPEC-GLOBAL-SEARCH.md`](./UI-SPEC-GLOBAL-SEARCH.md)

**Cakupan:**
- Command palette (⌘K)
- Multi-scope search (messages, projects, files, users)
- Match highlighting dengan context snippets
- Recent searches
- Advanced filters (date, author, tags)
- Spell correction

**Komponen Utama:**
- `SearchCommandPalette` — Universal search overlay
- `ScopeFilter` — Type-based filtering
- `SearchResultItem` — Context-aware result display
- `RecentSearches` — Quick access to history
- `SearchFilters` — Advanced filter panel

**Keyboard Shortcuts:**
- `Cmd+K` Open palette
- `↓/↑` Navigate results
- `Tab` Cycle scopes
- `Enter` Select result
- `Escape` Close

**Performance:**
- Debounce: 300ms
- Min query: 2 chars
- P95 latency: <500ms
- Incremental rendering (5 results per group initially)
- Result caching (5 min)

**Edge Cases Handled:**
- Empty query (show recents)
- Special char escaping
- Simultaneous search cancellation
- Stale result handling
- Permission-filtered results
- Slow backend timeout (10s)

---

### 6. Directory & Admin
**File:** [`UI-SPEC-DIRECTORY-ADMIN.md`](./UI-SPEC-DIRECTORY-ADMIN.md)

**Cakupan:**
- Organization tree (departments, teams, users)
- User cards dengan presence & contact info
- Admin dashboard
- User CRUD (create, edit, deactivate, delete)
- Bulk import from Excel/CSV
- Role & permission management
- Audit logs

**Komponen Utama:**
- `OrganizationTree` — Hierarchical company structure
- `UserCard` — Detailed user profile
- `UserFormDialog` — Create/edit user
- `BulkImportDialog` — Excel/CSV import dengan validation
- `RolePermissionsMatrix` — RBAC configuration
- `AuditLogViewer` — Activity history

**RBAC Indicators:**
- Admin: Red badge
- Manager: Blue badge
- Member: Green badge
- Guest: Gray badge

**Edge Cases Handled:**
- Duplicate email in bulk import
- User deleted during edit
- Concurrent edit conflicts
- Self-deactivation prevention (admin)
- Last admin delete prevention
- Large org virtualization (10k+ users)

---

### 7. Notifications & PWA
**File:** [`UI-SPEC-NOTIFICATIONS-PWA.md`](./UI-SPEC-NOTIFICATIONS-PWA.md)

**Cakupan:**
- Notification center (in-app)
- Push notifications (web push API)
- Toast notifications
- PWA install prompts
- Offline banner
- Service worker updates
- Background sync
- DND (Do Not Disturb) scheduling

**Komponen Utama:**
- `NotificationCenter` — Central notification hub
- `NotificationToast` — Temporary alerts
- `InstallPrompt` — PWA install encouragement
- `OfflineBanner` — Connection status
- `ServiceWorkerUpdate` — Version update prompt
- `PushPermissionPrompt` — Permission request flow

**PWA Features:**
- Offline-first caching strategy
- Background sync for queued actions
- Push notification support
- App shortcuts (New Message, My Projects)
- Standalone window mode

**Edge Cases Handled:**
- Permission denied (re-enable instructions)
- Service worker registration failure
- Notification click on closed app
- Offline queue full (>100 actions)
- DND conflict with urgent alerts
- Multiple tabs sync (BroadcastChannel)
- Push token expiration

---

## Design System Tokens

### Colors
```javascript
// Primary palette
primary: 'hsl(221, 83%, 53%)'      // Blue
accent: 'hsl(210, 40%, 96%)'       // Light blue
muted: 'hsl(210, 40%, 96%)'        // Gray

// Semantic colors
success: 'hsl(142, 76%, 36%)'      // Green
warning: 'hsl(38, 92%, 50%)'       // Yellow
error: 'hsl(0, 84%, 60%)'          // Red
```

### Typography
```javascript
// Font sizes
xs: '0.75rem'    // 12px
sm: '0.875rem'   // 14px
base: '1rem'     // 16px
lg: '1.125rem'   // 18px
xl: '1.25rem'    // 20px
'2xl': '1.5rem'  // 24px

// Font weights
normal: 400
medium: 500
semibold: 600
bold: 700
```

### Spacing
```javascript
// Spacing scale
0: '0px'
1: '0.25rem'   // 4px
2: '0.5rem'    // 8px
3: '0.75rem'   // 12px
4: '1rem'      // 16px
6: '1.5rem'    // 24px
8: '2rem'      // 32px
12: '3rem'     // 48px
```

### Responsive Breakpoints
```javascript
sm: '640px'    // Mobile
md: '768px'    // Tablet
lg: '1024px'   // Desktop
xl: '1280px'   // Large desktop
'2xl': '1536px' // Extra large
```

### Z-index Scale
```javascript
base: 0
dropdown: 40
banner: 50
modal: 50
toast: 100
```

---

## Accessibility Standards

Semua spesifikasi mematuhi **WCAG 2.1 Level AA**:

### Keyboard Navigation
- ✅ Semua fungsi accessible tanpa mouse
- ✅ Visible focus indicators (`ring-2 ring-primary`)
- ✅ Logical tab order
- ✅ Skip links untuk main regions
- ✅ Keyboard shortcuts terdokumentasi

### Screen Reader Support
- ✅ Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ✅ ARIA roles & labels lengkap
- ✅ Live regions untuk dynamic content
- ✅ Form labels & error associations
- ✅ Alt text untuk images

### Visual Accessibility
- ✅ Contrast ratio 4.5:1 untuk text
- ✅ Contrast ratio 3:1 untuk UI components
- ✅ Color bukan sole indicator (icons + text)
- ✅ Focus rings visible di light & dark mode
- ✅ Resizable text hingga 200%

### Motion & Animation
- ✅ Respect `prefers-reduced-motion`
- ✅ No auto-playing videos
- ✅ Animation toggleable in settings
- ✅ Static alternatives untuk animated content

---

## Performance Targets

### Loading
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s

### Runtime
- 60fps smooth scrolling
- Virtualization untuk 1000+ items
- Debounced search: 300ms
- API response P95: <500ms

### Bundle Size
- Initial JS bundle: <200KB gzipped
- CSS bundle: <50KB gzipped
- Lazy load routes (code splitting)
- Tree-shaking unused code

### Optimizations
- Image lazy loading
- Virtual scrolling (react-virtual, tanstack/virtual)
- React.memo untuk expensive components
- Debounce/throttle user inputs
- Service worker caching

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Setup Tailwind + shadcn/ui
- [ ] Configure dark/light mode
- [ ] Implement base layout (header, sidebar, main)
- [ ] Setup routing (Next.js App Router)
- [ ] Configure API client (fetch/axios + React Query)

### Phase 2: Core Features (Week 3-6)
- [ ] Chat & Presence (UI-SPEC-CHAT-PRESENCE.md)
- [ ] Mail Compose (UI-SPEC-MAIL-COMPOSE.md)
- [ ] Global Search (UI-SPEC-GLOBAL-SEARCH.md)
- [ ] Directory (UI-SPEC-DIRECTORY-ADMIN.md)

### Phase 3: Advanced Features (Week 7-9)
- [ ] Projects Kanban/Gantt (UI-SPEC-PROJECTS-KANBAN-GANTT.md)
- [ ] Files Upload/Preview (UI-SPEC-FILES-UPLOAD-PREVIEW.md)
- [ ] Notifications (UI-SPEC-NOTIFICATIONS-PWA.md)

### Phase 4: PWA & Polish (Week 10-11)
- [ ] PWA setup (manifest, service worker)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Background sync
- [ ] Performance optimization

### Phase 5: Testing & Launch (Week 12)
- [ ] Accessibility audit (axe, WAVE)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] E2E tests (Playwright)
- [ ] Documentation
- [ ] Deployment

---

## Testing Strategy

### Unit Tests
- Component logic (Jest + React Testing Library)
- Custom hooks
- Utility functions
- Target: 80% coverage

### Integration Tests
- User flows (multi-step interactions)
- API integration
- Form submissions
- Target: Critical paths covered

### E2E Tests
- End-to-end scenarios (Playwright)
- Cross-browser (Chrome, Firefox, Safari)
- Mobile viewport
- Target: Happy paths + error cases

### Accessibility Tests
- Automated: axe-core, jest-axe
- Manual: Screen reader testing (NVDA, VoiceOver)
- Keyboard-only navigation
- Color contrast verification

### Performance Tests
- Lighthouse CI
- Web Vitals monitoring
- Bundle size checks
- Load testing (1000+ items)

---

## Questions & Support

Jika ada pertanyaan selama implementasi, rujuk ke:

1. **Spesifikasi detail** di masing-masing file MD
2. **shadcn/ui docs** untuk komponen base: https://ui.shadcn.com
3. **Tailwind docs** untuk styling: https://tailwindcss.com
4. **Lucide icons** untuk icon library: https://lucide.dev

**Success Criteria:**
> Developer dapat mengimplementasi setiap modul **tanpa perlu bertanya ulang** karena semua state, edge case, dan interaksi sudah terdefinisi lengkap.

---

**Generated:** November 10, 2025  
**Version:** 1.0  
**Design System:** Tailwind CSS + shadcn/ui + Lucide Icons  
**Target:** Frontend Development Team
