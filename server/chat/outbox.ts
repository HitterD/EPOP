/**
 * Offline Outbox (in-memory) per user
 * Quota policy: max 100 messages per user (FIFO removal)
 */

export interface OutboxMessage {
  id: string;
  chatId: string;
  content: string;
  createdAt: number;
}

class OutboxStore {
  private store = new Map<string, OutboxMessage[]>();
  private maxPerUser = 100;

  getAll(userId: string): OutboxMessage[] {
    return [...(this.store.get(userId) || [])];
  }

  enqueue(userId: string, msg: Omit<OutboxMessage, 'createdAt'>): OutboxMessage {
    const list = this.store.get(userId) || [];
    const item: OutboxMessage = { ...msg, createdAt: Date.now() };
    list.push(item);
    if (list.length > this.maxPerUser) list.shift();
    this.store.set(userId, list);
    return item;
  }

  dequeue(userId: string, id: string): boolean {
    const list = this.store.get(userId) || [];
    const idx = list.findIndex((m) => m.id === id);
    if (idx >= 0) {
      list.splice(idx, 1);
      this.store.set(userId, list);
      return true;
    }
    return false;
  }

  clear(userId: string): void {
    this.store.set(userId, []);
  }
}

export const outboxStore = new OutboxStore();
