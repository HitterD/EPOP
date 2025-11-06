/**
 * FE-Res-1: Optimistic UI Reconciliation Utility
 * Handles clientTempId → serverId mapping for reliable optimistic updates
 */

import { queryClient } from '@/lib/config/query-client'

export interface OptimisticItem {
  id: string
  _optimistic?: boolean
  _tempId?: string
  _status?: 'sending' | 'sent' | 'error'
  _error?: string
  [key: string]: any
}

/**
 * Generate unique temp ID for optimistic items
 */
export function generateTempId(prefix: string = 'temp'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Optimistic update reconciliation manager
 */
export class OptimisticReconciler<T extends OptimisticItem> {
  private pendingMap = new Map<string, T>()
  private queryKey: readonly unknown[]

  constructor(queryKey: readonly unknown[]) {
    this.queryKey = queryKey
  }

  /**
   * Add optimistic item to cache
   */
  addOptimistic(item: T): void {
    const tempId = item._tempId || item.id

    // Store in pending map
    this.pendingMap.set(tempId, { ...item, _optimistic: true, _status: 'sending' })

    // Update query cache
    queryClient.setQueryData(this.queryKey, (old: any) => {
      if (!old) return old

      // Handle infinite query structure
      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Add to first page
            if (index === 0) {
              return {
                ...page,
                items: [...(page.items || []), { ...item, _optimistic: true }],
              }
            }
            return page
          }),
        }
      }

      // Handle regular query structure
      if (Array.isArray(old)) {
        return [...old, { ...item, _optimistic: true }]
      }

      return old
    })
  }

  /**
   * Reconcile optimistic item with server response
   * Maps clientTempId → serverId
   */
  reconcile(tempId: string, serverItem: T): void {
    const optimisticItem = this.pendingMap.get(tempId)
    if (!optimisticItem) return

    // Mark as sent
    this.pendingMap.set(tempId, { ...optimisticItem, _status: 'sent' })

    // Update query cache - replace temp item with server item
    queryClient.setQueryData(this.queryKey, (old: any) => {
      if (!old) return old

      // Handle infinite query structure
      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: (page.items || []).map((item: T) =>
              item._tempId === tempId || item.id === tempId
                ? { ...serverItem, _optimistic: false }
                : item
            ),
          })),
        }
      }

      // Handle regular query structure
      if (Array.isArray(old)) {
        return old.map((item: T) =>
          item._tempId === tempId || item.id === tempId
            ? { ...serverItem, _optimistic: false }
            : item
        )
      }

      return old
    })

    // Clean up after delay
    setTimeout(() => {
      this.pendingMap.delete(tempId)
      this.cleanup(tempId)
    }, 1000)
  }

  /**
   * Mark optimistic item as failed
   */
  markFailed(tempId: string, error: string): void {
    const item = this.pendingMap.get(tempId)
    if (!item) return

    this.pendingMap.set(tempId, { ...item, _status: 'error', _error: error })

    // Update query cache with error status
    queryClient.setQueryData(this.queryKey, (old: any) => {
      if (!old) return old

      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: (page.items || []).map((item: T) =>
              item._tempId === tempId || item.id === tempId
                ? { ...item, _status: 'error', _error: error }
                : item
            ),
          })),
        }
      }

      if (Array.isArray(old)) {
        return old.map((item: T) =>
          item._tempId === tempId || item.id === tempId
            ? { ...item, _status: 'error', _error: error }
            : item
        )
      }

      return old
    })
  }

  /**
   * Retry failed optimistic update
   */
  retry(tempId: string, retryFn: () => Promise<T>): Promise<void> {
    const item = this.pendingMap.get(tempId)
    if (!item) return Promise.reject(new Error('Item not found'))

    // Reset status to sending
    this.pendingMap.set(tempId, { ...item, _status: 'sending', _error: undefined })

    queryClient.setQueryData(this.queryKey, (old: any) => {
      if (!old) return old

      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: (page.items || []).map((item: T) =>
              item._tempId === tempId
                ? { ...item, _status: 'sending', _error: undefined }
                : item
            ),
          })),
        }
      }

      if (Array.isArray(old)) {
        return old.map((item: T) =>
          item._tempId === tempId
            ? { ...item, _status: 'sending', _error: undefined }
            : item
        )
      }

      return old
    })

    return retryFn()
      .then((serverItem) => {
        this.reconcile(tempId, serverItem)
      })
      .catch((error) => {
        this.markFailed(tempId, error.message || 'Retry failed')
        throw error
      })
  }

  /**
   * Remove optimistic item (on user delete action)
   */
  remove(tempId: string): void {
    this.pendingMap.delete(tempId)
    this.cleanup(tempId)
  }

  /**
   * Clean up optimistic item from cache
   */
  private cleanup(tempId: string): void {
    queryClient.setQueryData(this.queryKey, (old: any) => {
      if (!old) return old

      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter(
              (item: T) => item._tempId !== tempId && item.id !== tempId
            ),
          })),
        }
      }

      if (Array.isArray(old)) {
        return old.filter((item: T) => item._tempId !== tempId && item.id !== tempId)
      }

      return old
    })
  }

  /**
   * Get all pending optimistic items
   */
  getPending(): Map<string, T> {
    return new Map(this.pendingMap)
  }

  /**
   * Check if there are any pending items
   */
  hasPending(): boolean {
    return this.pendingMap.size > 0
  }

  /**
   * Clear all pending items
   */
  clear(): void {
    this.pendingMap.clear()
  }
}

/**
 * Hook for optimistic reconciliation
 */
export function useOptimisticReconciler<T extends OptimisticItem>(
  queryKey: readonly unknown[]
) {
  const reconciler = new OptimisticReconciler<T>(queryKey)
  return reconciler
}
