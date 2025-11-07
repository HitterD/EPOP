import { computeBackoff } from '../use-resilient-socket'
import { useConnectionStore } from '@/lib/stores/connection.store'

describe('computeBackoff', () => {
  it('is monotonic increasing and bounded by max', () => {
    const base = 100
    const max = 2000
    const values: number[] = []
    for (let i = 0; i < 6; i++) {
      values.push(computeBackoff(i, base, max))
    }
    for (let i = 1; i < values.length; i++) {
      const prev = values[i - 1]!
      const cur = values[i]!
      expect(cur).toBeGreaterThanOrEqual(prev)
      expect(cur).toBeLessThanOrEqual(max)
    }
  })
})

describe('useConnectionStore', () => {
  it('updates status and attempts correctly', () => {
    const get = useConnectionStore.getState()

    // initial
    expect(get.status).toBe('connecting')
    expect(get.attempts).toBe(0)

    // set connecting with attempts
    useConnectionStore.getState().set({ status: 'connecting', attempts: 2 })
    expect(useConnectionStore.getState().status).toBe('connecting')
    expect(useConnectionStore.getState().attempts).toBe(2)

    // set disconnected
    useConnectionStore.getState().set({ status: 'disconnected', attempts: 3, lastError: 'timeout' })
    expect(useConnectionStore.getState().status).toBe('disconnected')
    expect(useConnectionStore.getState().attempts).toBe(3)
    expect(useConnectionStore.getState().lastError).toBe('timeout')

    // set connected resets attempts (do not set optional lastError explicitly)
    useConnectionStore.getState().set({ status: 'connected', attempts: 0 })
    expect(useConnectionStore.getState().status).toBe('connected')
    expect(useConnectionStore.getState().attempts).toBe(0)
  })
})
