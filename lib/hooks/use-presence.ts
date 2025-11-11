"use client"

import { useEffect, useState } from 'react'
import type { PresenceStatus } from '@/types'
import { usePresenceStore } from '@/lib/stores/presence-store'

/**
 * Efficient presence selector hook with minimal re-renders.
 * Falls back to 'offline' when TTL expired or not present.
 */
export function useUserPresence(userId?: string): PresenceStatus {
  const getPresence = usePresenceStore((s) => s.getPresence)
  const [status, setStatus] = useState<PresenceStatus>(() => (userId ? getPresence(userId) : 'offline'))

  useEffect(() => {
    if (!userId) return
    setStatus(getPresence(userId))
    const unsub = usePresenceStore.subscribe(() => {
      setStatus(getPresence(userId))
    })
    return () => unsub()
  }, [userId, getPresence])

  return status
}
