import { EventEmitter } from 'events';

export type PresenceStatus = 'online' | 'away' | 'offline';

interface PresenceRecord {
  userId: string;
  status: PresenceStatus;
  lastHeartbeat: number; // epoch ms
}

/**
 * PresenceManager maintains a TTL-based presence map and emits presence:update events.
 */
export class PresenceManager {
  private map = new Map<string, PresenceRecord>();
  private ttlMs: number;
  public emitter: EventEmitter;

  constructor({ ttlMs = 35_000 }: { ttlMs?: number } = {}) {
    this.ttlMs = ttlMs;
    this.emitter = new EventEmitter();
  }

  heartbeat(userId: string, status: PresenceStatus = 'online') {
    const now = Date.now();
    this.map.set(userId, { userId, status, lastHeartbeat: now });
    this.emitter.emit('presence:update', { userId, status, lastHeartbeat: now });
  }

  get(userId: string): PresenceRecord | undefined {
    this.pruneExpired();
    const rec = this.map.get(userId);
    if (!rec) return undefined;
    if (Date.now() - rec.lastHeartbeat > this.ttlMs) {
      this.map.delete(userId);
      return undefined;
    }
    return rec;
  }

  getAll(): PresenceRecord[] {
    this.pruneExpired();
    return Array.from(this.map.values());
  }

  private pruneExpired() {
    const now = Date.now();
    for (const [userId, rec] of this.map.entries()) {
      if (now - rec.lastHeartbeat > this.ttlMs) {
        this.map.delete(userId);
      }
    }
  }
}

export const presenceManager = new PresenceManager();
export const presenceEmitter = presenceManager.emitter;
