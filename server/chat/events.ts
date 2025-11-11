import { randomUUID } from 'crypto';

export type ChatEventType = 'message:create' | 'message:react' | 'message:read' | 'presence:update';

export interface ChatEvent<T = any> {
  id: string;
  type: ChatEventType;
  data: T;
  serverTimestamp: number; // epoch ms (cursor)
}

class EventsStore {
  private events: ChatEvent[] = [];
  private maxEvents = 50_000; // ring buffer upper bound

  append<T>(type: ChatEventType, data: T): ChatEvent<T> {
    const ev: ChatEvent<T> = {
      id: randomUUID(),
      type,
      data,
      serverTimestamp: Date.now(),
    };
    this.events.push(ev);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
    return ev;
  }

  since(cursor: number): ChatEvent[] {
    if (!cursor || Number.isNaN(cursor)) return [...this.events];
    return this.events.filter((e) => e.serverTimestamp > cursor);
  }
}

export const chatEvents = new EventsStore();
