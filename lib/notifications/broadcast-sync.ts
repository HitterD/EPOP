/**
 * BroadcastChannel Sync for Notifications
 * 
 * Syncs notification badge count and read state across tabs
 */

const SYNC_CHANNEL = 'notification_sync';

export interface NotificationSyncMessage {
  type: 'badge-update' | 'mark-read' | 'mark-all-read';
  payload: {
    count?: number;
    notificationId?: string;
    notificationIds?: string[];
  };
  timestamp: number;
  tabId: string;
}

export class NotificationSyncManager {
  private channel: BroadcastChannel;
  private tabId: string;
  private listeners: Map<
    NotificationSyncMessage['type'],
    Set<(payload: any) => void>
  > = new Map();

  constructor() {
    this.tabId = `tab-${Date.now()}-${Math.random()}`;
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.setupMessageListener();
  }

  /**
   * Update badge count
   */
  updateBadgeCount(count: number): void {
    this.broadcast({
      type: 'badge-update',
      payload: { count },
      timestamp: Date.now(),
      tabId: this.tabId,
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    this.broadcast({
      type: 'mark-read',
      payload: { notificationId },
      timestamp: Date.now(),
      tabId: this.tabId,
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.broadcast({
      type: 'mark-all-read',
      payload: {},
      timestamp: Date.now(),
      tabId: this.tabId,
    });
  }

  /**
   * Subscribe to sync events
   */
  on(
    type: NotificationSyncMessage['type'],
    callback: (payload: any) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Broadcast message to other tabs
   */
  private broadcast(message: NotificationSyncMessage): void {
    this.channel.postMessage(message);
  }

  /**
   * Setup message listener
   */
  private setupMessageListener(): void {
    this.channel.onmessage = (event) => {
      const message = event.data as NotificationSyncMessage;

      // Ignore messages from this tab
      if (message.tabId === this.tabId) {
        return;
      }

      // Notify listeners
      const listeners = this.listeners.get(message.type);
      if (listeners) {
        listeners.forEach((callback) => callback(message.payload));
      }
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.channel.close();
    this.listeners.clear();
  }
}

// Singleton instance
let syncManagerInstance: NotificationSyncManager | null = null;

/**
 * Get the global notification sync manager
 */
export function getNotificationSyncManager(): NotificationSyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new NotificationSyncManager();
  }
  return syncManagerInstance;
}

/**
 * React hook for notification sync
 */
export function useNotificationSync() {
  const [badgeCount, setBadgeCount] = React.useState(0);
  const managerRef = React.useRef(getNotificationSyncManager());

  React.useEffect(() => {
    const manager = managerRef.current;

    // Subscribe to badge updates
    const unsubscribeBadge = manager.on('badge-update', ({ count }) => {
      setBadgeCount(count);
    });

    // Subscribe to mark-read events
    const unsubscribeMarkRead = manager.on('mark-read', ({ notificationId }) => {
      // Handle in parent component
      console.log('Notification marked as read:', notificationId);
    });

    // Subscribe to mark-all-read events
    const unsubscribeMarkAllRead = manager.on('mark-all-read', () => {
      setBadgeCount(0);
    });

    return () => {
      unsubscribeBadge();
      unsubscribeMarkRead();
      unsubscribeMarkAllRead();
    };
  }, []);

  const updateBadge = React.useCallback((count: number) => {
    setBadgeCount(count);
    managerRef.current.updateBadgeCount(count);
  }, []);

  const markAsRead = React.useCallback((notificationId: string) => {
    managerRef.current.markAsRead(notificationId);
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setBadgeCount(0);
    managerRef.current.markAllAsRead();
  }, []);

  return {
    badgeCount,
    updateBadge,
    markAsRead,
    markAllAsRead,
  };
}

// React import
import React from 'react';
