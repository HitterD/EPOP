import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ServiceWorkerUpdateProps } from '@/types/notifications';

export function ServiceWorkerUpdate({ onUpdate, onDismiss }: ServiceWorkerUpdateProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md p-4 bg-background border rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Update Available</p>
          <p className="text-sm text-muted-foreground">
            A new version is ready
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onUpdate}>
            Update
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
