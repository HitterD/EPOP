'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/utils/format'
import { usePresignedUploadFlow } from '@/lib/api/hooks/use-files'
import { toast } from 'sonner'

interface FileUploadItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'scanning' | 'ready' | 'error'
  error?: string
  fileId?: string
}

interface FileUploadZoneProps {
  onUploadComplete?: (fileIds: string[]) => void
  onUpload?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  contextType?: string
  contextId?: string
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function FileUploadZone({
  onUploadComplete,
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept,
  contextType,
  contextId,
  placeholder,
  multiple,
  disabled,
  className,
}: FileUploadZoneProps) {
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([])
  const { mutateAsync: uploadFile } = usePresignedUploadFlow()

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      // Validate max files
      if (uploadQueue.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Add files to queue
      const newItems: FileUploadItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending',
      }))

      setUploadQueue((prev) => [...prev, ...newItems])

      // Upload files sequentially
      for (const item of newItems) {
        try {
          // Update status to uploading
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i))
          )

          // Upload with progress tracking
          const result = await uploadFile({
            file: item.file,
            ...(contextType ? { contextType } : {}),
            ...(contextId ? { contextId } : {}),
            onProgress: (progress) => {
              setUploadQueue((prev) =>
                prev.map((i) =>
                  i.id === item.id ? { ...i, progress: Math.round(progress) } : i
                )
              )
            },
          })

          // Update to scanning
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'scanning', fileId: result.id, progress: 100 }
                : i
            )
          )

          // Simulate scanning delay (actual scanning happens on backend)
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Update to ready
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: 'ready' } : i
            )
          )

          toast.success(`${item.file.name} uploaded successfully`)
        } catch (error) {
          setUploadQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : i
            )
          )
          toast.error(`Failed to upload ${item.file.name}`)
        }
      }

      // Notify parent of completed uploads
      const completedFiles = uploadQueue
        .filter((item) => item.status === 'ready' && item.fileId)
        .map((item) => item.fileId!)

      if (completedFiles.length > 0) {
        onUploadComplete?.(completedFiles)
      }
    },
    [uploadQueue, maxFiles, uploadFile, contextType, contextId, onUploadComplete]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (files.length === 0) return
      onUpload?.(files)
      void handleFilesAdded(files)
    },
    [onUpload, handleFilesAdded]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesAdded,
    maxFiles,
    maxSize,
    ...(accept ? { accept } : {}),
    ...(typeof multiple === 'boolean' ? { multiple } : {}),
    ...(typeof disabled === 'boolean' ? { disabled } : {}),
  })

  const removeFile = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const retryUpload = async (item: FileUploadItem) => {
    setUploadQueue((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i
        const { error, ...rest } = i
        return { ...rest, status: 'pending', progress: 0 }
      })
    )

    await handleFilesAdded([item.file])
  }

  const clearCompleted = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status !== 'ready'))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400',
          (uploadQueue.some((i) => i.status === 'uploading') || disabled) && 'pointer-events-none opacity-50'
        )}
      >
        <input
          data-testid="file-input"
          {...getInputProps({ onChange: handleInputChange, multiple, disabled })}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary-100 dark:bg-primary-900/20 p-4">
            <Upload data-testid="upload-icon" size={32} className="text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {placeholder || (isDragActive ? 'Drop files here' : 'Drag & drop files here')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              or click to browse • Max {maxFiles} files • {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Uploads ({uploadQueue.filter((i) => i.status === 'ready').length}/
              {uploadQueue.length})
            </h3>
            {uploadQueue.some((i) => i.status === 'ready') && (
              <Button size="sm" variant="ghost" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadQueue.map((item) => (
              <FileUploadItem
                key={item.id}
                item={item}
                onRemove={() => removeFile(item.id)}
                onRetry={() => retryUpload(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual file upload item component
function FileUploadItem({
  item,
  onRemove,
  onRetry,
}: {
  item: FileUploadItem
  onRemove: () => void
  onRetry: () => void
}) {
  const statusConfig = {
    pending: {
      icon: <Loader2 size={16} className="animate-spin text-gray-400" />,
      text: 'Pending...',
      color: 'text-gray-600',
    },
    uploading: {
      icon: <Loader2 size={16} className="animate-spin text-blue-500" />,
      text: `Uploading ${item.progress}%`,
      color: 'text-blue-600',
    },
    scanning: {
      icon: <Loader2 size={16} className="animate-spin text-yellow-500" />,
      text: 'Scanning...',
      color: 'text-yellow-600',
    },
    ready: {
      icon: <CheckCircle size={16} className="text-green-500" />,
      text: 'Ready',
      color: 'text-green-600',
    },
    error: {
      icon: <AlertCircle size={16} className="text-red-500" />,
      text: 'Failed',
      color: 'text-red-600',
    },
  }

  const config = statusConfig[item.status]

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* File icon */}
      <div className="flex-shrink-0">
        <File size={20} className="text-gray-400" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{item.file.name}</p>
          <div className="flex items-center gap-2">
            {config.icon}
            <span className={cn('text-xs font-medium', config.color)}>{config.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
          {item.error && (
            <p className="text-xs text-red-500 truncate">• {item.error}</p>
          )}
        </div>

        {/* Progress bar */}
        {(item.status === 'uploading' || item.status === 'scanning') && (
          <Progress value={item.progress} className="h-1 mt-2" />
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {item.status === 'error' && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        )}
        {item.status !== 'uploading' && item.status !== 'scanning' && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onRemove}>
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}
