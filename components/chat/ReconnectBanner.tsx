import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, X, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ReconnectBannerProps } from '@/types/chat';

export function ReconnectBanner({
  status,
  onRetry,
  autoRetryIn,
}: ReconnectBannerProps) {
  const [countdown, setCountdown] = useState(autoRetryIn || 0);

  useEffect(() => {
    if (autoRetryIn && autoRetryIn > 0) {
      setCountdown(autoRetryIn);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onRetry?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [autoRetryIn, onRetry]);

  const isConnecting = status === 'connecting';
  const isDisconnected = status === 'disconnected';

  return (
    <Alert
      className={isConnecting ? 'bg-yellow-500/10 border-yellow-500' : 'bg-red-500/10 border-red-500'}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <RefreshCw className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertDescription className="text-sm font-medium">
            {isConnecting && 'Reconnecting...'}
            {isDisconnected && 'Connection lost'}
            {countdown > 0 && ` Retrying in ${countdown}s...`}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          {isDisconnected && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
