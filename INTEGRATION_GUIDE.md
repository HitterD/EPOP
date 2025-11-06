# 🔌 Integration Guide - EPOP Components

**Quick reference untuk mengintegrasikan components ke existing pages**

---

## 📋 Table of Contents

1. [Chat Integration](#1-chat-integration)
2. [Projects Integration](#2-projects-integration)
3. [Files Integration](#3-files-integration)
4. [Search Integration](#4-search-integration)
5. [Notifications Integration](#5-notifications-integration)
6. [Directory Integration](#6-directory-integration)
7. [Global Setup](#7-global-setup)

---

## 1. Chat Integration

### Update: `app/(shell)/chat/[chatId]/page.tsx`

```tsx
'use client'

import { OptimisticMessageList } from '@/features/chat/components/optimistic-message-list'
import { useChatMessages, useSendMessage } from '@/lib/api/hooks/use-chat'
import { useAuth } from '@/lib/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { user } = useAuth()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = 
    useChatMessages(params.chatId, 20)
  const { mutateAsync: sendMessage } = useSendMessage(params.chatId)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-2/3 self-end" />
        <Skeleton className="h-16 w-3/4" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading messages: {error.message}</p>
      </div>
    )
  }

  const messages = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className="flex flex-col h-full">
      <OptimisticMessageList
        chatId={params.chatId}
        messages={messages}
        currentUserId={user.id}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onSendMessage={async (content, tempId) => {
          await sendMessage({
            id: tempId,
            content,
            type: 'text',
          })
        }}
      />
    </div>
  )
}
```

### Create Hook: `lib/api/hooks/use-chat.ts` (if not exists)

```tsx
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Message, CursorPaginatedResponse } from '@/types'

export function useChatMessages(chatId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: ['chats', chatId, 'messages'],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<CursorPaginatedResponse<Message>>(
        `/chats/${chatId}/messages`,
        {
          params: {
            limit,
            cursor: pageParam,
          },
        }
      )
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string; content: string; type: string }) => {
      const response = await apiClient.post(`/chats/${chatId}/messages`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', chatId, 'messages'] })
    },
  })
}
```

---

## 2. Projects Integration

### Update: `app/(shell)/projects/[projectId]/page.tsx`

```tsx
import { ProjectBoardPage } from '@/features/projects/components/project-board-page'

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return <ProjectBoardPage projectId={params.projectId} />
}
```

**That's it!** ProjectBoardPage adalah self-contained component yang handle semua data fetching dan state management.

### Optional: Custom Integration

Jika ingin custom implementation:

```tsx
'use client'

import { BoardView } from '@/features/projects/components/board-view'
import { useProject } from '@/lib/api/hooks/use-projects'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { data: project, isLoading, error } = useProject(params.projectId)

  if (isLoading) {
    return <Skeleton className="h-full w-full" />
  }

  if (error || !project) {
    return <div>Error loading project</div>
  }

  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <BoardView
        projectId={project.id}
        buckets={project.buckets}
        tasks={project.buckets.flatMap((b) => b.tasks)}
      />
    </div>
  )
}
```

---

## 3. Files Integration

### A. File Upload in Chat

Update: `app/(shell)/chat/[chatId]/page.tsx` (add file upload)

```tsx
import { FileUploadZone } from '@/features/files/components/file-upload-zone'
import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  
  // ... existing code ...

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <OptimisticMessageList {...props} />

      {/* Compose area with attachment button */}
      <div className="border-t p-4 flex items-center gap-2">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <FileUploadZone
              contextType="chat"
              contextId={params.chatId}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
              onUploadComplete={(fileIds) => {
                console.log('Files uploaded:', fileIds)
                setUploadDialogOpen(false)
                // Optionally send as message
              }}
            />
          </DialogContent>
        </Dialog>
        
        {/* Message input */}
        <input type="text" className="flex-1" placeholder="Type a message..." />
      </div>
    </div>
  )
}
```

### B. Files Page

Create: `app/(shell)/files/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { FileUploadZone } from '@/features/files/components/file-upload-zone'
import { FileCard } from '@/features/files/components/file-card'
import { FilePreviewModal } from '@/features/files/components/file-preview-modal'
import { useFiles } from '@/lib/api/hooks/use-files'
import { FileItem } from '@/types'
import { Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FilesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const { data: files, isLoading } = useFiles()

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Files</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <Grid size={20} />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List size={20} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-4 gap-4'
                : 'space-y-2'
            }
          >
            {files?.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                view={view}
                onPreview={setPreviewFile}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <FileUploadZone
            onUploadComplete={(fileIds) => {
              console.log('Uploaded:', fileIds)
            }}
          />
        </TabsContent>
      </Tabs>

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        files={files || []}
        onNavigate={(direction) => {
          if (!files || !previewFile) return
          const currentIndex = files.findIndex((f) => f.id === previewFile.id)
          const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
          if (newIndex >= 0 && newIndex < files.length) {
            setPreviewFile(files[newIndex])
          }
        }}
      />
    </div>
  )
}
```

---

## 4. Search Integration

### Update: `components/shell/top-header.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { GlobalSearchDialog } from '@/features/search/components/global-search-dialog'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function TopHeader() {
  const [searchOpen, setSearchOpen] = useState(false)

  // Global keyboard shortcut
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

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">EPOP</h1>
        
        {/* Search button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchOpen(true)}
          className="gap-2"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Other header items (notifications, profile, etc.) */}
      <div className="flex items-center gap-2">
        {/* Add NotificationBell here */}
      </div>

      {/* Search dialog */}
      <GlobalSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  )
}
```

---

## 5. Notifications Integration

### Update: `components/shell/top-header.tsx`

```tsx
import { NotificationBell } from '@/features/notifications/components/notification-bell'

export function TopHeader() {
  // ... existing code ...

  return (
    <header>
      {/* ... existing code ... */}
      
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <NotificationBell />
        
        {/* Profile dropdown, etc. */}
      </div>
    </header>
  )
}
```

### Settings Page

Create: `app/(shell)/settings/notifications/page.tsx`

```tsx
import { NotificationSettingsPage } from '@/features/notifications/components/notification-settings-page'

export default function NotificationSettingsRoute() {
  return <NotificationSettingsPage />
}
```

### Web Push Setup Page

Create: `app/(shell)/settings/web-push/page.tsx`

```tsx
'use client'

import { WebPushSubscription } from '@/features/notifications/components/web-push-subscription'
import { apiClient } from '@/lib/api/client'

export default function WebPushSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Web Push Notifications</h1>
      
      <WebPushSubscription
        onSubscribe={async (subscription) => {
          await apiClient.post('/notifications/web-push/subscribe', {
            subscription: subscription.toJSON(),
          })
        }}
        onUnsubscribe={async () => {
          await apiClient.post('/notifications/web-push/unsubscribe')
        }}
      />
    </div>
  )
}
```

---

## 6. Directory Integration

### Update: `app/(shell)/directory/page.tsx`

```tsx
'use client'

import { DirectoryDragTree } from '@/features/directory/components/directory-drag-tree'
import { useOrgTree } from '@/lib/api/hooks/use-directory'
import { Skeleton } from '@/components/ui/skeleton'

export default function DirectoryPage() {
  const { data: orgTree, isLoading, error } = useOrgTree()

  if (isLoading) {
    return (
      <div className="p-6 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error || !orgTree) {
    return <div className="p-6">Error loading directory</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organization Directory</h1>
      <DirectoryDragTree
        orgTree={orgTree}
        onUserMoved={(userId, unitId) => {
          console.log(`User ${userId} moved to unit ${unitId}`)
        }}
      />
    </div>
  )
}
```

---

## 7. Global Setup

### A. Register Service Worker

Update: `app/layout.tsx`

```tsx
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for Web Push
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### B. Socket.IO Setup

Create: `lib/socket.ts` (if not exists)

```tsx
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected')
    })

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected')
    })

    socket.on('error', (error) => {
      console.error('[Socket.IO] Error:', error)
    })
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
```

### C. Real-time Event Listeners

Create: `lib/hooks/use-domain-events.ts`

```tsx
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'
import { DomainEvent } from '@/types'

interface UseDomainEventsOptions<T = any> {
  eventType: string
  enabled?: boolean
  onEvent?: (event: DomainEvent<T>) => void
}

export function useDomainEvents<T = any>({
  eventType,
  enabled = true,
  onEvent,
}: UseDomainEventsOptions<T>) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const socket = getSocket()

    const handler = (event: DomainEvent<T>) => {
      console.log(`[Domain Event] ${eventType}:`, event)
      
      // Call custom handler if provided
      if (onEvent) {
        onEvent(event)
      }

      // Invalidate related queries
      if (event.ids && event.ids.length > 0) {
        event.ids.forEach((id) => {
          // Invalidate all queries that might contain this entity
          queryClient.invalidateQueries({ queryKey: [id] })
        })
      }
    }

    socket.on(eventType, handler)

    return () => {
      socket.off(eventType, handler)
    }
  }, [eventType, enabled, onEvent, queryClient])
}
```

### Usage in Components:

```tsx
// In OptimisticMessageList
useDomainEvents({
  eventType: 'chat:message_created',
  enabled: true,
  onEvent: (event) => {
    queryClient.setQueryData(['chats', chatId, 'messages'], (oldData) => {
      // Reconcile with optimistic update
      return reconcileMessages(oldData, event)
    })
  },
})
```

---

## 8. Quick Checklist

### Before Integration:
- [ ] Dependencies installed (`npm install react-dropzone`)
- [ ] Service worker created (`public/service-worker.js`)
- [ ] Environment variables set (`.env.local`)
- [ ] Avatar wrapper exported from ui components
- [ ] API hooks created for data fetching

### After Integration:
- [ ] Components render without errors
- [ ] Data fetching works correctly
- [ ] Real-time updates working
- [ ] Error states display properly
- [ ] Loading states show skeletons
- [ ] Empty states have CTAs
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 9. Troubleshooting

### Common Issues:

**1. "Cannot find module '@/components/ui/avatar'"**
- Use `@/components/ui/avatar-wrapper` instead

**2. "Service worker not registering"**
- Check that `public/service-worker.js` exists
- Ensure it's registered in layout.tsx
- Check browser console for errors

**3. "Socket.IO not connecting"**
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check backend is running
- Inspect network tab for WebSocket connection

**4. "TypeScript errors on Message/Task types"**
- Ensure `types/index.ts` is updated with new fields
- Restart TypeScript server (Cmd/Ctrl + Shift + P → "Restart TS Server")

---

## 10. Performance Tips

1. **Use React.memo for expensive components**
```tsx
export const TaskCard = React.memo(TaskCardDraggable)
```

2. **Virtual scrolling for long lists**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
```

3. **Debounce search inputs**
```tsx
const debouncedQuery = useDebounce(query, 300)
```

4. **Lazy load modals**
```tsx
const FilePreviewModal = lazy(() => import('./file-preview-modal'))
```

---

**Need More Help?**
- Check `COMPONENT_INDEX.md` for component props
- See `QUICK_START_IMPLEMENTATION.md` for setup
- Review `FINAL_IMPLEMENTATION_SUMMARY.md` for details

---

**Last Updated**: 5 November 2025  
**Status**: Ready for Integration
