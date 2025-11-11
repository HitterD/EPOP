import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NotificationBadgeProps } from '@/types/notifications';

export function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="destructive"
      className={cn(
        'absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs',
        count > max && 'px-1'
      )}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </Badge>
  );
}
