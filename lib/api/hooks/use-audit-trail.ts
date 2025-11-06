import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { AuditEvent, AuditFilters, CursorPaginatedResponse } from '@/types'
import { useEffect } from 'react'
import { getSocket } from '@/lib/socket/client'

interface UseAuditTrailOptions {
  contextType?: 'org_unit' | 'user' | 'global'
  contextId?: string
  filters?: AuditFilters
  enabled?: boolean
  limit?: number
}

export function useAuditTrail({
  contextType = 'global',
  contextId,
  filters,
  enabled = true,
  limit = 20,
}: UseAuditTrailOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['audit', contextType, contextId, filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      
      if (contextType) params.append('contextType', contextType)
      if (contextId) params.append('contextId', contextId)
      if (pageParam) params.append('cursor', pageParam)
      params.append('limit', limit.toString())
      
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.actionType) {
        const actions = Array.isArray(filters.actionType) ? filters.actionType : [filters.actionType]
        actions.forEach(action => params.append('actionType', action))
      }
      if (filters?.actorId) params.append('actorId', filters.actorId)
      if (filters?.targetId) params.append('targetId', filters.targetId)
      
      const response = await apiClient.get<CursorPaginatedResponse<AuditEvent>>(
        `/directory/audit?${params.toString()}`
      )
      return response.data!
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to listen for real-time audit events and invalidate query
 */
export function useAuditRealtimeSync(
  contextType?: 'org_unit' | 'user' | 'global',
  contextId?: string
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getSocket()

    const handler = (event: any) => {
      // Invalidate audit queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['audit', contextType, contextId] 
      })
    }

    socket.on('directory:audit_created', handler)

    return () => {
      socket.off('directory:audit_created', handler)
    }
  }, [contextType, contextId, queryClient])
}

/**
 * Export audit events to CSV format
 */
export function exportAuditToCSV(events: AuditEvent[], filename = 'audit-trail.csv') {
  const headers = ['Timestamp', 'Action', 'Actor', 'Target', 'Details']
  const rows = events.map((event) => [
    new Date(event.timestamp).toLocaleString(),
    event.action.replace(/_/g, ' ').toUpperCase(),
    event.actor.name,
    event.targetName,
    event.details,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
