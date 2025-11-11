import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PushPermissionPromptProps {
  onAllow: () => void;
  onDeny: () => void;
  onDefer: () => void;
  autoShow?: boolean;
}

export function PushPermissionPrompt({
  onAllow,
  onDeny,
  onDefer,
  autoShow = true,
}: PushPermissionPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<
    'default' | 'granted' | 'denied'
  >('default');

  useEffect(() => {
    // Check current permission state
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }

    // Show prompt based on conditions
    if (autoShow && shouldShowPrompt()) {
      // Delay showing to avoid blocking initial render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoShow]);

  const shouldShowPrompt = (): boolean => {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'default') return false;

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('push-permission-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) return false;
    }

    // Check if user has engaged enough
    const visitCount = parseInt(
      localStorage.getItem('visit-count') || '0',
      10
    );
    const sessionTime = parseInt(
      localStorage.getItem('session-time') || '0',
      10
    );

    // Show after 3 visits or 5 minutes of session time
    return visitCount >= 3 || sessionTime >= 300000;
  };

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        localStorage.removeItem('push-permission-dismissed');
        onAllow();
        setIsOpen(false);
      } else if (permission === 'denied') {
        onDeny();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      onDeny();
      setIsOpen(false);
    }
  };

  const handleDefer = () => {
    localStorage.setItem('push-permission-dismissed', new Date().toISOString());
    onDefer();
    setIsOpen(false);
  };

  const handleDeny = () => {
    localStorage.setItem(
      'push-permission-dismissed',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    ); // Don't show for 30 days
    onDeny();
    setIsOpen(false);
  };

  // If permission already granted or denied, don't show
  if (permissionState !== 'default') {
    return null;
  }

  // If browser doesn't support notifications
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Stay updated with notifications</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <p>Get notified about:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Mentions and direct messages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Project assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Important updates</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground pt-2">
              You can change this later in settings.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleDefer}>
            Not now
          </Button>
          <Button onClick={handleAllow}>Enable Notifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for showing instructions when permission is denied
export function PushPermissionDenied() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'denied') {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="p-4 rounded-lg border border-yellow-500 bg-yellow-500/10">
      <div className="flex items-start gap-3">
        <BellOff className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <h4 className="font-medium text-sm">Notifications blocked</h4>
          <p className="text-sm text-muted-foreground">
            To enable notifications, please update your browser settings:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 ml-2">
            <li>Click the lock icon in the address bar</li>
            <li>Find "Notifications" in the permissions list</li>
            <li>Change the setting to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Lightweight banner version for mobile/inline use
export function PushPermissionBanner({
  onAllow,
  onDeny,
}: {
  onAllow: () => void;
  onDeny: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onAllow();
        setShow(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    onDeny();
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md',
        'p-4 rounded-lg border bg-card shadow-lg z-50'
      )}
      role="dialog"
      aria-label="Enable push notifications"
    >
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <h4 className="font-medium text-sm">Enable push notifications?</h4>
          <p className="text-sm text-muted-foreground">
            Stay updated with mentions and important updates
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleAllow}>
              Enable
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
