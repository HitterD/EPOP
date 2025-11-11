import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface NotificationToastProps {
  notification: Notification;
  type?: ToastType | undefined;
  duration?: number | undefined;
  onClose: () => void;
  onAction?: (() => void) | undefined;
  actionLabel?: string | undefined;
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
}

export function NotificationToast({
  notification,
  type = 'info',
  duration = 5000,
  onClose,
  onAction,
  actionLabel,
  position = 'bottom-right',
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Slide in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (duration === 0 || isPaused) return;

    const interval = 50; // Update every 50ms
    const decrement = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          handleClose();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [duration, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for slide-out animation before calling onClose
    setTimeout(onClose, 200);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getAnimationClasses = () => {
    if (position.includes('right')) {
      return isVisible
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0';
    }
    if (position.includes('top')) {
      return isVisible
        ? 'translate-y-0 opacity-100'
        : '-translate-y-full opacity-0';
    }
    return isVisible
      ? 'translate-y-0 opacity-100'
      : 'translate-y-full opacity-0';
  };

  return (
    <div
      className={cn(
        'fixed z-100 max-w-md w-full sm:w-96 transition-all duration-200',
        getPositionClasses(),
        getAnimationClasses()
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          'relative bg-background border-l-4 rounded-lg shadow-lg overflow-hidden',
          getBorderColor()
        )}
      >
        {/* Progress bar */}
        {duration > 0 && (
          <div
            className="absolute top-0 left-0 h-1 bg-primary/30 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {notification.title}
              </p>
              {(notification.body || notification.message) && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {notification.body || notification.message}
                </p>
              )}

              {/* Actions */}
              {(onAction || actionLabel) && (
                <div className="mt-3 flex items-center gap-2">
                  {onAction && actionLabel && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onAction();
                        handleClose();
                      }}
                      className="h-7 text-xs"
                    >
                      {actionLabel}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-7 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-accent"
              onClick={handleClose}
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    notification: Notification;
    type?: ToastType | undefined;
    duration?: number | undefined;
    actionLabel?: string | undefined;
    onAction?: (() => void) | undefined;
  }>;
  onClose: (id: string) => void;
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
  maxVisible?: number;
}

export function ToastContainer({
  toasts,
  onClose,
  position = 'bottom-right',
  maxVisible = 3,
}: ToastContainerProps) {
  const visibleToasts = toasts.slice(0, maxVisible);

  return (
    <div className="fixed inset-0 pointer-events-none z-100">
      <div className="pointer-events-auto space-y-2">
        {visibleToasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              marginBottom: position.includes('bottom') ? `${index * 8}px` : 0,
              marginTop: position.includes('top') ? `${index * 8}px` : 0,
            }}
          >
            <NotificationToast
              notification={toast.notification}
              type={toast.type}
              duration={toast.duration}
              actionLabel={toast.actionLabel}
              onAction={toast.onAction}
              onClose={() => onClose(toast.id)}
              position={position}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      notification: Notification;
      type?: ToastType;
      duration?: number;
      actionLabel?: string;
      onAction?: () => void;
    }>
  >([]);

  const addToast = (
    notification: Notification,
    options?: {
      type?: ToastType;
      duration?: number;
      actionLabel?: string;
      onAction?: () => void;
    }
  ) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, notification, ...options }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
}
