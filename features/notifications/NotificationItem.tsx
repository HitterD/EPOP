import React from 'react';
import { MessageSquare, AtSign, CheckSquare, FileText, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/chat/format';
import type { NotificationItemProps } from '@/types/notifications';

const iconMap = {
  message: MessageSquare,
  mention: AtSign,
  task: CheckSquare,
  file: FileText,
  system: Bell,
};

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = iconMap[notification.type];

  return (
    <button
      className={cn(
        'w-full p-4 text-left hover:bg-accent transition-colors',
        !notification.read && 'bg-accent/50'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', !notification.read && 'font-bold')}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatRelativeTime(notification.timestamp)}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        )}
      </div>
    </button>
  );
}
