"use client"

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useConnectionStore } from '@/lib/stores/connection.store'

/**
 * Refetch critical queries when socket reconnects to reconcile missed events
 */
export function useRefetchOnReconnect() {
  const status = useConnectionStore((s) => s.status)
  const qc = useQueryClient()
  const prevRef = useRef(status)

  useEffect(() => {
    if (prevRef.current !== 'connected' && status === 'connected') {
      // Invalidate chat-related queries
      qc.invalidateQueries({ predicate: (q) => {
        const k = q.queryKey
        return Array.isArray(k) && (
          (k[0] === 'chat-messages') ||
          (k[0] === 'thread-messages') ||
          (k[0] === 'chats')
        )
      } })
      // Optionally also refetch notifications and presence-backed lists if any
    }
    prevRef.current = status
  }, [status, qc])
}
