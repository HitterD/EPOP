'use client'

import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import Link from 'next/link'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { Chat } from '@/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AvatarWithPresence } from '@/components/ui/presence-badge'
import { Search, Pin, BellOff } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualItem } from '@tanstack/react-virtual'

interface ChatListProps {
  chats: Chat[]
  activeChatId?: string
}

export function ChatList({ chats, activeChatId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = useMemo(
    () => chats.filter((chat) => chat.name?.toLowerCase().includes(searchQuery.toLowerCase())),
    [chats, searchQuery]
  )

  // Sort: pinned first, then by last message time
  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [filteredChats])

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: sortedChats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 8,
  })

  return (
    <div className="flex w-80 flex-col border-r bg-card" data-testid="chat-list">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="mb-3 text-lg font-semibold">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search chats..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list (virtualized) */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div
            className="relative p-2"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((vr: VirtualItem) => {
              const chat = sortedChats[vr.index]
              if (!chat) return null
              return (
                <div
                  key={vr.key}
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${vr.start}px)`, height: vr.size }}
                >
                  <Link href={`/chat/${chat.id}`} data-testid="chat-item">
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent',
                        activeChatId === chat.id && 'bg-accent'
                      )}
                    >
                      <AvatarWithPresence
                        {...(chat.avatar ? { src: chat.avatar } : {})}
                        alt={chat.name || 'Chat'}
                        fallback={getInitials(chat.name || 'Chat')}
                        status="available"
                        size="md"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chat.name}</span>
                            {chat.isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                            {chat.isMuted && <BellOff className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(chat.lastMessage.createdAt, 'relative')}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="truncate text-sm text-muted-foreground">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
