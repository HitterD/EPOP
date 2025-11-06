import { create } from 'zustand'

interface TraceStore {
  lastRequestId: string | null
  setLastRequestId: (id: string | null) => void
}

export const useTraceStore = create<TraceStore>((set) => ({
  lastRequestId: null,
  setLastRequestId: (id) => set({ lastRequestId: id }),
}))
