import React, { useState, useCallback } from 'react';
import { Upload, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileUploadZoneProps } from '@/types/files';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default

export function FileUploadZone({
  onFilesSelected,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = [],
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const validFiles: File[] = [];
      
      for (const file of files) {
        if (file.size > maxSize) {
          setError(`${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
          continue;
        }
        
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
          setError(`${file.name} type not supported`);
          continue;
        }
        
        validFiles.push(file);
      }
      
      return validFiles;
    },
    [maxSize, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      if (disabled) return;
      
      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        setError(null);
        onFilesSelected(validFiles);
      }
    },
    [disabled, validateFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        setError(null);
        onFilesSelected(validFiles);
      }
      
      e.target.value = '';
    },
    [validateFiles, onFilesSelected]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:border-primary/50 cursor-pointer'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      role="button"
      aria-label="Upload files"
      tabIndex={disabled ? -1 : 0}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={disabled}
        accept={acceptedTypes.join(',')}
      />
      
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum file size: {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-destructive">
          <FileWarning className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
