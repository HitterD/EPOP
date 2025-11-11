/**
 * Accessibility utilities for Chat components
 */

export function getConversationLabel(name: string, unreadCount: number): string {
  if (unreadCount === 0) {
    return `Chat with ${name}`;
  }
  return `Chat with ${name}, ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`;
}

export function getMessageLabel(
  authorName: string,
  timestamp: Date,
  content: string
): string {
  const timeStr = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const preview = content.substring(0, 50);
  return `Message from ${authorName} at ${timeStr}: ${preview}`;
}

export function getReadReceiptLabel(users: Array<{ name: string }>): string {
  if (users.length === 0) return 'Not read yet';
  if (users.length === 1) return `Read by ${users[0].name}`;
  if (users.length === 2) return `Read by ${users[0].name} and ${users[1].name}`;
  return `Read by ${users[0].name}, ${users[1].name}, and ${users.length - 2} others`;
}

export function announceNewMessage(count: number): void {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `${count} new ${count === 1 ? 'message' : 'messages'}`;
  
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}
