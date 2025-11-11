/**
 * In-memory Draft Lock + LWW Store
 */

export interface DraftRecord {
  draftId: string;
  body: string;
  serverUpdatedAt: number; // epoch ms
  lock?: {
    tabId: string;
    lastHeartbeat: number;
  };
}

class DraftStore {
  private map = new Map<string, DraftRecord>();
  private lockTtlMs = 5 * 60 * 1000; // 5 minutes

  get(draftId: string): DraftRecord | undefined {
    this.pruneLock(draftId);
    return this.map.get(draftId);
  }

  acquireLock(draftId: string, tabId: string): { acquired: boolean; lockedBy?: string } {
    const now = Date.now();
    const rec = this.map.get(draftId);
    if (!rec) {
      const created: DraftRecord = { draftId, body: '', serverUpdatedAt: now, lock: { tabId, lastHeartbeat: now } };
      this.map.set(draftId, created);
      return { acquired: true };
    }
    if (!rec.lock || now - rec.lock.lastHeartbeat > this.lockTtlMs || rec.lock.tabId === tabId) {
      rec.lock = { tabId, lastHeartbeat: now };
      return { acquired: true };
    }
    return { acquired: false, lockedBy: rec.lock.tabId };
  }

  releaseLock(draftId: string, tabId: string): void {
    const rec = this.map.get(draftId);
    if (rec?.lock?.tabId === tabId) {
      rec.lock = undefined;
    }
  }

  heartbeat(draftId: string, tabId: string): void {
    const rec = this.map.get(draftId);
    if (rec?.lock?.tabId === tabId) {
      rec.lock.lastHeartbeat = Date.now();
    }
  }

  saveLWW(draftId: string, tabId: string, body: string, clientUpdatedAt: number):
    | { status: 'ok'; record: DraftRecord }
    | { status: 'conflict'; server: DraftRecord } {
    const now = Date.now();
    const rec = this.map.get(draftId) || { draftId, body: '', serverUpdatedAt: 0 } as DraftRecord;

    // LWW: if server is newer than client, return conflict
    if (rec.serverUpdatedAt > clientUpdatedAt) {
      return { status: 'conflict', server: rec };
    }

    rec.body = body;
    rec.serverUpdatedAt = now;
    // lock heartbeat if same tab holds it
    if (rec.lock?.tabId === tabId) {
      rec.lock.lastHeartbeat = now;
    }

    this.map.set(draftId, rec);
    return { status: 'ok', record: rec };
  }

  private pruneLock(draftId: string) {
    const rec = this.map.get(draftId);
    if (!rec?.lock) return;
    if (Date.now() - rec.lock.lastHeartbeat > this.lockTtlMs) {
      rec.lock = undefined;
    }
  }
}

export const draftStore = new DraftStore();
