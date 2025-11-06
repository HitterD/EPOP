import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { MailMessage, CursorPaginatedResponse } from '@/types'
import { buildCursorQuery, withIdempotencyKey } from '../utils'

export function useMail(folder: 'received' | 'sent' | 'deleted', limit = 50) {
  return useInfiniteQuery({
    queryKey: ['mail', folder],
    queryFn: async ({ pageParam }) => {
      const query = buildCursorQuery({ cursor: pageParam, limit })
      const res = await apiClient.get<CursorPaginatedResponse<MailMessage>>(
        `/mail?folder=${folder}${query ? '&' + query.substring(1) : ''}`
      )
      if (!res.success || !res.data) throw new Error('Failed to fetch mail')
      return res.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  })
}

export function useSetMailRead(folder?: 'received' | 'sent' | 'deleted') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ messageId, isRead }: { messageId: string; isRead: boolean }) => {
      const res = await apiClient.patch<MailMessage>(`/mail/${messageId}`, { isRead }, withIdempotencyKey())
      if (!res.success || !res.data) throw new Error('Failed to update read state')
      return res.data
    },
    onMutate: async ({ messageId, isRead }) => {
      const listKey = folder ? ['mail', folder] : ['mail']
      const prevList = folder ? qc.getQueryData<MailMessage[]>(listKey) : undefined
      const prevDetail = qc.getQueryData<MailMessage>(['mail-message', messageId])

      if (folder && prevList) {
        qc.setQueryData<MailMessage[]>(listKey, prevList.map((m) => (m.id === messageId ? { ...m, isRead } : m)))
      }
      if (prevDetail) {
        qc.setQueryData<MailMessage>(['mail-message', messageId], { ...prevDetail, isRead })
      }

      return { prevList, prevDetail, listKey }
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return
      if (ctx.listKey && ctx.prevList) {
        qc.setQueryData(ctx.listKey, ctx.prevList)
      }
      if (ctx.prevDetail) {
        const id = (ctx.prevDetail as any).id
        qc.setQueryData(['mail-message', id], ctx.prevDetail)
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['mail'] })
      qc.invalidateQueries({ queryKey: ['mail-message', vars.messageId] })
    },
  })
}

type SendMailPayload = {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  attachments?: string[]
}

export function useSendMail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: SendMailPayload) => {
      const res = await apiClient.post<MailMessage>('/mail', data, withIdempotencyKey())
      if (!res.success || !res.data) throw new Error('Failed to send mail')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail', 'sent'] })
    },
  })
}

export function useMailMessage(messageId: string | undefined) {
  return useQuery({
    queryKey: ['mail-message', messageId],
    queryFn: async () => {
      const res = await apiClient.get<MailMessage>(`/mail/${messageId}`)
      if (!res.success || !res.data) throw new Error('Failed to fetch message')
      return res.data
    },
    enabled: !!messageId,
  })
}

export function useMoveMail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ messageId, folder }: { messageId: string; folder: 'received' | 'sent' | 'deleted' }) => {
      const res = await apiClient.patch<MailMessage>(
        `/mail/${messageId}/move`,
        { folder },
        withIdempotencyKey()
      )
      if (!res.success || !res.data) throw new Error('Failed to move message')
      return res.data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['mail', variables.folder] })
      qc.invalidateQueries({ queryKey: ['mail-message'] })
    },
  })
}

/**
 * Bulk move messages to folder
 */
export function useBulkMoveMail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      messageIds,
      folder,
    }: {
      messageIds: string[]
      folder: 'received' | 'sent' | 'deleted'
    }) => {
      const res = await apiClient.post(
        '/mail/bulk-move',
        { messageIds, folder },
        withIdempotencyKey()
      )
      if (!res.success) throw new Error('Failed to move messages')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail'] })
    },
  })
}

/**
 * Restore deleted messages
 */
export function useRestoreMail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      const res = await apiClient.post(
        '/mail/restore',
        { messageIds },
        withIdempotencyKey()
      )
      if (!res.success) throw new Error('Failed to restore messages')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail'] })
    },
  })
}

/**
 * Permanently delete messages
 */
export function usePermanentlyDeleteMail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      const res = await apiClient.post('/mail/permanent-delete', { messageIds }, withIdempotencyKey())
      if (!res.success) throw new Error('Failed to delete messages')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mail'] })
    },
  })
}
