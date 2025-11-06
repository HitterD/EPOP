import { formatDistanceToNow, format, parseISO } from 'date-fns'

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return String(timestamp)
  }
}

/**
 * Format date in various formats
 */
export function formatDate(
  date: string | Date,
  formatString: string = 'MMM d, yyyy'
): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, formatString)
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Less than 1 minute: "Just now"
    if (diff < 60000) {
      return 'Just now'
    }
    
    // Less than 1 day: relative time
    if (diff < 86400000) {
      return formatRelativeTime(date)
    }
    
    // Less than 1 week: day of week + time
    if (diff < 604800000) {
      return format(date, 'EEE h:mm a')
    }
    
    // Older: full date
    return format(date, 'MMM d, yyyy h:mm a')
  } catch (error) {
    console.error('Error formatting timestamp:', error)
    return String(timestamp)
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
