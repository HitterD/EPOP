import { create } from 'zustand'

export type Status = 'connected' | 'connecting' | 'disconnected'

export type ConnState = {
  status: Status
  attempts: number
  lastError?: string
  set: (p: Partial<ConnState>) => void
}

export const useConnectionStore = create<ConnState>((set) => ({
  status: 'connecting',
  attempts: 0,
  set: (p) => set(p),
}))
