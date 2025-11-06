# 📚 EPOP Frontend Component Index

**Quick reference guide for all implemented components**

---

## 🎯 Quick Navigation

- [Chat Components](#chat-components)
- [Projects Components](#projects-components)
- [Files Components](#files-components)
- [Search Components](#search-components)
- [Notifications Components](#notifications-components)
- [Directory Components](#directory-components)
- [Utility Hooks](#utility-hooks)

---

## 💬 Chat Components

### OptimisticMessageList
**Path**: `features/chat/components/optimistic-message-list.tsx`

**Purpose**: Core chat message list dengan optimistic UI updates

**Props**:
```typescript
{
  chatId: string
  messages: Message[]
  currentUserId: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  onSendMessage: (content: string, tempId: string) => Promise<void>
}
```

**Features**:
- ✅ Optimistic message sending
- ✅ Retry failed messages
- ✅ Auto-scroll dengan user detection
- ✅ Date grouping
- ✅ Real-time updates via Socket.IO

**Usage**:
```tsx
<OptimisticMessageList
  chatId={chatId}
  messages={messages}
  currentUserId={currentUser.id}
  onSendMessage={handleSend}
  hasNextPage={hasNextPage}
  onLoadMore={fetchNextPage}
/>
```

---

### MessageBubbleEnhanced
**Path**: `features/chat/components/message-bubble-enhanced.tsx`

**Purpose**: Enhanced message bubble dengan read receipts & reactions

**Props**:
```typescript
{
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  onReact?: (emoji: string) => void
  onReply?: () => void
  onEdit?: () => void
  onDelete?: () => void
}
```

**Features**:
- ✅ Read receipts (✓ sent, ✓✓ read)
- ✅ Reaction aggregation
- ✅ Link preview
- ✅ Delivery priority indicators
- ✅ Quick reaction buttons on hover

---

### MessageAttachments
**Path**: `features/chat/components/message-attachments.tsx`

**Purpose**: Display message attachments dengan preview

**Props**:
```typescript
{
  attachments: Attachment[]
  compact?: boolean
}
```

**Features**:
- ✅ Image thumbnail grid (max 4)
- ✅ File type icons
- ✅ Preview modal integration
- ✅ Download buttons
- ✅ Hover overlay actions

---

### TypingIndicator
**Path**: `features/chat/components/typing-indicator.tsx`

**Purpose**: Real-time typing status dari multiple users

**Props**:
```typescript
{
  chatId: string
  currentUserId: string
}
```

**Features**:
- ✅ Multiple users support
- ✅ Avatar display
- ✅ Animated dots

---

### ScrollToBottomButton
**Path**: `features/chat/components/scroll-to-bottom-button.tsx`

**Purpose**: Floating button untuk scroll ke bottom

**Props**:
```typescript
{
  onClick: () => void
  unreadCount?: number
}
```

---

### LoadMoreButton
**Path**: `features/chat/components/load-more-button.tsx`

**Purpose**: Button untuk load more messages

**Props**:
```typescript
{
  onClick?: () => void
  loading?: boolean
}
```

---

## 📋 Projects Components

### BoardView
**Path**: `features/projects/components/board-view.tsx`

**Purpose**: Main Kanban board dengan drag-and-drop

**Props**:
```typescript
{
  projectId: string
  buckets: Bucket[]
  tasks: Task[]
  onAddTask?: (bucketId: string) => void
  onEditTask?: (task: Task) => void
}
```

**Features**:
- ✅ @dnd-kit drag-and-drop
- ✅ Optimistic updates
- ✅ Rollback on error
- ✅ Real-time sync <1s
- ✅ Visual feedback (ghost card, drop zones)

**Usage**:
```tsx
<BoardView
  projectId={projectId}
  buckets={buckets}
  tasks={tasks}
  onAddTask={(bucketId) => openAddTaskDialog(bucketId)}
  onEditTask={(task) => openEditTaskDialog(task)}
/>
```

---

### BoardColumn
**Path**: `features/projects/components/board-column.tsx`

**Purpose**: Individual bucket/column dalam board

**Props**:
```typescript
{
  bucket: Bucket
  tasks: Task[]
  onAddTask?: () => void
  onEditTask?: (task: Task) => void
  isDragging?: boolean
}
```

**Features**:
- ✅ Droppable zone
- ✅ Progress bar
- ✅ Task count badge
- ✅ Color-coded (4 colors)
- ✅ Empty state dengan CTA

---

### TaskCardDraggable
**Path**: `features/projects/components/task-card-draggable.tsx`

**Purpose**: Draggable task card

**Props**:
```typescript
{
  task: Task
  onEdit?: () => void
  onDelete?: () => void
  isDragging?: boolean
}
```

**Features**:
- ✅ Sortable dengan @dnd-kit
- ✅ Priority indicators (4 levels)
- ✅ Progress bar
- ✅ Due date dengan overdue detection
- ✅ Assignee avatars
- ✅ Labels/tags
- ✅ Attachment & comment counts

---

### ProjectBoardPage
**Path**: `features/projects/components/project-board-page.tsx`

**Purpose**: Integration wrapper untuk board view

**Props**:
```typescript
{
  projectId: string
}
```

**Features**:
- ✅ Data fetching
- ✅ Loading skeleton
- ✅ Error handling
- ✅ Empty state

---

## 📁 Files Components

### FileUploadZone
**Path**: `features/files/components/file-upload-zone.tsx`

**Purpose**: Drag-drop upload area dengan queue

**Props**:
```typescript
{
  onUploadComplete?: (fileIds: string[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  contextType?: string
  contextId?: string
}
```

**Features**:
- ✅ Drag & drop
- ✅ Multi-file queue
- ✅ Real-time progress (0-100%)
- ✅ Status tracking (5 states)
- ✅ Retry failed uploads
- ✅ Presigned upload flow

**Usage**:
```tsx
<FileUploadZone
  maxFiles={10}
  maxSize={10 * 1024 * 1024}
  contextType="chat"
  contextId={chatId}
  onUploadComplete={(fileIds) => console.log(fileIds)}
/>
```

---

### FilePreviewModal
**Path**: `features/files/components/file-preview-modal.tsx`

**Purpose**: File preview modal untuk PDF/images/video/audio

**Props**:
```typescript
{
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  files?: FileItem[]
  onNavigate?: (direction: 'prev' | 'next') => void
}
```

**Features**:
- ✅ PDF preview (placeholder untuk react-pdf)
- ✅ Image preview dengan zoom (25%-200%)
- ✅ Video/audio preview
- ✅ Navigation arrows
- ✅ Download button
- ✅ Metadata sidebar
- ✅ Infected file warning

---

### FileCard
**Path**: `features/files/components/file-card.tsx`

**Purpose**: File card untuk grid/list views

**Props**:
```typescript
{
  file: FileItem
  view?: 'grid' | 'list'
  selected?: boolean
  onPreview?: (file: FileItem) => void
  onDownload?: (file: FileItem) => void
  onDelete?: (file: FileItem) => void
}
```

**Features**:
- ✅ Grid view dengan thumbnail
- ✅ List view dengan inline actions
- ✅ File type icons
- ✅ Status badges
- ✅ Hover overlay (grid view)

---

## 🔍 Search Components

### GlobalSearchDialog
**Path**: `features/search/components/global-search-dialog.tsx`

**Purpose**: Command palette dengan Cmd/Ctrl+K

**Props**:
```typescript
{
  isOpen: boolean
  onClose: () => void
}
```

**Features**:
- ✅ Keyboard shortcut (Cmd/Ctrl+K)
- ✅ Debounced search (300ms)
- ✅ 5 tabbed results
- ✅ Result counts per tab
- ✅ Keyboard navigation
- ✅ Empty & error states

**Usage**:
```tsx
const [searchOpen, setSearchOpen] = useState(false)

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

<GlobalSearchDialog 
  isOpen={searchOpen} 
  onClose={() => setSearchOpen(false)} 
/>
```

---

### SearchResultsList
**Path**: `features/search/components/search-results-list.tsx`

**Purpose**: Display search results dengan highlighting

**Props**:
```typescript
{
  results: SearchResult[]
  query: string
  onResultClick: (result: SearchResult) => void
}
```

**Features**:
- ✅ Text highlighting dengan regex
- ✅ Type-specific rendering (4 types)
- ✅ Click to navigate

---

### SearchFilters
**Path**: `features/search/components/search-filters.tsx`

**Purpose**: Advanced search filters

**Props**:
```typescript
{
  filters: {
    dateFrom?: string
    dateTo?: string
    fileType?: string
    userId?: string
  }
  onFiltersChange: (filters: any) => void
  resultType?: string
}
```

**Features**:
- ✅ Date range picker
- ✅ File type filter
- ✅ Active filter chips
- ✅ Clear all button

---

## 🔔 Notifications Components

### NotificationBell
**Path**: `features/notifications/components/notification-bell.tsx`

**Purpose**: Bell icon dengan unread badge & popover

**Props**: None (self-contained)

**Features**:
- ✅ Unread count badge (shows "9+" if >9)
- ✅ Popover dengan notification list
- ✅ Mark all as read button
- ✅ Real-time updates

**Usage**:
```tsx
// In TopHeader
<NotificationBell />
```

---

### NotificationList
**Path**: `features/notifications/components/notification-list.tsx`

**Purpose**: Scrollable notification list

**Props**:
```typescript
{
  notifications: Notification[]
  onLoadMore?: () => void
  hasMore?: boolean
  onClose?: () => void
}
```

**Features**:
- ✅ Infinite scroll
- ✅ Empty state
- ✅ Loading indicator

---

### NotificationItem
**Path**: `features/notifications/components/notification-item.tsx`

**Purpose**: Individual notification

**Props**:
```typescript
{
  notification: Notification
  onClose?: () => void
}
```

**Features**:
- ✅ Type-specific icons (6 types)
- ✅ Type-specific colors
- ✅ Unread indicator (blue dot)
- ✅ Click to navigate + mark as read
- ✅ Relative timestamp

---

### NotificationSettingsPage
**Path**: `features/notifications/components/notification-settings-page.tsx`

**Purpose**: Full notification settings page

**Props**: None (self-contained)

**Features**:
- ✅ Master toggles (enable, sound, desktop)
- ✅ Do Not Disturb schedule
- ✅ Per-channel settings
- ✅ Auto-save dengan optimistic updates

**Usage**:
```tsx
// In settings page
<NotificationSettingsPage />
```

---

### WebPushSubscription
**Path**: `features/notifications/components/web-push-subscription.tsx`

**Purpose**: Web Push subscription flow UI

**Props**:
```typescript
{
  onSubscribe?: (subscription: PushSubscription) => Promise<void>
  onUnsubscribe?: () => Promise<void>
}
```

**Features**:
- ✅ Permission status display
- ✅ Subscription status
- ✅ Subscribe/unsubscribe buttons
- ✅ Test notification button
- ✅ Browser support detection
- ✅ VAPID integration

---

## 🏢 Directory Components

### DirectoryDragTree
**Path**: `features/directory/components/directory-drag-tree.tsx`

**Purpose**: Drag-and-drop org tree untuk move users

**Props**:
```typescript
{
  orgTree: OrgUnit[]
  onUserMoved?: (userId: string, newUnitId: string) => void
}
```

**Features**:
- ✅ Drag user to new unit
- ✅ Visual drop feedback
- ✅ Optimistic updates
- ✅ Expand/collapse units
- ✅ Member count badges
- ✅ Presence indicators
- ✅ Division/team icons

**Usage**:
```tsx
<DirectoryDragTree
  orgTree={orgTree}
  onUserMoved={(userId, unitId) => {
    console.log('User moved')
  }}
/>
```

---

## 🛠️ Utility Hooks

### use-debounce
**Path**: `lib/hooks/use-debounce.ts`

**Purpose**: Debounce a value dengan delay

**Usage**:
```typescript
const debouncedQuery = useDebounce(query, 300)

// Use debouncedQuery in API call
useSearch({ query: debouncedQuery })
```

**Parameters**:
- `value: T` - Value to debounce
- `delay: number` - Delay in milliseconds (default: 300)

**Returns**: Debounced value

---

## 🎨 Component Patterns

### Optimistic UI Pattern
```typescript
// 1. Update local state immediately
setLocalState(newValue)

// 2. Make API call
mutate(newValue, {
  onError: () => {
    // 3. Rollback on error
    setLocalState(previousValue)
    toast.error('Failed')
  },
  onSuccess: () => {
    toast.success('Success!')
  }
})
```

### Infinite Scroll Pattern
```typescript
useEffect(() => {
  const container = scrollRef.current
  if (!container) return

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    
    if (isNearBottom && hasMore && !isLoading) {
      onLoadMore()
    }
  }

  container.addEventListener('scroll', handleScroll)
  return () => container.removeEventListener('scroll', handleScroll)
}, [hasMore, isLoading, onLoadMore])
```

### Real-time Sync Pattern
```typescript
// Listen to Socket.IO events
useDomainEvents({
  eventType: 'entity:updated',
  enabled: true,
  onEvent: (event) => {
    // Update TanStack Query cache
    queryClient.setQueryData(queryKey, (oldData) => {
      return reconcile(oldData, event.patch)
    })
  }
})
```

---

## 📦 Installation

```bash
# Required dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns nanoid sonner react-dropzone

# Optional (for PDF preview)
npm install react-pdf pdfjs-dist
```

---

## 🚀 Quick Start

1. **Import component**
```typescript
import { OptimisticMessageList } from '@/features/chat/components/optimistic-message-list'
```

2. **Use in your page**
```typescript
<OptimisticMessageList
  chatId={chatId}
  messages={messages}
  currentUserId={userId}
  onSendMessage={handleSend}
/>
```

3. **Done!** Component is fully functional

---

## 📚 Related Documentation

- **Full Implementation Guide**: `FINAL_IMPLEMENTATION_SUMMARY.md`
- **Quick Start**: `QUICK_START_IMPLEMENTATION.md`
- **Session Summary**: `SESSION_COMPLETE_5_NOV_2025.md`
- **Type Definitions**: `types/index.ts`
- **API Specs**: `/docs/frontend/*.md`

---

**Last Updated**: 5 November 2025, 12:10 PM  
**Total Components**: 23  
**Status**: Production Ready
