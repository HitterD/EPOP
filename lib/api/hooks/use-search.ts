import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { withIdempotencyKey } from '../utils'
import { SearchResult, SearchParams, SearchTab, SearchFilters, Message, Project, User, FileItem } from '@/types'

function buildSearchQuery(params: SearchParams): string {
  const queryParams = new URLSearchParams()
  
  queryParams.set('q', params.query)
  
  if (params.tab && params.tab !== 'all') {
    queryParams.set('tab', params.tab)
  }
  
  if (params.limit) {
    queryParams.set('limit', params.limit.toString())
  }
  
  if (params.offset) {
    queryParams.set('offset', params.offset.toString())
  }
  
  // Apply filters
  if (params.filters) {
    const { filters } = params
    
    if (filters.dateRange) {
      queryParams.set('dateFrom', filters.dateRange.from)
      queryParams.set('dateTo', filters.dateRange.to)
    }
    
    if (filters.senderId) {
      queryParams.set('senderId', filters.senderId)
    }
    
    if (filters.projectId) {
      queryParams.set('projectId', filters.projectId)
    }
    
    if (filters.chatId) {
      queryParams.set('chatId', filters.chatId)
    }
    
    if (filters.fileType) {
      queryParams.set('fileType', filters.fileType)
    }
    
    if (filters.status) {
      queryParams.set('status', filters.status)
    }
    
    if (filters.labels && filters.labels.length > 0) {
      queryParams.set('labels', filters.labels.join(','))
    }
    
    if (filters.hasAttachments !== undefined) {
      queryParams.set('hasAttachments', filters.hasAttachments.toString())
    }
  }
  
  return queryParams.toString()
}

/**
 * Global search with ACL-aware filtering
 * Backend automatically filters results based on user permissions
 */
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const query = buildSearchQuery(params)
      const url = `/search?${query}`
      const res = await apiClient.get<SearchResult>(url)
      if (!res.success || !res.data) throw new Error('Failed to search')
      return res.data
    },
    enabled: params.query.trim().length > 0,
    staleTime: 10_000, // Cache for 10 seconds
  })
}

/**
 * Search specific tab
 */
export function useSearchMessages(query: string, filters?: SearchFilters) {
  return useSearch(filters ? { query, tab: 'messages', filters } : { query, tab: 'messages' })
}

export function useSearchProjects(query: string, filters?: SearchFilters) {
  return useSearch(filters ? { query, tab: 'projects', filters } : { query, tab: 'projects' })
}

export function useSearchUsers(query: string, filters?: SearchFilters) {
  return useSearch(filters ? { query, tab: 'users', filters } : { query, tab: 'users' })
}

export function useSearchFiles(query: string, filters?: SearchFilters) {
  return useSearch(filters ? { query, tab: 'files', filters } : { query, tab: 'files' })
}

/**
 * Reindex entity (admin only)
 */
export function useReindexEntity() {
  return useQuery({
    queryKey: ['search-reindex'],
    queryFn: async () => {
      const res = await apiClient.post('/search/reindex', {}, withIdempotencyKey())
      if (!res.success) throw new Error('Failed to trigger reindex')
      return res.data
    },
    enabled: false, // Manual trigger only
  })
}
