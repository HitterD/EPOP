import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PendingAction {
  id: string;
  type: 'message' | 'file' | 'project' | 'task';
  description: string;
  timestamp: Date;
  retryCount: number;
  error?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'failed';

interface SyncStatusIndicatorProps {
  pendingActions: PendingAction[];
  syncStatus: SyncStatus;
  onRetry?: (actionId?: string) => void;
  onRetryAll?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function SyncStatusIndicator({
  pendingActions,
  syncStatus,
  onRetry,
  onRetryAll,
  position = 'bottom-right',
}: SyncStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasPending = pendingActions.length > 0;
  const hasErrors = pendingActions.some((action) => action.error);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (syncStatus === 'success') {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  // Hide when no pending actions and not showing success
  if (!hasPending && !showSuccess) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getIcon = () => {
    if (syncStatus === 'success' && showSuccess) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (syncStatus === 'failed' || hasErrors) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (syncStatus === 'syncing') {
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    }
    return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
  };

  const getBadgeColor = () => {
    if (syncStatus === 'success' && showSuccess) {
      return 'bg-green-500';
    }
    if (syncStatus === 'failed' || hasErrors) {
      return 'bg-red-500';
    }
    if (syncStatus === 'syncing') {
      return 'bg-blue-500';
    }
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (syncStatus === 'success' && showSuccess) {
      return 'All changes synced';
    }
    if (syncStatus === 'failed') {
      return 'Sync failed';
    }
    if (syncStatus === 'syncing') {
      return `Syncing... (${pendingActions.length})`;
    }
    return `${pendingActions.length} pending`;
  };

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-200',
        getPositionClasses()
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <Popover open={isExpanded} onOpenChange={setIsExpanded}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 shadow-lg',
              hasErrors && 'border-red-500',
              syncStatus === 'syncing' && 'border-blue-500'
            )}
            aria-label={getStatusText()}
          >
            {getIcon()}
            <span className="text-xs font-medium">{getStatusText()}</span>
            {hasPending && (
              <span
                className={cn(
                  'flex h-2 w-2 rounded-full',
                  getBadgeColor(),
                  syncStatus === 'syncing' && 'animate-pulse'
                )}
              />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-80 p-4"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Pending Actions</h4>
              {hasPending && onRetryAll && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRetryAll}
                  className="h-7 text-xs"
                >
                  Retry All
                </Button>
              )}
            </div>

            {pendingActions.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                All changes synced
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {pendingActions.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    onRetry={onRetry}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Individual pending action item
function ActionItem({
  action,
  onRetry,
}: {
  action: PendingAction;
  onRetry?: (actionId: string) => void;
}) {
  const getTypeIcon = () => {
    switch (action.type) {
      case 'message':
        return '💬';
      case 'file':
        return '📎';
      case 'project':
        return '📋';
      case 'task':
        return '✓';
      default:
        return '📄';
    }
  };

  const timeAgo = () => {
    const seconds = Math.floor(
      (Date.now() - action.timestamp.getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-2 rounded border text-sm',
        action.error && 'border-red-500 bg-red-500/5'
      )}
    >
      <span className="text-base flex-shrink-0">{getTypeIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{action.description}</p>
        {action.error ? (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-600 truncate">{action.error}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">{timeAgo()}</p>
        )}
        {action.retryCount > 0 && (
          <p className="text-xs text-yellow-600 mt-1">
            Retry attempt {action.retryCount}/3
          </p>
        )}
      </div>
      {action.error && onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRetry(action.id)}
          className="h-6 w-6 p-0 flex-shrink-0"
          aria-label={`Retry ${action.description}`}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Compact version for header/toolbar
export function CompactSyncIndicator({
  pendingCount,
  syncStatus,
  onClick,
}: {
  pendingCount: number;
  syncStatus: SyncStatus;
  onClick?: () => void;
}) {
  if (pendingCount === 0 && syncStatus !== 'syncing') {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-2 h-8 px-2"
      aria-label={`${pendingCount} pending actions`}
    >
      {syncStatus === 'syncing' ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : syncStatus === 'failed' ? (
        <XCircle className="h-4 w-4 text-red-600" />
      ) : (
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      )}
      {pendingCount > 0 && (
        <span className="text-xs">{pendingCount}</span>
      )}
    </Button>
  );
}

// Hook for managing sync state
export function useSyncStatus() {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const addPendingAction = (
    action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    const newAction: PendingAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      retryCount: 0,
    };
    setPendingActions((prev) => [...prev, newAction]);
  };

  const removePendingAction = (actionId: string) => {
    setPendingActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  const updateActionError = (actionId: string, error: string) => {
    setPendingActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, error } : a))
    );
  };

  const incrementRetryCount = (actionId: string) => {
    setPendingActions((prev) =>
      prev.map((a) =>
        a.id === actionId ? { ...a, retryCount: a.retryCount + 1, error: undefined } : a
      )
    );
  };

  const syncAll = async () => {
    if (pendingActions.length === 0) return;

    setSyncStatus('syncing');

    try {
      // Simulate sync - replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear all pending actions
      setPendingActions([]);
      setSyncStatus('success');

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      setSyncStatus('failed');
      console.error('Sync failed:', error);
    }
  };

  const retryAction = async (actionId: string) => {
    const action = pendingActions.find((a) => a.id === actionId);
    if (!action) return;

    incrementRetryCount(actionId);
    setSyncStatus('syncing');

    try {
      // Simulate retry - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      removePendingAction(actionId);
      setSyncStatus('success');

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      updateActionError(actionId, 'Retry failed. Check connection.');
      setSyncStatus('failed');
    }
  };

  return {
    pendingActions,
    syncStatus,
    addPendingAction,
    removePendingAction,
    syncAll,
    retryAction,
  };
}
