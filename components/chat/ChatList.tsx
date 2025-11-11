import React, { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { ChatListItem } from './ChatListItem';
import { cn } from '@/lib/utils';
import type { ChatListProps } from '@/types/chat';

export function ChatList({
  conversations,
  selectedId,
  onSelect,
  filter = 'all',
  loading = false,
  error,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Apply search filter
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply category filter
    if (filter === 'unread' && conv.unreadCount === 0) {
      return false;
    }
    if (filter === 'mentions') {
      // This would need additional data to check for @mentions
      return true;
    }

    return true;
  });

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = conversations.findIndex((c) => c.id === selectedId);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < conversations.length - 1) {
            onSelect(conversations[currentIndex + 1].id);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            onSelect(conversations[currentIndex - 1].id);
          }
          break;
        case 'Enter':
          if (selectedId) {
            e.preventDefault();
            // Open conversation (handled by parent)
          }
          break;
      }
    },
    [conversations, selectedId, onSelect]
  );

  // Loading state
  if (loading) {
    return (
      <div className="h-full p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <MessageSquarePlus className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start chatting with your team!
        </p>
        <Button size="sm">Start a chat</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search header */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-3 py-2 border-b">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {}}
          aria-pressed={filter === 'all'}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {}}
          aria-pressed={filter === 'unread'}
        >
          Unread
          {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
            <span className="ml-1.5 text-xs">
              ({conversations.filter((c) => c.unreadCount > 0).length})
            </span>
          )}
        </Button>
        <Button
          variant={filter === 'mentions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {}}
          aria-pressed={filter === 'mentions'}
        >
          Mentions
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div
          role="list"
          aria-label="Conversations"
          className="py-1"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No conversations match your search
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ChatListItem
                key={conversation.id}
                conversation={conversation}
                selected={conversation.id === selectedId}
                onClick={() => onSelect(conversation.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
