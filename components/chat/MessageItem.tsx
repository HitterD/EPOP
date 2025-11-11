import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Reply,
  Smile,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  AlertCircle,
  Loader2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/chat/format';
import { getMessageLabel, getReadReceiptLabel } from '@/lib/chat/a11y';
import type { Message } from '@/types/chat';

export interface MessageItemProps {
  message: Message;
  isMine: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageItem({
  message,
  isMine,
  onReply,
  onReact,
  onEdit,
  onDelete,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);

  const statusIcon = {
    sending: <Loader2 className="h-3 w-3 animate-spin" />,
    sent: <Check className="h-3 w-3" />,
    failed: <AlertCircle className="h-3 w-3 text-destructive" />,
  }[message.status];

  const readIcon = message.readBy.length > 0 && (
    <CheckCheck className="h-3 w-3 text-primary" />
  );

  return (
    <div
      role="article"
      aria-label={getMessageLabel(
        message.author.name,
        message.timestamp,
        message.content
      )}
      className={cn(
        'group flex gap-3 px-4 py-2 hover:bg-accent/30 transition-colors',
        isMine && 'flex-row-reverse',
        message.status === 'failed' && 'border-l-2 border-destructive'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.author.avatarUrl} alt={message.author.name} />
        <AvatarFallback>{message.author.name[0]}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn('flex-1 min-w-0', isMine && 'flex flex-col items-end')}>
        {/* Header */}
        <div
          className={cn(
            'flex items-baseline gap-2 mb-1',
            isMine && 'flex-row-reverse'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{message.author.name}</span>
            {message.author.extension && (
              <Badge variant="outline" className="text-xs font-mono">
                {message.author.extension}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {formatRelativeTime(message.timestamp)}
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </span>
        </div>

        {/* Message content */}
        <div
          className={cn(
            'inline-block max-w-prose rounded-lg px-3 py-2',
            isMine
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            message.status === 'sending' && 'opacity-60',
            message.isDeleted && 'line-through opacity-60'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded border',
                    isMine ? 'border-primary-foreground/20' : 'border-border'
                  )}
                >
                  <Copy className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs opacity-70">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div
            role="group"
            aria-label="Reactions"
            className="flex flex-wrap gap-1 mt-1"
          >
            {message.reactions.map((reaction) => {
              const reacted = reaction.users.some((u) => u.id === 'current-user-id');
              return (
                <Button
                  key={reaction.emoji}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 px-2 text-xs gap-1',
                    reacted && 'bg-primary/10 border-primary'
                  )}
                  onClick={() => onReact(reaction.emoji)}
                  aria-label={`${reaction.emoji} reaction, ${reaction.count} ${reaction.count === 1 ? 'person' : 'people'}`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Read receipts (for own messages) */}
        {isMine && message.readBy.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex -space-x-2">
              {message.readBy.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-4 w-4 border border-background">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-[8px]">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span
              className="text-xs text-muted-foreground"
              aria-label={getReadReceiptLabel(message.readBy)}
              title={getReadReceiptLabel(message.readBy)}
            >
              Read by {message.readBy.length}
            </span>
          </div>
        )}

        {/* Status indicator */}
        {isMine && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {statusIcon}
            {message.status === 'failed' && (
              <span className="text-destructive">Failed to send</span>
            )}
            {readIcon}
          </div>
        )}

        {/* Actions (visible on hover or focus) */}
        {(showActions || message.status === 'failed') && (
          <div
            className={cn(
              'flex items-center gap-1 mt-2',
              isMine && 'justify-end'
            )}
          >
            {!isMine && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={onReply}
                  aria-label="Reply to message"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onReact('👍')}
                  aria-label="React to message"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </>
            )}

            {message.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => {}}
              >
                Retry
              </Button>
            )}

            {isMine && onEdit && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    aria-label="Message actions"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
