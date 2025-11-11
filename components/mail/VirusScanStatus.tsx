/**
 * Virus Scan Status Component
 * 
 * Displays virus scan status for email attachments
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Loader2,
  Download,
  AlertTriangle,
} from 'lucide-react';

export type ScanStatus = 'pending' | 'scanning' | 'clean' | 'threat' | 'failed';

export interface VirusScanStatusProps {
  status: ScanStatus;
  fileName: string;
  fileSize?: number;
  threatDetails?: string;
  allowedTypes?: string[];
  fileType?: string;
  onDownload?: () => void;
  className?: string;
}

export function VirusScanStatus({
  status,
  fileName,
  fileSize,
  threatDetails,
  allowedTypes,
  fileType,
  onDownload,
  className,
}: VirusScanStatusProps) {
  const config = getStatusConfig(status);
  const isAllowedType = !allowedTypes || !fileType || allowedTypes.includes(fileType);

  return (
    <div className={cn('space-y-2', className)}>
      {/* File info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium truncate">{fileName}</span>
        {fileSize && (
          <span className="text-xs text-muted-foreground">
            ({formatFileSize(fileSize)})
          </span>
        )}
      </div>

      {/* Scan status */}
      <div className="flex items-center gap-2">
        <config.Icon className={cn('h-4 w-4', config.iconColor)} />
        <span className={cn('text-sm', config.textColor)}>
          {config.label}
        </span>
        {status === 'scanning' && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* File type allowlist */}
      {allowedTypes && (
        <div className="flex items-center gap-2">
          {isAllowedType ? (
            <Badge variant="outline" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Allowed type: {fileType?.toUpperCase()}
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <ShieldX className="h-3 w-3 mr-1" />
              Not allowed: {fileType?.toUpperCase()}
            </Badge>
          )}
        </div>
      )}

      {/* Threat details */}
      {status === 'threat' && threatDetails && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Threat detected:</strong> {threatDetails}
            <br />
            Download has been blocked for your safety.
          </AlertDescription>
        </Alert>
      )}

      {/* Failed scan warning */}
      {status === 'failed' && (
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            Scan failed. Download at your own risk.
          </AlertDescription>
        </Alert>
      )}

      {/* Download button */}
      {status === 'clean' && isAllowedType && onDownload && (
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      )}

      {/* Blocked download */}
      {(status === 'threat' || !isAllowedType) && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-md">
          <ShieldX className="h-4 w-4" />
          Download blocked
        </div>
      )}
    </div>
  );
}

/**
 * Get configuration for each status
 */
function getStatusConfig(status: ScanStatus) {
  const configs = {
    pending: {
      Icon: Shield,
      label: 'Scan pending',
      iconColor: 'text-muted-foreground',
      textColor: 'text-muted-foreground',
    },
    scanning: {
      Icon: Shield,
      label: 'Scanning for viruses...',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-700',
    },
    clean: {
      Icon: ShieldCheck,
      label: 'Virus scan: Clean',
      iconColor: 'text-green-500',
      textColor: 'text-green-700',
    },
    threat: {
      Icon: ShieldAlert,
      label: 'Virus scan: Threat detected',
      iconColor: 'text-red-500',
      textColor: 'text-red-700',
    },
    failed: {
      Icon: ShieldX,
      label: 'Virus scan: Failed',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-700',
    },
  };

  return configs[status];
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Hook for virus scan simulation
 */
export function useVirusScan(fileId: string | null) {
  const [status, setStatus] = React.useState<ScanStatus>('pending');
  const [threatDetails, setThreatDetails] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!fileId) {
      setStatus('pending');
      return;
    }

    // Start scanning
    setStatus('scanning');

    // Simulate scan (2 seconds)
    const timer = setTimeout(() => {
      // 95% clean, 5% threat (for demo)
      const isThreat = Math.random() < 0.05;
      
      if (isThreat) {
        setStatus('threat');
        setThreatDetails('Trojan.Generic.12345678');
      } else {
        setStatus('clean');
        setThreatDetails(undefined);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [fileId]);

  return {
    status,
    threatDetails,
  };
}
