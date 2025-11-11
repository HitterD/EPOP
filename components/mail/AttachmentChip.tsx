import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Image as ImageIcon, File, X, RotateCw, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttachmentChipProps } from '@/types/mail';

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf' || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export function AttachmentChip({
  file,
  onRemove,
  onRetry,
  onPreview,
}: AttachmentChipProps) {
  const Icon = getFileIcon(file.type);
  const isUploading = file.uploadProgress !== undefined && file.uploadProgress < 100;
  const hasError = !!file.error;
  const isComplete = file.uploadProgress === 100 || (!file.uploadProgress && !hasError);

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded border transition-colors',
        hasError && 'border-destructive bg-destructive/5',
        isComplete && 'border-border hover:bg-accent/50'
      )}
    >
      <Icon className={cn(
        'h-4 w-4 flex-shrink-0',
        hasError && 'text-destructive'
      )} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {isUploading && (
            <>
              <Progress 
                value={file.uploadProgress} 
                className="h-1 flex-1"
                aria-label={`Uploading ${file.name}`}
              />
              <span className="text-xs text-muted-foreground">
                {file.uploadProgress}%
              </span>
            </>
          )}
          
          {hasError && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {file.error}
            </span>
          )}
          
          {isComplete && !hasError && (
            <CheckCircle className="h-3 w-3 text-green-600" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {hasError && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onRetry}
            aria-label={`Retry upload ${file.name}`}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
        )}
        
        {isComplete && onPreview && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onPreview}
            aria-label={`Preview ${file.name}`}
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          disabled={isUploading}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
