export type FileUploadState = 'idle' | 'dragover' | 'uploading' | 'error' | 'success';
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress?: number;
  uploadState?: FileUploadState;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt?: Date;
  error?: string;
}

export interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
  fileCount?: number;
}

export interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export interface FileUploadQueueProps {
  files: FileItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
}

export interface FileListProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  loading?: boolean;
}

export interface FilePreviewModalProps {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export interface FolderTreeProps {
  folders: FolderNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export interface StorageQuotaProps {
  used: number;
  total: number;
}
