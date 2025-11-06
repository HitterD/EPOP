'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/lib/stores/chat-store'
import { ChatList } from '@/features/chat/components/chat-list'
import { MessageSquare } from 'lucide-react'
import { useChats } from '@/lib/api/hooks/use-chats'

export default function ChatPage() {
  const chats = useChatStore((state) => Array.from(state.chats.values()))
  // Load chats on mount
  useChats()

  return (
    <div className="flex h-full">
      <ChatList chats={chats} />
      
      {/* Empty state */}
      <div className="flex flex-1 items-center justify-center bg-muted/20">
        <div className="text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a chat from the list to start messaging
          </p>
        </div>
      </div>
    </div>
  )
}
