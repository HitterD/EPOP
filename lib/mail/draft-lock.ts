/**
 * Draft Lock Management
 * 
 * Detects and manages draft editing across multiple tabs using BroadcastChannel.
 * Prevents conflicts with Last-Write-Wins (LWW) + merge prompt.
 */

const LOCK_CHANNEL = 'draft_locks';
const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export interface DraftLock {
  draftId: string;
  tabId: string;
  timestamp: number;
  lastActivity: number;
}

export class DraftLockManager {
  private channel: BroadcastChannel;
  private locks: Map<string, DraftLock> = new Map();
  private currentTabId: string;
  private activityInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.currentTabId = `tab-${Date.now()}-${Math.random()}`;
    this.channel = new BroadcastChannel(LOCK_CHANNEL);
    this.setupMessageListener();
    this.startActivityHeartbeat();
  }

  /**
   * Acquire lock for a draft
   */
  acquireLock(draftId: string): boolean {
    const existingLock = this.locks.get(draftId);

    // Check if lock is expired
    if (existingLock && this.isLockExpired(existingLock)) {
      this.releaseLock(draftId);
    }

    // Check if another tab has the lock
    if (existingLock && existingLock.tabId !== this.currentTabId) {
      return false;
    }

    // Acquire or renew lock
    const lock: DraftLock = {
      draftId,
      tabId: this.currentTabId,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };

    this.locks.set(draftId, lock);
    this.broadcastLock(lock);

    return true;
  }

  /**
   * Release lock for a draft
   */
  releaseLock(draftId: string): void {
    this.locks.delete(draftId);
    this.channel.postMessage({
      type: 'release',
      draftId,
      tabId: this.currentTabId,
    });
  }

  /**
   * Update activity for a draft lock
   */
  updateActivity(draftId: string): void {
    const lock = this.locks.get(draftId);
    if (lock && lock.tabId === this.currentTabId) {
      lock.lastActivity = Date.now();
      this.broadcastLock(lock);
    }
  }

  /**
   * Check if draft is locked by another tab
   */
  isLockedByOther(draftId: string): boolean {
    const lock = this.locks.get(draftId);
    if (!lock) return false;
    if (this.isLockExpired(lock)) {
      this.locks.delete(draftId);
      return false;
    }
    return lock.tabId !== this.currentTabId;
  }

  /**
   * Get lock info for a draft
   */
  getLockInfo(draftId: string): DraftLock | null {
    const lock = this.locks.get(draftId);
    if (lock && this.isLockExpired(lock)) {
      this.locks.delete(draftId);
      return null;
    }
    return lock || null;
  }

  /**
   * Force take lock (for admin override)
   */
  forceTakeLock(draftId: string): void {
    const lock: DraftLock = {
      draftId,
      tabId: this.currentTabId,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };

    this.locks.set(draftId, lock);
    this.channel.postMessage({
      type: 'force-take',
      lock,
    });
  }

  /**
   * Check if lock is expired
   */
  private isLockExpired(lock: DraftLock): boolean {
    return Date.now() - lock.lastActivity > LOCK_TIMEOUT;
  }

  /**
   * Broadcast lock to other tabs
   */
  private broadcastLock(lock: DraftLock): void {
    this.channel.postMessage({
      type: 'acquire',
      lock,
    });
  }

  /**
   * Setup message listener for BroadcastChannel
   */
  private setupMessageListener(): void {
    this.channel.onmessage = (event) => {
      const { type, lock, draftId, tabId } = event.data;

      switch (type) {
        case 'acquire':
          if (lock.tabId !== this.currentTabId) {
            this.locks.set(lock.draftId, lock);
          }
          break;

        case 'release':
          if (tabId !== this.currentTabId) {
            this.locks.delete(draftId);
          }
          break;

        case 'force-take':
          this.locks.set(lock.draftId, lock);
          break;

        case 'heartbeat':
          if (lock.tabId !== this.currentTabId) {
            const existingLock = this.locks.get(lock.draftId);
            if (existingLock && existingLock.tabId === lock.tabId) {
              this.locks.set(lock.draftId, lock);
            }
          }
          break;
      }
    };
  }

  /**
   * Send activity heartbeat
   */
  private startActivityHeartbeat(): void {
    this.activityInterval = setInterval(() => {
      this.locks.forEach((lock) => {
        if (lock.tabId === this.currentTabId) {
          this.channel.postMessage({
            type: 'heartbeat',
            lock,
          });
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    this.locks.forEach((lock) => {
      if (lock.tabId === this.currentTabId) {
        this.releaseLock(lock.draftId);
      }
    });
    this.channel.close();
  }
}

// Singleton instance
let lockManagerInstance: DraftLockManager | null = null;

/**
 * Get the global draft lock manager
 */
export function getDraftLockManager(): DraftLockManager {
  if (!lockManagerInstance) {
    lockManagerInstance = new DraftLockManager();
  }
  return lockManagerInstance;
}

/**
 * React hook for draft lock
 */
export function useDraftLock(draftId: string | null) {
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockInfo, setLockInfo] = React.useState<DraftLock | null>(null);
  const managerRef = React.useRef(getDraftLockManager());

  React.useEffect(() => {
    if (!draftId) return;

    const manager = managerRef.current;

    // Try to acquire lock
    const acquired = manager.acquireLock(draftId);
    setIsLocked(!acquired);

    // Check lock status periodically
    const interval = setInterval(() => {
      const locked = manager.isLockedByOther(draftId);
      const info = manager.getLockInfo(draftId);
      setIsLocked(locked);
      setLockInfo(info);
    }, 1000);

    // Update activity on user interaction
    const updateActivity = () => manager.updateActivity(draftId);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      manager.releaseLock(draftId);
      clearInterval(interval);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [draftId]);

  const forceTake = React.useCallback(() => {
    if (draftId) {
      managerRef.current.forceTakeLock(draftId);
      setIsLocked(false);
    }
  }, [draftId]);

  return {
    isLocked,
    lockInfo,
    forceTake,
  };
}

// React import
import React from 'react';
