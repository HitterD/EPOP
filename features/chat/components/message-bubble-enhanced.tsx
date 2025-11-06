'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar-wrapper'
import { MessageSquare, MoreVertical, Smile, Check, CheckCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface MessageBubbleEnhancedProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  onReact?: (emoji: string) => void
  onReply?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function MessageBubbleEnhanced({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onReact,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleEnhancedProps) {
  const [showActions, setShowActions] = useState(false)

  // Extract URLs from message content
  const urls = message.content?.match(/(https?:\/\/[^\s]+)/g) || []

  // Determine read status
  const readByCount = message.readBy?.length || 0
  const isRead = readByCount > 0

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return timestamp
    }
  }

  // Delivery priority styling
  const priorityBorderClass = {
    normal: '',
    important: 'border-l-4 border-warning',
    urgent: 'border-l-4 border-error',
  }[message.deliveryPriority || 'normal']

  return (
    <div
      className={cn(
        'group flex gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <Avatar
          src={message.sender?.avatar}
          alt={message.sender?.name || 'User'}
          size="sm"
          fallback={message.sender?.name?.[0] || 'U'}
        />
      )}

      {/* Message content */}
      <div className={cn('flex flex-col gap-1 max-w-md', !showAvatar && (isOwn ? 'mr-10' : 'ml-10'))}>
        {/* Sender name (if not own message) */}
        {!isOwn && showAvatar && (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {message.sender?.name}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'relative px-4 py-2 rounded-lg break-words',
            isOwn
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none',
            priorityBorderClass,
            message.edited && 'border-b-2 border-gray-400/30'
          )}
        >
          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Edited indicator */}
          {message.edited && (
            <span className="text-xs opacity-70 ml-2 italic">(edited)</span>
          )}

          {/* Link previews */}
          {urls.length > 0 && (
            <div className="mt-2 space-y-2">
              {urls.slice(0, 2).map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'block text-xs underline',
                    isOwn ? 'text-white/90' : 'text-primary-500'
                  )}
                >
                  {url.length > 50 ? url.substring(0, 50) + '...' : url}
                </a>
              ))}
            </div>
          )}

          {/* Quick reaction buttons (on hover) */}
          {showActions && (
            <div className={cn(
              'absolute -top-3 flex gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg px-1 py-0.5 border border-gray-200 dark:border-gray-600',
              isOwn ? 'left-0' : 'right-0'
            )}>
              {['👍', '❤️', '😂', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className="hover:scale-125 transition-transform text-base w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => {/* Open full emoji picker */}}
                className="hover:scale-110 transition-transform w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Smile size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Reactions summary */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-1">
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
              >
                <span>{emoji}</span>
                <span className="text-gray-600 dark:text-gray-400">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom row: timestamp, read status, thread, actions */}
        <div className={cn(
          'flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          {/* Timestamp */}
          {showTimestamp && (
            <span>{formatRelativeTime(message.timestamp)}</span>
          )}

          {/* Read receipts (for own messages) */}
          {isOwn && (
            <div className="flex items-center gap-0.5" title={`Read by ${readByCount} ${readByCount === 1 ? 'person' : 'people'}`}>
              {isRead ? (
                <CheckCheck size={14} className="text-primary-500" />
              ) : (
                <Check size={14} className="text-gray-400" />
              )}
              {readByCount > 1 && (
                <span className="text-xs">{readByCount}</span>
              )}
            </div>
          )}

          {/* Thread indicator */}
          {message.threadCount !== undefined && message.threadCount > 0 && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-primary-500 hover:underline"
            >
              <MessageSquare size={14} />
              <span>
                {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}

          {/* More actions menu */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-5 w-5">
                  <MoreVertical size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="w-40">
                <DropdownMenuItem onClick={onReply} className="text-xs">
                  <MessageSquare size={12} className="mr-2" />
                  Reply in thread
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <Smile size={12} className="mr-2" />
                  Add reaction
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuItem onClick={onEdit} className="text-xs">
                      Edit message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-xs text-error">
                      Delete message
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem className="text-xs">
                  Copy text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Delivery priority badge */}
        {message.deliveryPriority && message.deliveryPriority !== 'normal' && (
          <Badge
            variant={message.deliveryPriority === 'urgent' ? 'destructive' : 'default'}
            className="w-fit text-[10px] px-1.5 py-0"
          >
            {message.deliveryPriority}
          </Badge>
        )}
      </div>
    </div>
  )
}
