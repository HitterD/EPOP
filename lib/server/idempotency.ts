type Stored = { status: number; body: unknown; createdAt: number }

class TTLMap<K, V> {
  private map: Map<K, { v: V; ts: number }> = new Map()
  constructor(private ttlMs: number) {}
  get(key: K): V | undefined {
    const e = this.map.get(key)
    if (!e) return undefined
    if (Date.now() - e.ts > this.ttlMs) {
      this.map.delete(key)
      return undefined
    }
    return e.v
  }
  set(key: K, value: V): void {
    this.map.set(key, { v: value, ts: Date.now() })
  }
}

const store = new TTLMap<string, Stored>(10 * 60 * 1000) // 10 minutes

export function getIdempotent(key: string): Stored | undefined {
  return store.get(key)
}

export function setIdempotent(key: string, status: number, body: unknown): void {
  store.set(key, { status, body, createdAt: Date.now() })
}
