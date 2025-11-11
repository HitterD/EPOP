import React from 'react';

export interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const typingText =
    users.length === 1
      ? `${users[0]} is typing...`
      : users.length === 2
        ? `${users[0]} and ${users[1]} are typing...`
        : `${users[0]}, ${users[1]}, and ${users.length - 2} ${users.length - 2 === 1 ? 'other' : 'others'} are typing...`;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
      aria-live="polite"
      aria-atomic="true"
    >
      <span>{typingText}</span>
      <span className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
          •
        </span>
      </span>
    </div>
  );
}
