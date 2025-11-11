import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { InstallPromptProps } from '@/types/notifications';

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-background border rounded-lg shadow-lg">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install EPop</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Install our app for a better experience
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onInstall}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
