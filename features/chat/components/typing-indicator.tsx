'use client'

import { useTypingListener } from '@/lib/socket/hooks/use-chat-events'
import { Avatar } from '@/components/ui/avatar'

interface TypingIndicatorProps {
  chatId: string
  currentUserId: string
}

export function TypingIndicator({ chatId, currentUserId }: TypingIndicatorProps) {
  const typingUsers = useTypingListener(chatId, currentUserId)

  if (typingUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
      {/* Show avatars of typing users */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar
            key={user.userId}
            alt={user.userName}
            size="xs"
            fallback={user.userName?.[0] ?? 'U'}
          />
        ))}
      </div>

      {/* Typing text */}
      <div className="flex items-center gap-1">
        <span>
          {(() => {
            const first = typingUsers[0]
            const second = typingUsers[1]
            if (typingUsers.length === 1) return `${first?.userName ?? 'Someone'} is typing`
            if (typingUsers.length === 2) return `${first?.userName ?? 'Someone'} and ${second?.userName ?? 'someone'} are typing`
            return `${first?.userName ?? 'Someone'} and ${typingUsers.length - 1} others are typing`
          })()}
        </span>

        {/* Animated dots */}
        <span className="flex gap-1">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
            .
          </span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
            .
          </span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
            .
          </span>
        </span>
      </div>
    </div>
  )
}
