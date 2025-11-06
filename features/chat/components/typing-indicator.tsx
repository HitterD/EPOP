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
            fallback={user.userName[0]}
          />
        ))}
      </div>

      {/* Typing text */}
      <div className="flex items-center gap-1">
        <span>
          {typingUsers.length === 1
            ? `${typingUsers[0].userName} is typing`
            : typingUsers.length === 2
            ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`
            : `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing`}
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
