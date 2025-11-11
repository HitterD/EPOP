import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 p-2 bg-destructive text-destructive-foreground text-sm"
    >
      <WifiOff className="h-4 w-4" />
      <p>You are offline. Some features may be unavailable.</p>
    </div>
  );
}
