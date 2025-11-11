/**
 * Sticky Day Header for Chat Messages
 * 
 * Displays date separators that stick to the top while scrolling
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/chat/format';

export interface DayHeaderProps {
  date: Date;
  sticky?: boolean;
  className?: string;
}

export function DayHeader({ date, sticky = true, className }: DayHeaderProps) {
  const formattedDate = formatRelativeDate(date);

  return (
    <div
      className={cn(
        'flex items-center justify-center py-3 z-10',
        sticky && 'sticky top-0 bg-background/80 backdrop-blur-sm',
        className
      )}
      role="separator"
      aria-label={`Messages from ${formattedDate}`}
    >
      <div className="px-3 py-1 bg-muted rounded-full">
        <time
          dateTime={date.toISOString()}
          className="text-xs font-medium text-muted-foreground"
        >
          {formattedDate}
        </time>
      </div>
    </div>
  );
}

/**
 * Helper to format relative dates for day headers
 */
function formatRelativeDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Group messages by day
 */
export function groupMessagesByDay<T extends { timestamp: Date }>(
  messages: T[]
): Array<{ date: Date; messages: T[] }> {
  const groups: Map<string, T[]> = new Map();

  messages.forEach((message) => {
    const dateKey = message.timestamp.toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, message]);
  });

  return Array.from(groups.entries())
    .map(([dateStr, msgs]) => ({
      date: new Date(dateStr),
      messages: msgs,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
