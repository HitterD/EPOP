# File Management Feature

## Overview
Upload, preview, and organize files with context linking to chats, projects, and mail.

## Implementation Status
- ✅ FE-4: Cursor pagination on file lists
- ✅ FE-11: Presigned upload direct to MinIO with status tracking

## Routes
- `/files` - File browser with grid/list view
- `/files/[fileId]` - File preview/detail

## Components

### FileBrowser
- Grid/list toggle
- Sort by name, date, size
- Filter by type, context
- Search files

### FileCard
- Thumbnail preview
- File name, size, date
- Context badge (chat/project/mail)
- Actions menu

### FileUploadZone
- Drag-drop upload
- Progress indicator
- Multiple file support
- Size validation (10MB limit)

## Presigned Upload Flow (FE-11)

### Complete Flow Hook
```typescript
const { mutate: uploadFile, isLoading } = usePresignedUploadFlow()

uploadFile({
  file,
  contextType: 'chat',
  contextId: chatId,
  onProgress: (progress) => setProgress(progress)
})
```

### Manual 3-Step Flow
```typescript
// Step 1: Get presigned URL
const { mutateAsync: getPresigned } = usePresignedUpload()
const { fileId, uploadUrl, fields } = await getPresigned({
  fileName: file.name,
  fileSize: file.size,
  mimeType: file.type,
  contextType: 'project',
  contextId: projectId
})

// Step 2: Upload directly to MinIO
const { mutateAsync: upload } = useDirectUpload()
await upload({
  file,
  uploadUrl,
  fields,
  onProgress: (p) => console.log(`${p}%`)
})

// Step 3: Confirm with backend
const { mutateAsync: confirm } = useConfirmUpload()
const fileItem = await confirm(fileId)
```

### File Status Lifecycle
- `pending` - Upload in progress
- `scanning` - Antivirus scan (optional ClamAV)
- `ready` - File available
- `infected` - Blocked by AV
- `failed` - Upload/scan failed

### Listen to File Events
```typescript
// Real-time status updates
socket.on('file:uploaded', (event: FileEvent) => {})
socket.on('file:ready', (event: FileEvent) => {})
socket.on('file:scan_complete', (event: FileEvent) => {})
```

## API Endpoints

- `GET /api/files` - List files (cursor paginated)
- `POST /api/files/presign` - Get presigned URL
- `POST /api/files/:id/confirm` - Confirm upload
- `GET /api/files/[fileId]` - File metadata
- `DELETE /api/files/[fileId]` - Delete file
