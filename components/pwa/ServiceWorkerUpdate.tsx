/**
 * Service Worker Update UI
 * 
 * Shows update notification with version badge and auto-update
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServiceWorkerUpdateProps {
  currentVersion?: string;
  availableVersion?: string;
  updateAvailable: boolean;
  onUpdate: () => Promise<void>;
  onSkip?: () => void;
  autoUpdateDelay?: number; // seconds
  showRollbackNotice?: boolean;
  className?: string;
}

export function ServiceWorkerUpdate({
  currentVersion = '1.0.0',
  availableVersion = '1.0.1',
  updateAvailable,
  onUpdate,
  onSkip,
  autoUpdateDelay = 30,
  showRollbackNotice = false,
  className,
}: ServiceWorkerUpdateProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [countdown, setCountdown] = React.useState(autoUpdateDelay);
  const [updateStatus, setUpdateStatus] = React.useState<
    'pending' | 'updating' | 'success' | 'failed'
  >('pending');

  // Auto-update countdown
  React.useEffect(() => {
    if (!updateAvailable || autoUpdateDelay === 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [updateAvailable, autoUpdateDelay]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateStatus('updating');

    try {
      await onUpdate();
      setUpdateStatus('success');
      toast.success('Update successful! Refreshing...', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });

      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setUpdateStatus('failed');
      setIsUpdating(false);
      toast.error('Update failed. Please try again.', {
        icon: <XCircle className="h-4 w-4" />,
      });
    }
  };

  const handleSkip = () => {
    setCountdown(0);
    onSkip?.();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Version badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          Current: v{currentVersion}
        </Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant="default" className="font-mono text-xs">
          New: v{availableVersion}
        </Badge>
      </div>

      {/* Update alert */}
      <Alert className={cn(
        updateStatus === 'failed' && 'border-destructive',
        updateStatus === 'success' && 'border-green-500'
      )}>
        <RefreshCw className={cn(
          'h-4 w-4',
          isUpdating && 'animate-spin'
        )} />
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          {updateStatus === 'pending' && (
            <>
              A new version of the app is available.
              {countdown > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Auto-updating in {countdown} second{countdown !== 1 ? 's' : ''}...
                </div>
              )}
            </>
          )}
          {updateStatus === 'updating' && (
            'Downloading update...'
          )}
          {updateStatus === 'success' && (
            'Update downloaded! Reloading app...'
          )}
          {updateStatus === 'failed' && (
            'Update failed. Please try again or reload manually.'
          )}
        </AlertDescription>

        {/* Action buttons */}
        {updateStatus === 'pending' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              <Download className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            {onSkip && countdown > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSkip}
              >
                Later
              </Button>
            )}
          </div>
        )}

        {updateStatus === 'failed' && (
          <Button
            size="sm"
            onClick={handleUpdate}
            className="mt-3"
          >
            Retry Update
          </Button>
        )}
      </Alert>

      {/* Rollback notice */}
      {showRollbackNotice && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Previous update failed. App has been rolled back to v{currentVersion}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Hook for service worker update detection
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [currentVersion, setCurrentVersion] = React.useState<string>('');
  const [availableVersion, setAvailableVersion] = React.useState<string>('');
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Get current version from package.json or manifest
      const pkgVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
      setCurrentVersion(pkgVersion);

      // Register service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          setRegistration(reg);

          // Check for updates periodically (every hour)
          const interval = setInterval(() => {
            reg.update();
          }, 60 * 60 * 1000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available
                  setUpdateAvailable(true);
                  setAvailableVersion(getNewVersion(pkgVersion));
                }
              });
            }
          });

          return () => clearInterval(interval);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const update = React.useCallback(async () => {
    if (registration && registration.waiting) {
      // Tell waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload will happen automatically when service worker activates
      return new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve();
        });
      });
    }
  }, [registration]);

  const skip = React.useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    currentVersion,
    availableVersion,
    update,
    skip,
  };
}

/**
 * Get new version (increment patch version)
 */
function getNewVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[2] || '0', 10) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}
