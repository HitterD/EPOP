# File Storage UI (MinIO/Synology)

## Overview

The File Storage UI provides comprehensive file management with support for MinIO (primary) and Synology NAS (optional). Features include bulk operations, version history, context tracking (chat/task/mail origin), and virtualized list rendering for performance.

## Features

### Wave-1 (✅ COMPLETE)
- **Bulk Selection**: Multi-select files with checkboxes
- **Bulk Actions Bar**: Download/Delete multiple files at once
- **Context Origin Display**: Shows where file was uploaded (💬 Chat, ✓ Task, 📧 Mail)
- **Version Info**: Display file version number
- **View Modes**: Grid and List view with toggle
- **Virtualized List**: Efficient rendering for 10k+ files
- **Search**: Client-side filtering by filename
- **Upload Progress**: Real-time progress indicator

### Wave-2 (Planned)
- **Version History Modal**: View and restore previous versions
- **Bulk Download**: ZIP multiple files for download
- **Retention Tags**: Apply retention policies (30d, 90d, 1y, permanent)
- **File Preview Enhancement**: Inline preview for more file types
- **Advanced Search**: Filter by type, size, date, uploader

### Wave-3 (Planned)
- **Synology Integration**: Toggle between MinIO and Synology storage
- **Folder Organization**: Create folders, move files
- **File Sharing**: Generate shareable links with expiry
- **Access Control**: Per-file permissions management

## File Locations

```
app/(shell)/files/page.tsx             # Main files page
features/files/components/             # File-specific components
lib/api/hooks/use-files.ts            # File API hooks
```

## Usage

### Uploading Files

1. Click "Upload Files" button
2. Select file from system dialog
3. Monitor progress indicator
4. File appears in list after successful upload

### Bulk Operations

1. Check boxes next to files you want to select
2. Bulk actions bar appears showing selection count
3. Click "Download" or "Delete" to perform action
4. Click "Clear" to deselect all

### View Switching

- **Grid View**: Card-based layout, good for visual browsing
- **List View**: Compact table layout with more details, virtualized for performance

### Context Origin

Files display badges indicating where they were uploaded:
- 💬 Chat: Uploaded in a chat message
- ✓ Task: Attached to a task
- 📧 Mail: Attached to an email

## Backend Contract

### File Upload (Presigned URL)

```
POST /api/v1/files/presign
Body:
{
  fileName: string,
  fileSize: number,
  mimeType: string,
  context: {
    type: 'chat' | 'task' | 'mail' | 'general',
    id?: string
  }
}

Response:
{
  fileId: string,
  uploadUrl: string,
  expiresAt: string
}

---

POST /api/v1/files/:id/confirm
Body:
{
  uploadedSize: number
}

Response:
{
  file: { /* Full file object */ }
}
```

### File List

```
GET /api/v1/files
Query Params:
  - cursor?: string
  - limit?: number (default: 50)
  - contextType?: 'chat' | 'task' | 'mail' | 'general'
  - search?: string

Response:
{
  items: Array<{
    id: string,
    name: string,
    size: number,
    mimeType: string,
    version: number,
    uploadedBy: string,
    createdAt: string,
    context: {
      type: 'chat' | 'task' | 'mail' | 'general',
      id: string,
      name: string
    }
  }>,
  nextCursor?: string,
  total: number
}
```

### Version History (Wave-2)

```
GET /api/v1/files/:id/versions

Response:
{
  versions: Array<{
    version: number,
    size: number,
    uploadedAt: string,
    uploadedBy: string,
    downloadUrl: string
  }>
}

---

POST /api/v1/files/:id/restore
Body:
{
  version: number
}

Response:
{
  file: { /* Updated file object */ }
}
```

### Bulk Operations (Wave-2)

```
POST /api/v1/files/bulk-download
Body:
{
  fileIds: string[]
}

Response:
{
  zipUrl: string,
  expiresAt: string,
  size: number
}

---

POST /api/v1/files/bulk-delete
Body:
{
  fileIds: string[]
}

Response:
{
  deleted: number,
  failed: Array<{ fileId: string, reason: string }>
}
```

### Retention Management (Wave-2)

```
PUT /api/v1/files/:id/retention
Body:
{
  policy: '30d' | '90d' | '1y' | 'permanent'
}

Response:
{
  file: {
    id: string,
    retentionPolicy: string,
    expiresAt?: string
  }
}
```

## Component Architecture

### State Management

```typescript
// Core state
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
const [searchQuery, setSearchQuery] = useState('')
const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
const [showBulkActions, setShowBulkActions] = useState(false)

// API state
const { data, hasNextPage, fetchNextPage } = useFiles()
const uploadFlow = usePresignedUploadFlow()
```

### Bulk Selection Logic

