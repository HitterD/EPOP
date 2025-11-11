/**
 * Simple in-memory idempotency manager with TTL.
 * Use per-endpoint idempotency keys to dedupe repeated requests.
 */

export interface IdempotencyRecord<T = any> {
  key: string;
  value: T;
  createdAt: number; // epoch ms
  ttlMs: number;
}

class IdempotencyStore {
  private map = new Map<string, IdempotencyRecord>();

  constructor(private defaultTtlMs = 10 * 60 * 1000) {} // 10 minutes

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    const rec: IdempotencyRecord<T> = {
      key,
      value,
      createdAt: Date.now(),
      ttlMs,
    };
    this.map.set(key, rec);
  }

  get<T>(key: string): T | undefined {
    const rec = this.map.get(key);
    if (!rec) return undefined;
    const age = Date.now() - rec.createdAt;
    if (age > rec.ttlMs) {
      this.map.delete(key);
      return undefined;
    }
    return rec.value as T;
  }

  withIdempotency<T>(key: string, fn: () => T, ttlMs?: number): T {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = fn();
    this.set(key, value, ttlMs);
    return value;
  }
}

export const idempotencyStore = new IdempotencyStore();
