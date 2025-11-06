'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import { MessageBubbleEnhanced } from './message-bubble-enhanced'
import { useAuthStore } from '@/lib/stores/auth-store'
import { format, isSameDay } from 'date-fns'

interface MessageStreamProps {
  messages: Message[]
  chatId: string
  onOpenThread?: (message: Message) => void
}

export function MessageStream({ messages, chatId, onOpenThread }: MessageStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const me = useAuthStore((s) => s.session?.user)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center">
          <div>
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the conversation by sending a message
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {isSameDay(new Date(date), new Date())
                    ? 'Today'
                    : format(new Date(date), 'MMMM d, yyyy')}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {msgs.map((message, index) => {
                  const prevMessage = msgs[index - 1]
                  const showAvatar =
                    !prevMessage || prevMessage.senderId !== message.senderId

                  return (
                    <MessageBubbleEnhanced
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === me?.id}
                      showAvatar={showAvatar}
                      onReply={() => onOpenThread?.(message)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
