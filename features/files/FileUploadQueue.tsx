import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, RotateCw, CheckCircle, AlertCircle, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileUploadQueueProps } from '@/types/files';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export function FileUploadQueue({ files, onCancel, onRetry, onClear }: FileUploadQueueProps) {
  if (files.length === 0) return null;

  const uploadingCount = files.filter((f) => f.uploadState === 'uploading').length;
  const errorCount = files.filter((f) => f.uploadState === 'error').length;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Upload Queue ({files.length} files)
          {uploadingCount > 0 && ` - ${uploadingCount} uploading`}
          {errorCount > 0 && ` - ${errorCount} failed`}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'flex items-center gap-3 p-3 border rounded',
              file.uploadState === 'error' && 'border-destructive bg-destructive/5'
            )}
          >
            <FileIcon className="h-8 w-8 flex-shrink-0 text-muted-foreground" />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
              
              {file.uploadState === 'uploading' && file.uploadProgress !== undefined && (
                <div className="mt-2">
                  <Progress value={file.uploadProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.uploadProgress}%
                  </p>
                </div>
              )}
              
              {file.uploadState === 'error' && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {file.error}
                </p>
              )}
              
              {file.uploadState === 'success' && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Uploaded successfully
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {file.uploadState === 'error' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetry(file.id)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(file.id)}
                disabled={file.uploadState === 'uploading'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
