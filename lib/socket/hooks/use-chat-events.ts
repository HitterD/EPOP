'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../client'
import { SOCKET_EVENTS } from '@/lib/constants'
import { ChatMessageEvent, Message, TypingState } from '@/types'
import { useDomainEvents } from './use-domain-events'

/**
 * Hook to handle chat message events and update cache
 */
export function useChatMessageEvents(chatId: string, enabled = true) {
  const queryClient = useQueryClient()

  // Listen to message created events
  useDomainEvents({
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_CREATED,
    enabled,
    onEvent: useCallback(
      (event: any) => {
        const messageEvent = event as ChatMessageEvent
        if (messageEvent.chatId === chatId) {
          // Add new message to infinite query cache
          queryClient.setQueryData(['chat-messages', chatId], (oldData: any) => {
            if (!oldData) return oldData

            const firstPage = oldData.pages[0]
            const newMessage = messageEvent.patch as Message

            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  items: [newMessage, ...firstPage.items],
                },
                ...oldData.pages.slice(1),
              ],
            }
          })

          // Update chat list with last message
          queryClient.setQueryData(['chats'], (oldData: any) => {
            if (!oldData || !Array.isArray(oldData)) return oldData
            return oldData.map((chat: any) =>
              chat.id === chatId ? { ...chat, lastMessage: messageEvent.patch } : chat
            )
          })
        }
      },
      [chatId, queryClient]
    ),
  })

  // Listen to message updated events
  useDomainEvents({
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_UPDATED,
    enabled,
    onEvent: useCallback(
      (event: any) => {
        const messageEvent = event as ChatMessageEvent
        if (messageEvent.chatId === chatId) {
          queryClient.setQueryData(['chat-messages', chatId], (oldData: any) => {
            if (!oldData) return oldData

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.map((msg: Message) =>
                  msg.id === messageEvent.messageId ? { ...msg, ...messageEvent.patch } : msg
                ),
              })),
            }
          })
        }
      },
      [chatId, queryClient]
    ),
  })

  // Listen to message deleted events
  useDomainEvents({
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_DELETED,
    enabled,
    onEvent: useCallback(
      (event: any) => {
        const messageEvent = event as ChatMessageEvent
        if (messageEvent.chatId === chatId) {
          queryClient.setQueryData(['chat-messages', chatId], (oldData: any) => {
            if (!oldData) return oldData

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.filter((msg: Message) => msg.id !== messageEvent.messageId),
              })),
            }
          })
        }
      },
      [chatId, queryClient]
    ),
  })

  // Listen to reaction events
  useDomainEvents({
    eventType: SOCKET_EVENTS.CHAT_REACTION_ADDED,
    enabled,
    onEvent: useCallback(
      (event: any) => {
        const messageEvent = event as ChatMessageEvent
        if (messageEvent.chatId === chatId) {
          queryClient.setQueryData(['chat-messages', chatId], (oldData: any) => {
            if (!oldData) return oldData

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.map((msg: Message) =>
                  msg.id === messageEvent.messageId
                    ? { ...msg, reactionsSummary: messageEvent.patch?.reactionsSummary }
                    : msg
                ),
              })),
            }
          })
        }
      },
      [chatId, queryClient]
    ),
  })
}

/**
 * Hook to handle typing indicators with debouncing
 */
export function useTypingIndicator(chatId: string, userId: string, userName: string) {
  const socket = getSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const isTypingRef = useRef(false)

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      socket.emit(SOCKET_EVENTS.CHAT_TYPING_START, {
        chatId,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      })
      isTypingRef.current = true
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [chatId, userId, userName, socket])

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      socket.emit(SOCKET_EVENTS.CHAT_TYPING_STOP, {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      })
      isTypingRef.current = false
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [chatId, userId, socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTyping()
    }
  }, [stopTyping])

  return { startTyping, stopTyping }
}

/**
 * Hook to listen to typing events from other users
 */
export function useTypingListener(chatId: string, currentUserId: string) {
  const socket = getSocket()
  const [typingUsers, setTypingUsers] = useState<TypingState[]>([])

  useEffect(() => {
    const handleTypingStart = (event: { chatId: string; userId: string; userName: string }) => {
      if (event.chatId === chatId && event.userId !== currentUserId) {
        setTypingUsers((old) => {
          const exists = old.some((t) => t.userId === event.userId)
          if (exists) return old
          return [
            ...old,
            {
              chatId: event.chatId,
              userId: event.userId,
              userName: event.userName,
              timestamp: new Date().toISOString(),
            },
          ]
        })
      }
    }

    const handleTypingStop = (event: { chatId: string; userId: string }) => {
      if (event.chatId === chatId) {
        setTypingUsers((old) => old.filter((t) => t.userId !== event.userId))
      }
    }

    socket.on(SOCKET_EVENTS.CHAT_TYPING_START, handleTypingStart)
    socket.on(SOCKET_EVENTS.CHAT_TYPING_STOP, handleTypingStop)

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_TYPING_START, handleTypingStart)
      socket.off(SOCKET_EVENTS.CHAT_TYPING_STOP, handleTypingStop)
    }
  }, [chatId, currentUserId, socket])

  return typingUsers
}
