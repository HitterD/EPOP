import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { ProjectAnalytics, DateRange } from '@/types'
import { subDays, format } from 'date-fns'
import { queryPolicies } from '@/lib/config/query-policies'

interface UseProjectAnalyticsOptions {
  projectId: string
  dateRange?: DateRange
  enabled?: boolean
}

/**
 * Hook to fetch project analytics data
 */
export function useProjectAnalytics({
  projectId,
  dateRange,
  enabled = true,
}: UseProjectAnalyticsOptions) {
  return useQuery({
    queryKey: ['projects', projectId, 'analytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (dateRange?.start) {
        params.append('startDate', dateRange.start)
      }
      if (dateRange?.end) {
        params.append('endDate', dateRange.end)
      }

      const response = await apiClient.get<ProjectAnalytics>(
        `/projects/${projectId}/analytics?${params.toString()}`
      )
      return response.data!
    },
    enabled: enabled && !!projectId,
    ...queryPolicies.analytics,
  })
}

/**
 * Get predefined date ranges
 */
export function getDateRangePresets() {
  const today = new Date()
  
  return {
    last7Days: {
      start: format(subDays(today, 7), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
    last30Days: {
      start: format(subDays(today, 30), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
    last90Days: {
      start: format(subDays(today, 90), 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    },
  }
}

/**
 * Export chart to PNG (using html2canvas)
 */
export async function exportChartToPNG(elementId: string, filename: string) {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default
    
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Chart element not found')
    }

    const canvas = await html2canvas(element)
    const url = canvas.toDataURL('image/png')
    
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    link.click()
  } catch (error) {
    console.error('Failed to export chart:', error)
    throw error
  }
}