```typescript
const toggleFileSelection = (fileId: string) => {
  setSelectedFiles((prev) => {
    const newSet = new Set(prev)
    if (newSet.has(fileId)) {
      newSet.delete(fileId)
    } else {
      newSet.add(fileId)
    }
    setShowBulkActions(newSet.size > 0)
    return newSet
  })
}

const selectAll = () => {
  if (selectedFiles.size === files.length) {
    setSelectedFiles(new Set())
    setShowBulkActions(false)
  } else {
    setSelectedFiles(new Set(files.map(f => f.id)))
    setShowBulkActions(true)
  }
}
```

### Upload Flow

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  try {
    setUploading(true)
    setProgress(0)
    
    await uploadFlow.mutateAsync({
      file,
      onProgress: (p) => setProgress(Math.round(p))
    })
    
    toast.success('File uploaded successfully')
  } catch (err) {
    toast.error(err?.message || 'Upload failed')
  } finally {
    setUploading(false)
    setProgress(0)
  }
}
```

## Virtualization

List view uses TanStack Virtual for efficient rendering:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const listParentRef = useRef<HTMLDivElement>(null)

const listVirtualizer = useVirtualizer({
  count: files.length,
  getScrollElement: () => listParentRef.current,
  estimateSize: () => 88, // Row height
  overscan: 8, // Render 8 items beyond viewport
})

// Render only visible items
<div style={{ height: listVirtualizer.getTotalSize() }}>
  {listVirtualizer.getVirtualItems().map((virtualRow) => {
    const file = files[virtualRow.index]
    return (
      <div
        key={virtualRow.key}
        style={{
          position: 'absolute',
          transform: `translateY(${virtualRow.start}px)`,
          height: virtualRow.size
        }}
      >
        {/* File row content */}
      </div>
    )
  })}
</div>
```

## File Type Icons

```typescript
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.includes('pdf')) return FileTextIcon
  if (mimeType.includes('video/')) return VideoIcon
  if (mimeType.includes('audio/')) return MusicIcon
  return FileIcon
}
```

## Storage Backend Selection (Wave-3)

### MinIO (Default)
- Self-hosted S3-compatible storage
- Used for all deployments by default
- Presigned URLs for direct upload

### Synology (Optional)
- Enterprise NAS integration
- Shown as storage location in UI when active
- Fallback to MinIO if unavailable

```typescript
const storageBackend = useStorageBackend()

// UI shows current backend
<Badge variant="outline">
  Storage: {storageBackend === 'synology' ? 'Synology NAS' : 'MinIO'}
</Badge>
```

## Performance Optimizations

### Lazy Loading
- Files loaded in pages of 50
- Infinite scroll triggers `fetchNextPage()`
- Cursor-based pagination for efficiency

### Client-side Search
- Search filters already-loaded files
- No API call until search is cleared and more pages needed
- Debounced for smoother UX (if needed)

### Image Optimization
- Thumbnails generated on backend
- Lazy-load thumbnails as they scroll into view
- WebP format with fallback to JPEG

## Accessibility

- **Keyboard Navigation**: Tab through files, Space to select
- **Screen Reader**: 
  - Announces selection count
  - Describes file type and size
  - Upload progress announced
- **Focus Indicators**: Clear visual focus on all interactive elements
- **ARIA Labels**: All icons have descriptive labels

## Testing

### Unit Tests

```typescript
describe('Bulk selection', () => {
  it('selects individual files', () => {
    const { result } = renderHook(() => useFileSelection())
    
    act(() => result.current.toggleFileSelection('file-1'))
    
    expect(result.current.selectedFiles.has('file-1')).toBe(true)
  })
  
  it('selects all files', () => {
    const files = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const { result } = renderHook(() => useFileSelection(files))
    
    act(() => result.current.selectAll())
    
    expect(result.current.selectedFiles.size).toBe(3)
  })
})
```

### E2E Tests

```typescript
test('File upload and selection', async ({ page }) => {
  await page.goto('/files')
  
  // Upload file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-file.pdf')
  
  // Wait for upload
  await page.waitForSelector('[data-testid="file-card-test-file.pdf"]')
  
  // Select file
  await page.check('[data-testid="checkbox-test-file.pdf"]')
  await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()
  
  // Bulk delete
  await page.click('[data-testid="btn-bulk-delete"]')
  await page.click('[data-testid="btn-confirm-delete"]')
  await expect(page.locator('[data-testid="file-card-test-file.pdf"]'))
    .not.toBeVisible()
})
```

## Security Considerations

### Presigned URLs
- URLs expire after 15 minutes
- One-time use only
- Size validation before upload

### Access Control
- Files inherit permissions from context (chat/task/mail)
- Download URLs include auth token
- Backend validates user access before serving

### Virus Scanning (Future)
- ClamAV integration for uploaded files
- Quarantine suspicious files
- Notify uploader of scan results

## Related Documentation

- [File Preview Modal](./FILE_PREVIEW.md)
- [MinIO Configuration](../backend/storage.md)
- [Virtualization Guide](./virtualization.md)
- [Performance Best Practices](./performance.md)
