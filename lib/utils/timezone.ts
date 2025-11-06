import { format, formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { parseISO, isValid } from 'date-fns'

/**
 * Get user's timezone from browser
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Convert ISO date string to user's timezone
 */
export function toUserTimezone(isoDate: string, timezone?: string): Date {
  const tz = timezone || getUserTimezone()
  const date = parseISO(isoDate)
  return toZonedTime(date, tz)
}

/**
 * Convert local date to UTC ISO string
 */
export function toUTCISOString(date: Date, timezone?: string): string {
  const tz = timezone || getUserTimezone()
  const zonedDate = fromZonedTime(date, tz)
  return zonedDate.toISOString()
}

/**
 * Format date in user's timezone
 */
export function formatInUserTimezone(
  date: string | Date,
  formatString: string,
  timezone?: string
): string {
  const tz = timezone || getUserTimezone()
  const dateObj = typeof date === 'string' ? parseISO(date) : date

  if (!isValid(dateObj)) {
    return 'Invalid date'
  }

  return formatInTimeZone(dateObj, tz, formatString)
}

/**
 * Format date as "MMM d, yyyy" in user's timezone
 */
export function formatDate(date: string | Date, timezone?: string): string {
  return formatInUserTimezone(date, 'MMM d, yyyy', timezone)
}

/**
 * Format datetime as "MMM d, yyyy h:mm a" in user's timezone
 */
export function formatDateTime(date: string | Date, timezone?: string): string {
  return formatInUserTimezone(date, 'MMM d, yyyy h:mm a', timezone)
}

/**
 * Format time as "h:mm a" in user's timezone
 */
export function formatTime(date: string | Date, timezone?: string): string {
  return formatInUserTimezone(date, 'h:mm a', timezone)
}

/**
 * Check if date string is valid ISO 8601 with timezone
 */
export function isValidISODate(dateString: string): boolean {
  try {
    const date = parseISO(dateString)
    return isValid(date)
  } catch {
    return false
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date, baseDate: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const diff = baseDate.getTime() - dateObj.getTime()
  const seconds = Math.floor(Math.abs(diff) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const isPast = diff > 0

  if (seconds < 60) {
    return isPast ? 'just now' : 'in a moment'
  } else if (minutes < 60) {
    return isPast ? `${minutes}m ago` : `in ${minutes}m`
  } else if (hours < 24) {
    return isPast ? `${hours}h ago` : `in ${hours}h`
  } else if (days < 7) {
    return isPast ? `${days}d ago` : `in ${days}d`
  } else {
    return formatDate(dateObj)
  }
}
