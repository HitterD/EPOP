import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchResult } from '@/types'

interface SnapshotState {
  map: Record<string, SearchResult>
  save: (key: string, data: SearchResult) => void
  get: (key: string) => SearchResult | undefined
  clear: () => void
}

export const useSearchSnapshotStore = create<SnapshotState>()(
  persist(
    (set, get) => ({
      map: {},
      save: (key, data) => set((s) => ({ map: { ...s.map, [key]: data } })),
      get: (key) => get().map[key],
      clear: () => set({ map: {} }),
    }),
    { name: 'search-snapshot' }
  )
)
