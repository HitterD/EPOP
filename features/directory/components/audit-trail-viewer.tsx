'use client'

import { useState } from 'react'
import { useAuditTrail, useAuditRealtimeSync, exportAuditToCSV } from '@/lib/api/hooks/use-audit-trail'
import { AuditFilters } from '@/types'
import { AuditEventRow } from './audit-event-row'
import { AuditFiltersComponent } from './audit-filters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditTrailViewerProps {
  contextType?: 'org_unit' | 'user' | 'global'
  contextId?: string
  autoRefresh?: boolean
  pageSize?: number
  className?: string
}

export function AuditTrailViewer({
  contextType = 'global',
  contextId,
  autoRefresh = true,
  pageSize = 20,
  className,
}: AuditTrailViewerProps) {
  const [filters, setFilters] = useState<AuditFilters>({})

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAuditTrail({
    contextType,
    contextId,
    filters,
    limit: pageSize,
  })

  // Real-time sync
  useAuditRealtimeSync(contextType, contextId)

  // Flatten all pages into single array
  const events = data?.pages.flatMap((page) => page.items) || []

  const handleExport = () => {
    exportAuditToCSV(events, `audit-trail-${Date.now()}.csv`)
  }

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-red-600 dark:text-red-400">
            Failed to load audit trail
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <AuditFiltersComponent filters={filters} onFiltersChange={setFilters} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No audit events found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no audit events matching your filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with filters and export */}
      <div className="flex items-center justify-between gap-4">
        <AuditFiltersComponent filters={filters} onFiltersChange={setFilters} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            title="Refresh audit trail"
          >
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={events.length === 0}
            title="Export to CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.map((event) => (
          <AuditEventRow key={event.id} event={event} />
        ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Real-time indicator */}
      {autoRefresh && (
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live updates enabled</span>
          </div>
        </div>
      )}
    </div>
  )
}
