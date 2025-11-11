import type { FileItem, FolderNode } from '@/types/files';

export const mockFiles: FileItem[] = [
  {
    id: 'f1',
    name: 'presentation.pdf',
    size: 5242880,
    type: 'application/pdf',
    uploadProgress: 100,
    uploadState: 'success',
    url: '/files/presentation.pdf',
    uploadedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'f2',
    name: 'design-mockup.png',
    size: 2097152,
    type: 'image/png',
    uploadProgress: 100,
    uploadState: 'success',
    url: '/files/design-mockup.png',
    thumbnailUrl: 'https://via.placeholder.com/150',
    uploadedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'f3',
    name: 'video-tutorial.mp4',
    size: 52428800,
    type: 'video/mp4',
    uploadProgress: 45,
    uploadState: 'uploading',
  },
  {
    id: 'f4',
    name: 'spreadsheet.xlsx',
    size: 1048576,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadProgress: 0,
    uploadState: 'error',
    error: 'Upload failed',
  },
];

export const mockFolders: FolderNode[] = [
  {
    id: 'root',
    name: 'My Files',
    fileCount: 24,
    children: [
      {
        id: 'documents',
        name: 'Documents',
        fileCount: 12,
        children: [
          { id: 'reports', name: 'Reports', fileCount: 5 },
          { id: 'invoices', name: 'Invoices', fileCount: 7 },
        ],
      },
      {
        id: 'images',
        name: 'Images',
        fileCount: 8,
      },
      {
        id: 'videos',
        name: 'Videos',
        fileCount: 4,
      },
    ],
  },
];

export const STORAGE_QUOTA = {
  used: 15728640000, // 15GB
  total: 107374182400, // 100GB
};
