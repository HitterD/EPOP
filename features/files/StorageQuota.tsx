import React from 'react';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';
import type { StorageQuotaProps } from '@/types/files';

const formatStorage = (bytes: number): string => {
  const gb = bytes / 1024 / 1024 / 1024;
  return gb.toFixed(2) + ' GB';
};

export function StorageQuota({ used, total }: StorageQuotaProps) {
  const percentage = (used / total) * 100;

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Storage</h3>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-sm text-muted-foreground">
        {formatStorage(used)} of {formatStorage(total)} used ({percentage.toFixed(1)}%)
      </p>
    </div>
  );
}
