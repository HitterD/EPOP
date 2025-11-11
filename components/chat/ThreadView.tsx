import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';
import { ReconnectBanner } from './ReconnectBanner';
import { announceNewMessage } from '@/lib/chat/a11y';
import type { ThreadViewProps } from '@/types/chat';

export function ThreadView({
  conversationId,
  messages,
  currentUserId,
  onReply,
  onReact,
  onLoadMore,
  hasMore = false,
  loading = false,
  error,
  connectionStatus,
}: ThreadViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousMessageCount = useRef(messages.length);

  // Auto-scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Announce new messages to screen readers
    if (messages.length > previousMessageCount.current) {
      const newMessageCount = messages.length - previousMessageCount.current;
      announceNewMessage(newMessageCount);
      
      if (!isAtBottom) {
        setUnreadCount((prev) => prev + newMessageCount);
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages, isAtBottom]);

  // Detect if user is at bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const threshold = 50;
    const atBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    
    if (atBottom) {
      setUnreadCount(0);
    }

    // Load more when scrolling to top
    if (element.scrollTop < 100 && hasMore && !loading && onLoadMore) {
      const previousScrollHeight = element.scrollHeight;
      
      onLoadMore();
      
      // Preserve scroll position after new messages load
      setTimeout(() => {
        const newScrollHeight = element.scrollHeight;
        element.scrollTop = newScrollHeight - previousScrollHeight;
      }, 100);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setUnreadCount(0);
    }
  };

  const handleSendMessage = (content: string, files?: File[]) => {
    // Send message logic
    console.log('Sending:', { content, files });
    
    // Optimistic update would happen here
    // The message would be added to the list with status: 'sending'
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  // Loading state
  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
        <MessageComposer onSend={handleSendMessage} disabled />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
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
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start the conversation!
            </p>
          </div>
        </div>
        <MessageComposer
          onSend={handleSendMessage}
          disabled={connectionStatus === 'disconnected'}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Reconnect banner */}
      {(connectionStatus === 'connecting' || connectionStatus === 'disconnected') && (
        <div className="flex-shrink-0">
          <ReconnectBanner
            status={connectionStatus}
            onRetry={() => console.log('Retry connection')}
            autoRetryIn={connectionStatus === 'disconnected' ? 5 : undefined}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea
        className="flex-1"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div
          role="feed"
          aria-label="Messages"
          className="min-h-full flex flex-col"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Load more indicator */}
          {loading && hasMore && (
            <div className="p-4 text-center">
              <Skeleton className="h-8 w-32 mx-auto" />
            </div>
          )}

          {/* Messages grouped by date */}
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-4 px-4 py-2">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground">{date}</span>
                <div className="flex-1 border-t" />
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isMine={message.author.id === currentUserId}
                  onReply={() => onReply(message.id, '')}
                  onReact={(emoji) => onReact(message.id, emoji)}
                  onEdit={
                    message.author.id === currentUserId
                      ? () => console.log('Edit:', message.id)
                      : undefined
                  }
                  onDelete={
                    message.author.id === currentUserId
                      ? () => console.log('Delete:', message.id)
                      : undefined
                  }
                />
              ))}
            </div>
          ))}

          {/* Typing indicator */}
          <TypingIndicator users={['Alice', 'Bob']} />

          {/* Spacer for auto-scroll */}
          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <div className="absolute bottom-20 right-4 z-10">
          <Button
            size="sm"
            className="rounded-full shadow-lg gap-2"
            onClick={scrollToBottom}
            aria-label={`Scroll to bottom${unreadCount > 0 ? `, ${unreadCount} new messages` : ''}`}
          >
            <ChevronDown className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Message composer */}
      <MessageComposer
        onSend={handleSendMessage}
        disabled={connectionStatus === 'disconnected'}
        mentionSuggestions={[
          { id: '1', name: 'Alice Chen', email: 'alice@epop.com', presence: 'online' },
          { id: '2', name: 'Bob Smith', email: 'bob@epop.com', presence: 'away' },
        ]}
      />
    </div>
  );
}
