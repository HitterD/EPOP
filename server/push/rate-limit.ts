export class RateLimiter {
  private hits = new Map<string, number[]>()
  constructor(private max: number, private windowMs: number) {}

  allow(key: string, now = Date.now()): boolean {
    const arr = this.hits.get(key) || []
    const cutoff = now - this.windowMs
    const recent = arr.filter((t) => t > cutoff)
    if (recent.length >= this.max) {
      this.hits.set(key, recent)
      return false
    }
    recent.push(now)
    this.hits.set(key, recent)
    return true
  }
}

export const userPushLimiter = new RateLimiter(10, 60_000) // 10 messages per minute per user
