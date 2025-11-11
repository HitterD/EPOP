/**
 * Offline Queue Management for Chat
 * 
 * Manages pending messages when user is offline.
 * - Max 100 messages (purge oldest)
 * - Retry with exponential backoff
 * - Persist to localStorage
 */

import { RetryManager } from '@/styles/states';

export interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  timestamp: number;
  retries: number;
  status: 'pending' | 'sending' | 'failed';
  error?: string;
}

const STORAGE_KEY = 'chat_offline_queue';
const MAX_QUEUE_SIZE = 100;

export class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private retryManagers: Map<string, RetryManager> = new Map();
  private listeners: Set<(queue: QueuedMessage[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add message to offline queue
   */
  add(message: Omit<QueuedMessage, 'timestamp' | 'retries' | 'status'>): void {
    const queuedMessage: QueuedMessage = {
      ...message,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.queue.push(queuedMessage);

    // Enforce max size (purge oldest)
    if (this.queue.length > MAX_QUEUE_SIZE) {
      const removed = this.queue.shift();
      if (removed) {
        this.retryManagers.delete(removed.id);
      }
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Remove message from queue
   */
  remove(messageId: string): void {
    this.queue = this.queue.filter((msg) => msg.id !== messageId);
    this.retryManagers.delete(messageId);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Update message status
   */
  updateStatus(
    messageId: string,
    status: QueuedMessage['status'],
    error?: string
  ): void {
    const message = this.queue.find((msg) => msg.id === messageId);
    if (message) {
      message.status = status;
      if (error) message.error = error;
      if (status === 'failed') message.retries++;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Get all queued messages
   */
  getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get queued messages for a specific conversation
   */
  getForConversation(conversationId: string): QueuedMessage[] {
    return this.queue.filter((msg) => msg.conversationId === conversationId);
  }

  /**
   * Get retry manager for a message
   */
  getRetryManager(messageId: string): RetryManager {
    if (!this.retryManagers.has(messageId)) {
      this.retryManagers.set(messageId, new RetryManager());
    }
    return this.retryManagers.get(messageId)!;
  }

  /**
   * Check if message can be retried
   */
  canRetry(messageId: string): boolean {
    const message = this.queue.find((msg) => msg.id === messageId);
    if (!message) return false;

    const retryManager = this.getRetryManager(messageId);
    return retryManager.canRetry();
  }

  /**
   * Get retry delay for a message
   */
  getRetryDelay(messageId: string): number {
    const retryManager = this.getRetryManager(messageId);
    return retryManager.getDelay();
  }

  /**
   * Record retry attempt
   */
  recordRetry(messageId: string): void {
    const retryManager = this.getRetryManager(messageId);
    retryManager.recordAttempt();
  }

  /**
   * Reset retry count for a message
   */
  resetRetry(messageId: string): void {
    const retryManager = this.getRetryManager(messageId);
    retryManager.reset();
  }

  /**
   * Clear all queued messages
   */
  clearAll(): void {
    this.queue = [];
    this.retryManagers.clear();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clear failed messages only
   */
  clearFailed(): void {
    this.queue = this.queue.filter((msg) => msg.status !== 'failed');
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Get pending count
   */
  getPendingCount(): number {
    return this.queue.filter((msg) => msg.status === 'pending').length;
  }

  /**
   * Get failed count
   */
  getFailedCount(): number {
    return this.queue.filter((msg) => msg.status === 'failed').length;
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (queue: QueuedMessage[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const queueCopy = this.getAll();
    this.listeners.forEach((listener) => listener(queueCopy));
  }
}

// Singleton instance
let queueInstance: OfflineQueue | null = null;

/**
 * Get the global offline queue instance
 */
export function getOfflineQueue(): OfflineQueue {
  if (!queueInstance) {
    queueInstance = new OfflineQueue();
  }
  return queueInstance;
}

/**
 * React hook for offline queue
 */
export function useOfflineQueue() {
  const [queue, setQueue] = React.useState<QueuedMessage[]>([]);
  const queueRef = React.useRef(getOfflineQueue());

  React.useEffect(() => {
    const offlineQueue = queueRef.current;
    setQueue(offlineQueue.getAll());

    const unsubscribe = offlineQueue.subscribe(setQueue);
    return unsubscribe;
  }, []);

  const add = React.useCallback((message: Omit<QueuedMessage, 'timestamp' | 'retries' | 'status'>) => {
    queueRef.current.add(message);
  }, []);

  const remove = React.useCallback((messageId: string) => {
    queueRef.current.remove(messageId);
  }, []);

  const clearAll = React.useCallback(() => {
    queueRef.current.clearAll();
  }, []);

  const clearFailed = React.useCallback(() => {
    queueRef.current.clearFailed();
  }, []);

  return {
    queue,
    add,
    remove,
    clearAll,
    clearFailed,
    size: queue.length,
    pendingCount: queue.filter(m => m.status === 'pending').length,
    failedCount: queue.filter(m => m.status === 'failed').length,
  };
}

// React import
import React from 'react';
