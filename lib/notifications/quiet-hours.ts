/**
 * Quiet Hours & Notification Rate Limiting
 * 
 * Manages quiet hours and critical notification overrides
 */

export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // "22:00" (24-hour format)
  endTime: string;   // "08:00"
  allowCritical: boolean;
  timezone?: string;
}

export interface NotificationPriority {
  level: 'low' | 'normal' | 'high' | 'critical';
}

const DEFAULT_CONFIG: QuietHoursConfig = {
  enabled: true,
  startTime: '22:00',
  endTime: '08:00',
  allowCritical: true,
};

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(config: QuietHoursConfig = DEFAULT_CONFIG): boolean {
  if (!config.enabled) return false;

  const now = new Date();
  const currentTime = formatTime(now);
  
  const start = config.startTime;
  const end = config.endTime;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }

  // Handle same-day quiet hours (e.g., 01:00 to 06:00)
  return currentTime >= start && currentTime < end;
}

/**
 * Check if notification should be shown
 */
export function shouldShowNotification(
  priority: NotificationPriority['level'],
  config: QuietHoursConfig = DEFAULT_CONFIG
): boolean {
  // Always show critical notifications
  if (priority === 'critical') {
    return true;
  }

  // Check quiet hours
  if (isQuietHours(config)) {
    // Allow critical only if configured
    return config.allowCritical && priority === 'critical';
  }

  return true;
}

/**
 * Format time as HH:MM
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Toast rate limiter
 */
export class ToastRateLimiter {
  private toastTimestamps: number[] = [];
  private maxToastsPerMinute: number;

  constructor(maxToastsPerMinute: number = 5) {
    this.maxToastsPerMinute = maxToastsPerMinute;
  }

  /**
   * Check if toast can be shown
   */
  canShow(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Remove timestamps older than 1 minute
    this.toastTimestamps = this.toastTimestamps.filter((ts) => ts > oneMinuteAgo);

    // Check if limit exceeded
    return this.toastTimestamps.length < this.maxToastsPerMinute;
  }

  /**
   * Record toast shown
   */
  recordToast(): void {
    this.toastTimestamps.push(Date.now());
  }

  /**
   * Get remaining quota
   */
  getRemainingQuota(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentToasts = this.toastTimestamps.filter((ts) => ts > oneMinuteAgo);
    return Math.max(0, this.maxToastsPerMinute - recentToasts.length);
  }

  /**
   * Get time until quota resets
   */
  getTimeUntilReset(): number {
    if (this.toastTimestamps.length === 0) return 0;
    
    const oldest = this.toastTimestamps[0];
    const resetTime = oldest + 60 * 1000;
    return Math.max(0, resetTime - Date.now());
  }
}

/**
 * React hook for quiet hours
 */
export function useQuietHours(config?: QuietHoursConfig) {
  const [isQuiet, setIsQuiet] = React.useState(false);
  const [currentConfig, setCurrentConfig] = React.useState<QuietHoursConfig>(
    config || DEFAULT_CONFIG
  );

  React.useEffect(() => {
    // Check initially
    setIsQuiet(isQuietHours(currentConfig));

    // Check every minute
    const interval = setInterval(() => {
      setIsQuiet(isQuietHours(currentConfig));
    }, 60000);

    return () => clearInterval(interval);
  }, [currentConfig]);

  const updateConfig = React.useCallback((newConfig: Partial<QuietHoursConfig>) => {
    setCurrentConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const shouldShow = React.useCallback(
    (priority: NotificationPriority['level']) => {
      return shouldShowNotification(priority, currentConfig);
    },
    [currentConfig]
  );

  return {
    isQuiet,
    config: currentConfig,
    updateConfig,
    shouldShow,
  };
}

/**
 * React hook for toast rate limiting
 */
export function useToastRateLimiter(maxPerMinute: number = 5) {
  const limiterRef = React.useRef(new ToastRateLimiter(maxPerMinute));

  const canShow = React.useCallback(() => {
    return limiterRef.current.canShow();
  }, []);

  const recordToast = React.useCallback(() => {
    limiterRef.current.recordToast();
  }, []);

  const showToast = React.useCallback((callback: () => void) => {
    if (canShow()) {
      recordToast();
      callback();
      return true;
    }
    return false;
  }, [canShow, recordToast]);

  return {
    canShow,
    recordToast,
    showToast,
    remainingQuota: limiterRef.current.getRemainingQuota(),
    timeUntilReset: limiterRef.current.getTimeUntilReset(),
  };
}

// React import
import React from 'react';
