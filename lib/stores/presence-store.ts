import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PresenceStatus } from '@/types'

export interface PresenceEntry {
  userId: string
  status: PresenceStatus
  updatedAt: number
}

interface PresenceState {
  map: Map<string, PresenceEntry>
  ttlMs: number
  setPresence: (userId: string, status: PresenceStatus) => void
  getPresence: (userId: string) => PresenceStatus
  sweep: () => void
}

export const usePresenceStore = create<PresenceState>()(
  immer((set, get) => ({
    map: new Map<string, PresenceEntry>(),
    ttlMs: 90_000,
    setPresence: (userId, status) => set((s) => {
      s.map.set(userId, { userId, status, updatedAt: Date.now() })
    }),
    getPresence: (userId) => {
      const entry = get().map.get(userId)
      if (!entry) return 'offline'
      if (Date.now() - entry.updatedAt > get().ttlMs) return 'offline'
      return entry.status
    },
    sweep: () => set((s) => {
      const now = Date.now()
      const ttl = get().ttlMs
      for (const [uid, e] of s.map.entries()) {
        if (now - e.updatedAt > ttl) {
          s.map.set(uid, { ...e, status: 'offline', updatedAt: now })
        }
      }
    }),
  }))
)
