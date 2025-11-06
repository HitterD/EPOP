import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { Chat, Message, CursorPaginatedResponse, Thread } from '@/types'
import { useChatStore } from '@/lib/stores/chat-store'
import { toast } from 'sonner'
import { buildCursorQuery, withIdempotencyKey } from '../utils'
import { queryPolicies } from '@/lib/config/query-policies'

export function useChats() {
  const setChats = useChatStore((state) => state.setChats)

  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiClient.get<Chat[]>('/chats')
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch chats')
      }
      setChats(response.data)
      return response.data
    },
    ...queryPolicies.mediumFresh,
  })
}

export function useChatMessages(chatId: string, limit = 50) {
  return useInfiniteQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async ({ pageParam }) => {
      const query = buildCursorQuery({ cursor: pageParam, limit })
      const response = await apiClient.get<CursorPaginatedResponse<Message>>(
        `/chats/${chatId}/messages${query}`
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch messages')
      }
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!chatId,
    ...queryPolicies.realtime,
  })
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { 
      id?: string
      content: string
      deliveryPriority?: 'normal' | 'important' | 'urgent'
      threadId?: string
      attachments?: string[]
    }) => {
      // FE-5: Add Idempotency-Key header
      const response = await apiClient.post<Message>(
        `/chats/${chatId}/messages`,
        data,
        withIdempotencyKey()
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to send message')
      }
      return response.data
    },
    onSuccess: (saved, variables) => {
      // Reconcile optimistic message tempId -> serverId
      if (saved && variables?.id) {
        queryClient.setQueryData(['chat-messages', chatId], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page: any, idx: number) => {
              const found = page.items?.some((m: any) => m.id === variables.id)
              if (!found) return page
              return {
                ...page,
                items: page.items.map((m: any) => (m.id === variables.id ? saved : m)),
              }
            }),
          }
        })
      }
      // Also ensure a refresh for consistency
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Get thread messages (replies to a message)
 */
export function useThreadMessages(chatId: string, messageId: string, limit = 50) {
  return useInfiniteQuery({
    queryKey: ['thread-messages', chatId, messageId],
    queryFn: async ({ pageParam }) => {
      const query = buildCursorQuery({ cursor: pageParam, limit })
      const response = await apiClient.get<CursorPaginatedResponse<Message>>(
        `/chats/${chatId}/messages/${messageId}/thread${query}`
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch thread messages')
      }
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!chatId && !!messageId,
    ...queryPolicies.realtime,
  })
}

/**
 * Add reaction to message
 */
export function useAddReaction(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const response = await apiClient.post(
        `/chats/${chatId}/messages/${messageId}/reactions`,
        { emoji },
        withIdempotencyKey()
      )
      if (!response.success) {
        throw new Error('Failed to add reaction')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}

/**
 * Remove reaction from message
 */
export function useRemoveReaction(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const response = await apiClient.delete(
        `/chats/${chatId}/messages/${messageId}/reactions/${emoji}`
      )
      if (!response.success) {
        throw new Error('Failed to remove reaction')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}

/**
 * Mark message as read
 */
export function useMarkAsRead(chatId: string) {
  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiClient.post(
        `/chats/${chatId}/messages/${messageId}/read`,
        {},
        withIdempotencyKey()
      )
      if (!response.success) {
        throw new Error('Failed to mark as read')
      }
    },
  })
}

/**
 * Edit message
 */
export function useEditMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const response = await apiClient.patch<Message>(
        `/chats/${chatId}/messages/${messageId}`,
        { content },
        withIdempotencyKey()
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to edit message')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}

/**
 * Delete message
 */
export function useDeleteMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiClient.delete(`/chats/${chatId}/messages/${messageId}`)
      if (!response.success) {
        throw new Error('Failed to delete message')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}
