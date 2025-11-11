import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { User, BulkImportResult } from '@/types'
import { withIdempotencyKey } from '../utils'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get<User[]>('/admin/users')
      if (!res.success || !res.data) throw new Error('Failed to fetch users')
      return res.data
    },
  })
}

export function useCreateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<User> & { email: string; name: string }) => {
      const res = await apiClient.post<User>('/admin/users', data, withIdempotencyKey())
      if (!res.success || !res.data) throw new Error('Failed to create user')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useUpdateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const res = await apiClient.patch<User>(`/admin/users/${userId}`, updates, withIdempotencyKey())
      if (!res.success || !res.data) throw new Error('Failed to update user')
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiClient.delete(`/admin/users/${userId}`)
      if (!res.success) throw new Error('Failed to delete user')
      return true
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useImportAdminUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { rows?: Array<Record<string, string>>; csvText?: string; dryRun?: boolean }) => {
      const headers: Record<string, string> = {}
      let body: BodyInit
      if (payload.csvText) {
        headers['Content-Type'] = 'text/csv'
        body = payload.csvText
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify({ rows: payload.rows ?? [] })
      }
      const res = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: {
          ...headers,
          ...(payload.dryRun ? { 'x-dry-run': 'true' } : {}),
        },
        body,
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json?.success) throw new Error('Import failed')
      return json.data as BulkImportResult
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
