import { formatDistanceToNow } from 'date-fns';

/**
 * Format utilities for Chat components
 */

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatTypingUsers(users: string[]): string {
  if (users.length === 0) return '';
  if (users.length === 1) return `${users[0]} is typing...`;
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
  return `${users[0]}, ${users[1]}, and ${users.length - 2} ${users.length - 2 === 1 ? 'other' : 'others'} are typing...`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
