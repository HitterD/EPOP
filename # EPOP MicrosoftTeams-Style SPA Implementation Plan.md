# EPOP Microsoft Teams-Style SPA Implementation Plan

## 1. Project Foundation & Tooling

**Initialize Next.js 14 with TypeScript and essential tooling:**

- `package.json` with Next.js 14, React 18, TypeScript, Tailwind CSS, ESLint, Prettier
- Key dependencies: `zustand`, `socket.io-client`, `@svar/gantt-react`, `@svar/grid-react`, `@tanstack/react-query`, `zod`, `react-hook-form`, `date-fns`, `lucide-react`
- Dev dependencies: `@playwright/test`, `@testing-library/react`, `@storybook/nextjs`
- Configure `next.config.js` for PWA support (`next-pwa`), image optimization, custom server for Socket.IO
- Setup `tailwind.config.ts` with Teams-inspired design tokens (colors, spacing, shadows)
- Create `tsconfig.json` with path aliases (`@/components`, `@/lib`, `@/features`, `@/app`)

**Files to create:**

- `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `.env.local.example`, `.prettierrc`, `.eslintrc.json`

## 2. Design System with shadcn/ui

**Setup shadcn/ui components library:**

- Run `npx shadcn-ui@latest init` with Tailwind configuration
- Install core components: `button`, `input`, `card`, `dialog`, `dropdown-menu`, `popover`, `tooltip`, `avatar`, `badge`, `separator`, `tabs`, `sheet`, `toast`, `command`, `calendar`, `select`, `checkbox`, `scroll-area`, `context-menu`, `alert`, `skeleton`
- Create custom theme provider at `components/providers/theme-provider.tsx` for dark/light mode
- Build Teams-style presence chip component: `components/ui/presence-badge.tsx` (available/busy/away/offline states with phone extension)
- Create keyboard shortcut system: `lib/hooks/use-keyboard-shortcuts.ts`

**Key custom components:**

- `components/shell/app-shell.tsx` - Main layout wrapper
- `components/shell/left-rail.tsx` - Navigation sidebar
- `components/shell/top-header.tsx` - Global header with search
- `components/ui/rich-text-editor.tsx` - TipTap or Lexical based editor
- `components/ui/file-upload.tsx` - Drag-drop upload component

## 3. State Management & API Layer

**Zustand stores structure:**

- `lib/stores/auth-store.ts` - Session, user profile, permissions
- `lib/stores/chat-store.ts` - Active chats, messages, typing indicators
- `lib/stores/projects-store.ts` - Projects, tasks, board state
- `lib/stores/files-store.ts` - File browser state
- `lib/stores/directory-store.ts` - Org tree structure
- `lib/stores/notifications-store.ts` - Toast queue, notification center
- `lib/stores/ui-store.ts` - Theme, sidebar collapsed, active view

**API layer with TanStack Query:**

- `lib/api/client.ts` - Base fetch wrapper with auth interceptor
- `lib/api/hooks/use-auth.ts` - Login, logout, refresh mutations
- `lib/api/hooks/use-chats.ts` - Chat queries and mutations
- `lib/api/hooks/use-projects.ts` - Project/task CRUD
- `lib/api/hooks/use-files.ts` - File operations
- `lib/api/hooks/use-search.ts` - Global search query
- `lib/api/hooks/use-directory.ts` - Org tree operations

**Socket.IO client:**

- `lib/socket/client.ts` - Socket.IO client singleton with reconnection logic
- `lib/socket/hooks/use-socket-event.ts` - React hook for event subscriptions
- `lib/socket/rooms.ts` - Room join/leave helpers

## 4. Authentication System

**API Routes:**

- `app/api/auth/login/route.ts` - POST: Validate credentials, set httpOnly cookies (accessToken, refreshToken)
- `app/api/auth/refresh/route.ts` - POST: Refresh access token
- `app/api/auth/logout/route.ts` - POST: Clear cookies
- `app/api/auth/register/route.ts` - POST: Create user (check admin flag)
- `app/api/auth/forgot-password/route.ts` - POST: Send reset email
- `app/api/auth/reset-password/route.ts` - POST: Validate token, update password

**Auth pages:**

- `app/(auth)/login/page.tsx` - Login form with react-hook-form + zod
- `app/(auth)/forgot-password/page.tsx` - Email submission
- `app/(auth)/reset-password/page.tsx` - Password reset form
- `app/(auth)/register/page.tsx` - Registration (gated by admin setting)
- `app/(auth)/layout.tsx` - Auth pages layout (centered card)

**Middleware:**

- `middleware.ts` - Verify accessToken from cookies, redirect unauthorized users to `/login`

## 5. App Shell & Layout

**Main shell structure:**

- `app/(shell)/layout.tsx` - Main app layout with `<LeftRail />`, `<TopHeader />`, and main content area
- `components/shell/left-rail.tsx` - Navigation with Activity, Chat, Projects, Files, Directory (admin-only), Admin links; show active route, keyboard shortcuts (Ctrl+1-6)
- `components/shell/top-header.tsx` - Back/forward buttons, global search command palette (Ctrl+K), presence indicator, profile dropdown

**Layout pattern:**

- List pane (left, 320px): conversations, projects, files list
- Content pane (right, flex-1): detail view
- Use `<ResizablePanelGroup />` from shadcn for adjustable split

## 6. Dashboard

**Dashboard route:**

- `app/(shell)/dashboard/page.tsx` - Grid of summary cards
- Fetch data from `app/api/me/summary/route.ts` - Returns: `{ currentProjects, unreadMessages, myTasks, upcomingAgenda, storageUsage }`

**Cards to display:**

- Current Projects: Top 5 active projects with progress bars
- Unread Messages: Count + recent preview
- My Tasks (To-Do): Due today/this week
- Upcoming Agenda: Calendar aggregated from task start/due dates
- Storage Usage: Bar chart showing file storage (future: Synology)

**Admin-only Directory Editor card:**

- Inline tree editor for divisions/teams
- Drag-drop users to move org units
- Show extension + presence on user nodes
- Component: `features/directory/components/directory-tree-editor.tsx`

## 7. Chat (Real-time)

**Chat routes:**

- `app/(shell)/chat/page.tsx` - Split layout: list + empty state
- `app/(shell)/chat/[chatId]/page.tsx` - Message stream + compose footer

**API Routes:**

- `app/api/chats/route.ts` - GET: List recent chats, POST: Create new chat
- `app/api/chats/[chatId]/route.ts` - GET: Chat details
- `app/api/chats/[chatId]/messages/route.ts` - GET: Paginated messages, POST: Send message
- `app/api/chats/[chatId]/reactions/route.ts` - POST: Add reaction
- `app/api/chats/[chatId]/threads/route.ts` - GET/POST: Thread messages

**Components:**

- `features/chat/components/chat-list.tsx` - Left pane: recent chats with unread badges, pin/mute icons
- `features/chat/components/message-stream.tsx` - Virtualized message list (react-window)
- `features/chat/components/message-bubble.tsx` - Message with reactions, read receipts, thread button
- `features/chat/components/thread-panel.tsx` - Side sheet for thread view
- `features/chat/components/chat-compose.tsx` - Rich editor footer with toolbar (bold/italic/list/heading/code/quote), delivery priority selector, attachment upload, schedule send, emoji picker, mention autocomplete

**Socket.IO events:**

- Client emits: `join_chat`, `leave_chat`, `send_message`, `typing_start`, `typing_stop`
- Server emits: `new_message`, `message_updated`, `reaction_added`, `user_typing`, `read_receipt`

**Optimistic UI:**

- Add message to local store immediately with `tempId`
- Replace `tempId` with real `id` when server confirms

## 8. Compose / Mail-like Messaging

**Mail routes:**

- `app/(shell)/mail/page.tsx` - Redirect to `/mail/received`
- `app/(shell)/mail/[folder]/page.tsx` - Folder view: received/sent/deleted
- `app/(shell)/mail/[folder]/[messageId]/page.tsx` - Message detail

**API Routes:**

- `app/api/mail/route.ts` - GET: List messages by folder, POST: Compose new mail
- `app/api/mail/[messageId]/route.ts` - GET: Message detail, PATCH: Move folder, DELETE: Soft delete

**Components:**

- `features/compose/components/mail-list.tsx` - Left pane: folder sidebar + message list with subject/preview
- `features/compose/components/mail-detail.tsx` - Header (To, Cc, Subject), HTML body, attachments list
- `features/compose/components/mail-compose.tsx` - Full compose dialog with rich editor, To/Cc/Bcc, Subject, priority, attachments
- `features/compose/components/attachment-uploader.tsx` - Upload to MinIO-compatible storage (future), return fileId/URL

**Toggle feature:**

- In chat compose footer: "Send as Mail" toggle → opens compose dialog pre-filled
- All uploaded files sync to Files area via `app/api/files/route.ts`

## 9. Projects & Planner

**Project routes:**

- `app/(shell)/projects/page.tsx` - Projects list with cards
- `app/(shell)/projects/[projectId]/page.tsx` - Project detail with view tabs

**Views (tabs):**

- Board: Kanban with draggable task cards across buckets (dnd-kit library)
- Grid: SVAR DataGrid with columns: title, assignees, status, priority, due date
- Gantt: SVAR Gantt with task dependencies, start/end dates, progress bars
- Schedule: Calendar view (react-big-calendar) with tasks as events
- Charts: Progress charts (recharts)

**API Routes:**

- `app/api/projects/route.ts` - GET: List projects, POST: Create project
- `app/api/projects/[projectId]/route.ts` - GET/PATCH/DELETE: Project details
- `app/api/projects/[projectId]/tasks/route.ts` - GET/POST: Tasks
- `app/api/projects/[projectId]/tasks/[taskId]/route.ts` - GET/PATCH/DELETE: Task
- `app/api/projects/[projectId]/buckets/route.ts` - GET/POST: Kanban buckets

**Components:**

- `features/projects/components/project-board.tsx` - Kanban board with dnd-kit
- `features/projects/components/project-grid.tsx` - SVAR DataGrid integration
- `features/projects/components/project-gantt.tsx` - SVAR Gantt integration
- `features/projects/components/task-modal.tsx` - Full task editor: title, assignees (multi-select with avatars), labels (color chips), start/due dates (date picker), priority (dropdown), progress (slider), checklist (nested list), attachments, comments section
- `features/projects/components/task-card.tsx` - Card for board view

**Socket.IO real-time updates:**

- Events: `task_created`, `task_updated`, `task_moved`, `task_deleted`
- Broadcast changes to all clients in project room (<1s latency)

## 10. Files

**Files routes:**

- `app/(shell)/files/page.tsx` - File browser with grid/list toggle
- `app/(shell)/files/[fileId]/page.tsx` - File preview/detail

**API Routes:**

- `app/api/files/route.ts` - GET: List files, POST: Request pre-signed upload URL (future MinIO)
- `app/api/files/[fileId]/route.ts` - GET: File metadata + download URL, DELETE: Remove file
- `app/api/files/[fileId]/preview/route.ts` - GET: Preview thumbnail

**Components:**

- `features/files/components/file-browser.tsx` - Grid/list view toggle
- `features/files/components/file-card.tsx` - Card with thumbnail, name, size, context badge (chat/mail/project)
- `features/files/components/file-upload-zone.tsx` - Drag-drop upload area
- `features/files/components/file-preview.tsx` - Preview modal (images, PDFs with react-pdf)

**Upload flow (future-proof for Synology MinIO):**

1. Client requests pre-signed PUT URL from API
2. Client uploads directly to storage
3. Client confirms upload, API stores metadata with context (chatId, projectId, etc.)

## 11. Global Search

**Search components:**

- `components/shell/search-command.tsx` - Command palette (Ctrl+K) using shadcn `<Command />`
- Results tabs: Messages, Projects, Users, Files
- Filters: date range, sender, project, file type

**API Routes:**

- `app/api/search/route.ts` - GET: Unified search query param, returns: `{ messages: [], projects: [], users: [], files: [] }`
- Future: Integrate with ZincSearch for full-text indexing

**Search implementation:**

- Use simple SQL LIKE queries for prototype
- Add indexed columns on frequently searched fields
- Return relevance-scored results with highlighting

## 12. Directory (Admin-only)

**Directory integration in Dashboard:**

- `features/directory/components/directory-tree-editor.tsx` - Nested tree with react-arborist or custom recursive component
- Drag-drop users between org units
- Show: name, title, extension, presence badge
- Inline edit org unit names

**API Routes:**

- `app/api/directory/route.ts` - GET: Full org tree
- `app/api/directory/[unitId]/route.ts` - PATCH: Update unit
- `app/api/directory/users/[userId]/move/route.ts` - POST: Move user to new unit

**Admin guard:**

- Middleware checks user role from session
- Hide Directory nav item for non-admins

## 13. Notifications

**In-app notifications:**

- `components/notifications/notification-center.tsx` - Popover with notification list
- `components/notifications/toast-container.tsx` - Toast queue renderer (sonner library)
- Bell icon in top header with unread badge

**Web Push (PWA):**

- `lib/pwa/register-service-worker.ts` - Register SW, request notification permission
- `app/api/notifications/subscribe/route.ts` - Save VAPID subscription
- `public/sw.js` - Service worker for push notifications

**API Routes:**

- `app/api/notifications/route.ts` - GET: List notifications, POST: Send notification
- `app/api/notifications/[notificationId]/read/route.ts` - PATCH: Mark as read

**Per-channel settings:**

- `features/notifications/components/notification-settings.tsx` - Toggle notifications per chat/project

## 14. Socket.IO Server Setup

**Custom Next.js server:**

- `server.js` - Custom server with Socket.IO attached
- Update `package.json` scripts: `"dev": "node server.js"`

**Socket.IO server structure:**

- `lib/socket/server.ts` - Socket.IO server initialization, auth middleware (verify JWT from handshake)
- `lib/socket/handlers/chat-handler.ts` - Handle chat events
- `lib/socket/handlers/project-handler.ts` - Handle project real-time updates
- Room management: users join rooms per chat/project

## 15. Testing & Quality

**Playwright E2E tests:**

- `e2e/auth.spec.ts` - Login flow, redirect to dashboard
- `e2e/chat.spec.ts` - Send message, verify real-time update on second client
- `e2e/projects.spec.ts` - Drag-drop task, verify update on second client
- `e2e/files.spec.ts` - Upload file, verify in Files area

**React Testing Library:**

- `features/chat/components/__tests__/message-bubble.test.tsx`
- `features/projects/components/__tests__/task-modal.test.tsx`

**Storybook:**

- `.storybook/main.ts` - Storybook config for Next.js 14
- Stories for: `MessageBubble`, `TaskCard`, `TaskModal`, `FileCard`, `PresenceBadge`, `ChatCompose`, `MailCompose`

## 16. PWA Configuration

**PWA setup:**

- `next.config.js` - Enable `next-pwa` plugin
- `public/manifest.json` - App manifest with icons, theme color
- `public/icons/` - PWA icons (192x192, 512x512)
- `app/layout.tsx` - Add manifest link, theme-color meta

**Installability:**

- Ensure HTTPS in production
- Service worker for offline fallback
- Add install prompt UI

## 17. Documentation

**README files:**

- Root `README.md` - Project overview, setup instructions, environment variables
- `docs/frontend/SHELL.md` - App shell architecture, navigation
- `docs/frontend/CHAT.md` - Chat feature, real-time events, compose
- `docs/frontend/COMPOSE.md` - Mail-like messaging, folders, attachments
- `docs/frontend/PROJECTS.md` - Projects feature, views, SVAR integration
- `docs/frontend/FILES.md` - File management, upload flow
- `docs/frontend/SEARCH.md` - Global search implementation
- `docs/frontend/DIRECTORY.md` - Org tree editor, admin features
- `docs/frontend/NOTIFICATIONS.md` - In-app + Web Push

**Code documentation:**

- JSDoc comments on all exported functions/components
- Type definitions in `types/` directory

## 18. Database Schema (In-memory prototype, PostgreSQL future)

**Initial in-memory data structures:**

- `lib/db/mock-data.ts` - Mock users, chats, messages, projects, tasks, files
- Use Map/Set for fast lookups
- Simple JSON serialization for persistence (future: PostgreSQL)

**Key tables for future PostgreSQL:**

- users, chats, chat_members, messages, reactions, threads
- projects, tasks, task_assignees, task_attachments, task_comments
- files, file_contexts
- org_units, user_org_mappings
- notifications, notification_preferences

## Key Files Summary

**Root config:** `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `middleware.ts`, `server.js`

**App routes:** `app/(auth)/login/page.tsx`, `app/(shell)/dashboard/page.tsx`, `app/(shell)/chat/[chatId]/page.tsx`, `app/(shell)/mail/[folder]/page.tsx`, `app/(shell)/projects/[projectId]/page.tsx`, `app/(shell)/files/page.tsx`

**API routes:** `app/api/auth/*/route.ts`, `app/api/chats/*/route.ts`, `app/api/mail/*/route.ts`, `app/api/projects/*/route.ts`, `app/api/files/*/route.ts`, `app/api/search/route.ts`, `app/api/directory/*/route.ts`, `app/api/notifications/*/route.ts`

**Features:** `features/chat/`, `features/compose/`, `features/projects/`, `features/files/`, `features/directory/`, `features/notifications/`

**Lib:** `lib/stores/`, `lib/api/`, `lib/socket/`, `lib/hooks/`, `lib/db/`

**Components:** `components/shell/`, `components/ui/`, `components/notifications/`

**Tests:** `e2e/`, `**/__tests__/`, `.storybook/`

**Docs:** `docs/frontend/`

This plan delivers a production-ready, Microsoft Teams-inspired EPOP SPA with all requested features, using modern best practices and advanced libraries for long-term maintainability.