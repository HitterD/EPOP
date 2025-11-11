/**
 * Timezone-Aware Utilities for Gantt Chart
 * 
 * Handles timezone conversions and DST transitions for project timelines.
 * NO SVAR - Uses TanStack only.
 */

export type TimeScale = 'day' | 'week' | 'month';

export interface DateSpanPosition {
  left: number;
  width: number;
}

/**
 * Convert UTC date span to pixel position
 * Handles timezone and DST transitions
 */
export function utcDateSpanToPx(
  startDate: Date,
  endDate: Date,
  scale: TimeScale,
  timezone: string,
  viewportStartDate: Date,
  pixelsPerDay: number = 40
): DateSpanPosition {
  // Convert dates to timezone-aware dates
  const tzStart = toTimezone(startDate, timezone);
  const tzEnd = toTimezone(endDate, timezone);
  const tzViewportStart = toTimezone(viewportStartDate, timezone);

  // Calculate days from viewport start
  const daysFromStart = getDaysBetween(tzViewportStart, tzStart, timezone);
  const spanDays = getDaysBetween(tzStart, tzEnd, timezone);

  // Adjust pixels based on scale
  const scaleMultiplier = getScaleMultiplier(scale);
  const pixelsPerUnit = pixelsPerDay * scaleMultiplier;

  return {
    left: daysFromStart * pixelsPerUnit,
    width: Math.max(spanDays * pixelsPerUnit, 10), // Min 10px
  };
}

/**
 * Convert date to specific timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getValue = (type: string) =>
    parts.find((p) => p.type === type)?.value || '0';

  return new Date(
    `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue(
      'hour'
    )}:${getValue('minute')}:${getValue('second')}`
  );
}

/**
 * Get days between two dates, accounting for DST
 */
export function getDaysBetween(
  startDate: Date,
  endDate: Date,
  timezone: string
): number {
  const start = toTimezone(startDate, timezone);
  const end = toTimezone(endDate, timezone);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return Math.ceil(diffDays);
}

/**
 * Check if date falls within DST period
 */
export function isDST(date: Date, timezone: string): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);

  const janOffset = getTimezoneOffset(jan, timezone);
  const julOffset = getTimezoneOffset(jul, timezone);

  const currentOffset = getTimezoneOffset(date, timezone);

  return currentOffset !== Math.max(janOffset, julOffset);
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));

  return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
}

/**
 * Handle DST transition for a date
 */
export function handleDST(date: Date, timezone: string): Date {
  const beforeDST = isDST(
    new Date(date.getTime() - 24 * 60 * 60 * 1000),
    timezone
  );
  const afterDST = isDST(date, timezone);

  // DST transition detected
  if (beforeDST !== afterDST) {
    const offset = afterDST ? -1 : 1; // Spring forward or fall back
    return new Date(date.getTime() + offset * 60 * 60 * 1000);
  }

  return date;
}

/**
 * Get scale multiplier for pixel calculations
 */
function getScaleMultiplier(scale: TimeScale): number {
  switch (scale) {
    case 'day':
      return 1;
    case 'week':
      return 1 / 7;
    case 'month':
      return 1 / 30;
    default:
      return 1;
  }
}

/**
 * Snap date to grid based on scale
 */
export function snapToGrid(date: Date, scale: TimeScale): Date {
  const d = new Date(date);

  switch (scale) {
    case 'day':
      d.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = d.getDay();
      d.setDate(d.getDate() - day); // Start of week (Sunday)
      d.setHours(0, 0, 0, 0);
      break;
    case 'month':
      d.setDate(1); // Start of month
      d.setHours(0, 0, 0, 0);
      break;
  }

  return d;
}

/**
 * Get business days between dates (excludes weekends)
 */
export function getBusinessDays(
  startDate: Date,
  endDate: Date,
  timezone: string
): number {
  let count = 0;
  const current = new Date(toTimezone(startDate, timezone));
  const end = toTimezone(endDate, timezone);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      // Not Sunday or Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Format date for display in timeline
 */
export function formatTimelineDate(
  date: Date,
  scale: TimeScale,
  timezone: string
): string {
  const tzDate = toTimezone(date, timezone);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    ...(scale === 'day' && { month: 'short', day: 'numeric' }),
    ...(scale === 'week' && { month: 'short', day: 'numeric' }),
    ...(scale === 'month' && { month: 'long', year: 'numeric' }),
  });

  return formatter.format(tzDate);
}

/**
 * Get timeline column headers
 */
export function getTimelineHeaders(
  startDate: Date,
  endDate: Date,
  scale: TimeScale,
  timezone: string
): Array<{ date: Date; label: string }> {
  const headers: Array<{ date: Date; label: string }> = [];
  const current = new Date(snapToGrid(startDate, scale));
  const end = snapToGrid(endDate, scale);

  while (current <= end) {
    headers.push({
      date: new Date(current),
      label: formatTimelineDate(current, scale, timezone),
    });

    // Increment based on scale
    switch (scale) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return headers;
}
