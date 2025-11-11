import React from 'react';
import { cn } from '@/lib/utils';
import type { PresenceStatus } from '@/types/chat';

export interface PresenceBadgeProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const statusClasses = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

export function PresenceBadge({
  status,
  size = 'md',
  showPulse = false,
  className,
}: PresenceBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-full ring-2 ring-background',
        sizeClasses[size],
        statusClasses[status],
        showPulse && status === 'online' && 'animate-pulse',
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    />
  );
}
