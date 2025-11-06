'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSendMessage } from '@/lib/api/hooks/use-chats'
import { useQueryClient } from '@tanstack/react-query'

interface ThreadComposeProps {
  chatId: string
  threadId: string
}

export function ThreadCompose({ chatId, threadId }: ThreadComposeProps) {
  const { mutateAsync: sendMessage, isPending } = useSendMessage(chatId)
  const qc = useQueryClient()
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const content = message.trim()
    if (!content) return
    await sendMessage({ content, threadId })
    setMessage('')
    textareaRef.current?.focus()
    qc.invalidateQueries({ queryKey: ['thread-messages', chatId, threadId] })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="border-t bg-card p-3">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Write a reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[48px] resize-none"
          rows={2}
        />
        <Button onClick={handleSend} disabled={!message.trim() || isPending}>
          Reply
        </Button>
      </div>
    </div>
  )
}
