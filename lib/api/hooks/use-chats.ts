import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { apiClient } from '../client'
import { Chat, Message, CursorPaginatedResponse, Thread, ReactionSummary } from '@/types'
import { useChatStore } from '@/lib/stores/chat-store'
import { toast } from 'sonner'
import { buildCursorQuery, withIdempotencyKey } from '../utils'
import { generateId } from '@/lib/utils'
import { queryPolicies } from '@/lib/config/query-policies'
import { queueRequest } from '@/lib/offline/outbox'
import { useAuthStore } from '@/lib/stores/auth-store'

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
      const query = buildCursorQuery({
        ...(pageParam ? { cursor: pageParam } : {}),
        ...(limit ? { limit } : {}),
      })
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
      // Ensure we carry a stable id so server will use it as well
      const tempId = data.id || generateId()
      const payload = { ...data, id: tempId }
      const idemp = withIdempotencyKey()
      const response = await apiClient.post<Message>(
        `/chats/${chatId}/messages`,
        payload,
        idemp
      )
      if (response.success && response.data) {
        return response.data
      }
      // Offline fallback: queue to outbox and return a local placeholder
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
      const isNetError = response.error?.code === 'NETWORK_ERROR'
      if (isOffline || isNetError) {
        const headers = {
          'Content-Type': 'application/json',
          ...(idemp.headers as Record<string, string>),
        }
        await queueRequest(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
        const userId = (useAuthStore.getState().session?.user?.id) || 'me'
        const now = new Date().toISOString()
        const localMsg: Message = {
          id: tempId,
          chatId,
          senderId: userId,
          content: payload.content,
          type: 'text',
          reactions: [],
          isEdited: false,
          isDeleted: false,
          readBy: [userId],
          deliveryPriority: payload.deliveryPriority || 'normal',
          timestamp: now,
          createdAt: now,
          updatedAt: now,
        }
        return localMsg
      }
      throw new Error(response.error?.message || 'Failed to send message')
    },
    onMutate: async (variables) => {
      // Optimistic insert placeholder at top of first page
      const tempId = variables.id || generateId()
      const userId = (useAuthStore.getState().session?.user?.id) || 'me'
      const now = new Date().toISOString()
      const placeholder: Message = {
        id: tempId,
        chatId,
        senderId: userId,
        content: variables.content,
        type: 'text',
        reactions: [],
        isEdited: false,
        isDeleted: false,
        readBy: [userId],
        deliveryPriority: variables.deliveryPriority || 'normal',
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      }
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) return oldData
          const first = oldData.pages[0]!
          const exists = (first.items || []).some((m) => m.id === tempId)
          if (exists) return oldData
          return {
            ...oldData,
            pages: [
              { ...first, items: [placeholder, ...(first.items ?? [])] },
              ...oldData.pages.slice(1),
            ],
          }
        },
      )
      // Also update thread messages if replying in a thread
      if (variables.threadId) {
        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
          ['thread-messages', chatId, variables.threadId],
          (oldData) => {
            if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) return oldData
            const first = oldData.pages[0]!
            const exists = (first.items || []).some((m) => m.id === tempId)
            if (exists) return oldData
            return {
              ...oldData,
              pages: [
                { ...first, items: [placeholder, ...(first.items ?? [])] },
                ...oldData.pages.slice(1),
              ],
            }
          },
        )
      }
      return { tempId }
    },
    onSuccess: (saved, variables) => {
      // Reconcile optimistic message tempId -> serverId
      if (saved && variables?.id) {
        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
          ['chat-messages', chatId],
          (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page): CursorPaginatedResponse<Message> => {
                const found = page.items?.some((m) => m.id === variables.id)
                if (!found) return page
                return {
                  ...page,
                  items: (page.items || []).map((m) => (m.id === variables.id ? saved : m)),
                }
              }),
            }
          },
        )
      }
      else if (saved) {
        // No optimistic placeholder found; prepend to first page
        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
          ['chat-messages', chatId],
          (oldData) => {
            if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) return oldData
            const first = oldData.pages[0]!
            const exists = (first.items || []).some((m) => m.id === saved.id)
            if (exists) return oldData
            return {
              ...oldData,
              pages: [
                { ...first, items: [saved, ...(first.items ?? [])] },
                ...oldData.pages.slice(1),
              ],
            }
          },
        )
      }
      // Reconcile/insert in thread messages as well if variables.threadId exists
      if (saved && variables?.threadId && variables?.id) {
        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
          ['thread-messages', chatId, variables.threadId],
          (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page): CursorPaginatedResponse<Message> => {
                const found = page.items?.some((m) => m.id === variables.id)
                if (!found) return page
                return {
                  ...page,
                  items: (page.items || []).map((m) => (m.id === variables.id ? saved : m)),
                }
              }),
            }
          },
        )
      } else if (saved && variables?.threadId) {
        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
          ['thread-messages', chatId, variables.threadId],
          (oldData) => {
            if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) return oldData
            const first = oldData.pages[0]!
            const exists = (first.items || []).some((m) => m.id === saved.id)
            if (exists) return oldData
            return {
              ...oldData,
              pages: [
                { ...first, items: [saved, ...(first.items ?? [])] },
                ...oldData.pages.slice(1),
              ],
            }
          },
        )
      }
      // Update chat list last message
      if (saved) {
        queryClient.setQueryData<Chat[] | undefined>(['chats'], (old) => {
          if (!old || !Array.isArray(old)) return old
          return old.map((c) => (c.id === chatId ? { ...c, lastMessage: saved } : c))
        })
      }
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
      const query = buildCursorQuery({
        ...(pageParam ? { cursor: pageParam } : {}),
        ...(limit ? { limit } : {}),
      })
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
    onSuccess: (_data, { messageId, emoji }) => {
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData
          const pages = oldData.pages.map((page): CursorPaginatedResponse<Message> => ({
            ...page,
            items: (page.items || []).map((m) => {
              if (m.id !== messageId) return m
              const summary: ReactionSummary[] = Array.isArray(m.reactionsSummary) ? [...m.reactionsSummary] : []
              const idx = summary.findIndex((r) => r.emoji === emoji)
              if (idx >= 0) {
                const r = summary[idx]!
                summary[idx] = { ...r, count: r.count + 1, hasCurrentUser: true }
              } else {
                summary.unshift({ emoji, count: 1, userIds: [], hasCurrentUser: true })
              }
              return { ...m, reactionsSummary: summary }
            }),
          }))
          return { ...oldData, pages }
        },
      )
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
    onSuccess: (_data, { messageId, emoji }) => {
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData
          const pages = oldData.pages.map((page): CursorPaginatedResponse<Message> => ({
            ...page,
            items: (page.items || []).map((m) => {
              if (m.id !== messageId) return m
              const summary: ReactionSummary[] = Array.isArray(m.reactionsSummary) ? [...m.reactionsSummary] : []
              const idx = summary.findIndex((r) => r.emoji === emoji)
              if (idx >= 0) {
                const r = summary[idx]!
                const newCount = Math.max(0, r.count - 1)
                summary[idx] = { ...r, count: newCount, hasCurrentUser: false }
              }
              return { ...m, reactionsSummary: summary.filter((r) => r.count > 0) }
            }),
          }))
          return { ...oldData, pages }
        },
      )
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
    onSuccess: (saved) => {
      if (!saved) return
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData
          const pages = oldData.pages.map((page): CursorPaginatedResponse<Message> => ({
            ...page,
            items: (page.items || []).map((m) => (m.id === saved.id ? { ...m, ...saved } : m)),
          }))
          return { ...oldData, pages }
        },
      )
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
    onSuccess: (_data, messageId) => {
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<Message>> | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData
          const pages = oldData.pages.map((page): CursorPaginatedResponse<Message> => ({
            ...page,
            items: (page.items || []).filter((m) => m.id !== messageId),
          }))
          return { ...oldData, pages }
        },
      )
    },
  })
}
