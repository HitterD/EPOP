import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PresenceBadge } from './PresenceBadge';
import { formatRelativeTime } from '@/lib/chat/format';
import type { Conversation } from '@/types/chat';

export interface ChatListItemProps {
  conversation: Conversation;
  selected?: boolean;
  onClick: () => void;
}

export function ChatListItem({
  conversation,
  selected = false,
  onClick,
}: ChatListItemProps) {
  const primaryParticipant = conversation.participants[0];
  const isTyping = conversation.typing.length > 0;
  const hasUnread = conversation.unreadCount > 0;

  const ariaLabel = hasUnread
    ? `Chat with ${conversation.name}, ${conversation.unreadCount} unread ${conversation.unreadCount === 1 ? 'message' : 'messages'}`
    : `Chat with ${conversation.name}`;

  return (
    <button
      role="listitem"
      aria-label={ariaLabel}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
        'hover:bg-accent/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        selected && 'bg-accent',
        hasUnread && 'bg-accent/20'
      )}
      onClick={onClick}
    >
      {/* Avatar with presence */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
        </Avatar>
        {primaryParticipant && (
          <PresenceBadge
            status={primaryParticipant.presence}
            size="md"
            showPulse={primaryParticipant.presence === 'online'}
            className="absolute -bottom-0.5 -right-0.5"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3
              className={cn(
                'text-sm truncate',
                hasUnread ? 'font-bold' : 'font-medium'
              )}
            >
              {conversation.name}
            </h3>
            {primaryParticipant?.extension && (
              <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                {primaryParticipant.extension}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatRelativeTime(conversation.timestamp)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {isTyping ? (
            <span className="text-sm text-muted-foreground italic flex-1 truncate">
              typing...
            </span>
          ) : (
            <p
              className={cn(
                'text-sm flex-1 truncate',
                hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {conversation.lastMessage}
            </p>
          )}

          {hasUnread && (
            <Badge
              className="ml-2 h-5 min-w-[20px] flex items-center justify-center bg-primary text-primary-foreground"
              aria-label={`${conversation.unreadCount} unread`}
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
