import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Trash2 } from 'lucide-react';
import type { NotificationCenterProps } from '@/types/notifications';

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">
          Notifications
          {unreadCount > 0 && <span className="ml-2 text-sm text-muted-foreground">({unreadCount} new)</span>}
        </h2>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onMarkRead(notification.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
