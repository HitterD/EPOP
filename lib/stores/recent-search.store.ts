import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentSearchState {
  items: string[]
  add: (q: string) => void
  clear: () => void
}

const MAX = 10

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (q: string) => {
        const query = q.trim()
        if (!query) return
        const prev = get().items
        const next = [query, ...prev.filter((x) => x.toLowerCase() !== query.toLowerCase())].slice(0, MAX)
        set({ items: next })
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'recent-searches' }
  )
)
