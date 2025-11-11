export type NotificationType = 'message' | 'mention' | 'task' | 'file' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  body?: string; // Alias for message, used in toast notifications
  priority?: NotificationPriority;
  read: boolean;
  timestamp?: Date;
  createdAt: Date;
  userId: string;
  actionUrl?: string;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: () => void;
}

export interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export interface NotificationBadgeProps {
  count: number;
  max?: number;
}

export interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export interface ServiceWorkerUpdateProps {
  onUpdate: () => void;
  onDismiss: () => void;
}
