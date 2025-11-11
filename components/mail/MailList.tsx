import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Paperclip, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/chat/format';
import type { MailListProps, MailMessage } from '@/types/mail';

export function MailList({
  messages,
  selectedIds,
  onSelect,
  onBulkAction,
  sortBy,
  loading,
  error,
}: MailListProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Vim-style keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j': // Next
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, messages.length - 1));
          break;
        case 'k': // Previous
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'x': // Select
          e.preventDefault();
          if (messages[focusedIndex]) {
            onSelect(messages[focusedIndex].id);
          }
          break;
        case 'r': // Reply
          e.preventDefault();
          if (messages[focusedIndex] && selectedIds.length === 0) {
            // Trigger reply action
          }
          break;
        case 'a': // Archive
          e.preventDefault();
          if (selectedIds.length > 0) {
            onBulkAction('archive', selectedIds);
          }
          break;
        case 'f': // Forward
          e.preventDefault();
          if (messages[focusedIndex] && selectedIds.length === 0) {
            // Trigger forward action
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, messages, selectedIds, onSelect, onBulkAction]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-destructive">Failed to load messages</p>
        <Button variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-8 text-muted-foreground">
        <p className="text-lg font-medium">No messages</p>
        <p className="text-sm">This folder is empty</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div role="list" aria-label="Email messages" className="divide-y">
        {messages.map((message, index) => (
          <div
            key={message.id}
            role="listitem"
            className={cn(
              'flex items-center gap-3 p-3 hover:bg-accent transition-colors cursor-pointer',
              selectedIds.includes(message.id) && 'bg-accent',
              index === focusedIndex && 'ring-2 ring-primary ring-inset',
              message.unread && 'font-semibold'
            )}
            onClick={() => onSelect(message.id, false)}
            aria-selected={selectedIds.includes(message.id)}
          >
            <Checkbox
              checked={selectedIds.includes(message.id)}
              onCheckedChange={() => onSelect(message.id, true)}
              aria-label={`Select message from ${message.from.name}`}
            />

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-5 w-5 p-0',
                message.starred && 'text-yellow-500'
              )}
              aria-label={message.starred ? 'Unstar message' : 'Star message'}
            >
              <Star className={cn('h-4 w-4', message.starred && 'fill-current')} />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('truncate', message.unread && 'font-bold')}>
                  {message.from.name}
                </span>
                {message.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    High
                  </Badge>
                )}
                {message.attachments.length > 0 && (
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className={cn('truncate text-sm', message.unread && 'font-semibold')}>
                  {message.subject}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  - {message.preview}
                </span>
              </div>
            </div>

            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatRelativeTime(message.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
