# File Preview & Attachment UI Specification

## Objective
Provide seamless file preview and attachment management across Chat, Mail, and Files modules with direct MinIO presigned URL flow.

## User Roles
- **All Users**: Can upload, preview, download, and manage files within their permission scope
- **Admin**: Can manage organization-wide file policies and view analytics

## Implementation Status
- ✅ FE-11: Presigned upload flow (3-step: presign → upload → confirm)
- ✅ FE-11: File status lifecycle (pending/scanning/ready/infected/failed)
- 🔶 FE-11b: Preview UI (IN PROGRESS)
- ⬜ FE-11c: Attachment display in Chat/Mail (PENDING)

---

## Information Architecture

### Routes
- `/files` - File browser (grid/list view)
- `/files/[fileId]` - Full-page file preview with metadata sidebar
- `/files?context=chat&contextId=chat-123` - Files filtered by context
- `/files?context=mail&contextId=msg-456` - Mail attachments

### Component Hierarchy
```
FileBrowser
├── FileToolbar (search, filters, sort, view toggle)
├── FileGrid / FileList
│   └── FileCard
│       ├── FileThumbnail (preview icon/image)
│       ├── FileMetadata (name, size, date)
│       ├── ContextBadge (chat/mail/project)
│       └── FileActions (preview, download, delete)
└── FilePagination (infinite scroll)

FilePreviewModal
├── PreviewHeader (name, size, actions)
├── PreviewContent
│   ├── ImagePreview (jpg, png, gif, webp, svg)
│   ├── PDFPreview (react-pdf)
│   ├── VideoPreview (video tag)
│   ├── AudioPreview (audio tag)
│   └── UnsupportedPreview (download-only fallback)
└── PreviewSidebar (metadata, context, version history)

AttachmentPicker (for Chat/Mail compose)
├── FileUploadZone (drag-drop)
├── AttachmentList
│   └── AttachmentItem (with remove button, progress bar)
└── SelectFromFiles (browse existing files)

ChatMessageAttachments
└── AttachmentChip (inline preview thumbnail + download)

MailMessageAttachments
└── AttachmentCard (preview thumbnail + metadata)
```

---

## State Model (Zustand Slice)

### FileStore (`lib/stores/file-store.ts`)

```typescript
interface FileState {
  files: Map<string, FileItem>
  uploadQueue: Map<string, UploadProgress>
  previewFile: string | null
  
  // Actions
  setFiles(files: FileItem[]): void
  addFile(file: FileItem): void
  updateFile(id: string, patch: Partial<FileItem>): void
  removeFile(id: string): void
  
  // Upload queue
  addToQueue(tempId: string, progress: UploadProgress): void
  updateProgress(tempId: string, progress: number): void
  removeFromQueue(tempId: string): void
  
  // Preview
  setPreviewFile(id: string | null): void
}

interface UploadProgress {
  tempId: string
  file: File
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error'
  fileId?: string // Server-assigned ID after presign
  error?: string
}
```

---

## UX Flows

### Flow 1: Upload File via Attachment Picker (Chat/Mail)

**Trigger**: User drags file into compose area or clicks "Attach file"

**Steps**:
1. User drops file or selects from file picker
2. UI shows `AttachmentItem` with pending status and 0% progress
3. **Client calls** `usePresignedUploadFlow()`
   - Step 1: `POST /files/presign` → get `{ fileId, uploadUrl, fields }`
   - Step 2: Direct upload to MinIO via XHR with `onProgress` callback
   - Step 3: `POST /files/{fileId}/confirm` → backend marks as uploaded
4. Progress bar updates in real-time (0% → 100%)
5. Status changes: `pending` → `uploading` → `scanning` → `ready`
6. On `ready`, show thumbnail preview + file metadata
7. User continues composing message/mail with attachment IDs

**Optimistic Behavior**:
- File appears in attachment list immediately with `tempId`
- User can remove from queue before upload completes
- If upload fails, show error badge + retry button

**Edge Cases**:
- **File too large** (>10MB): Show error toast before upload starts
- **Unsupported MIME type**: Warn user but allow upload
- **Network failure**: Show retry button, keep file in queue
- **AV scan detects virus**: Status changes to `infected`, show warning icon, prevent download

---

### Flow 2: Preview File from File Browser

**Trigger**: User clicks on file card in `/files`

**Steps**:
1. UI opens `FilePreviewModal` with loading skeleton
2. **Client fetches** file metadata via `useFileMetadata(fileId)`
3. Determine preview type based on MIME type:
   - **Images** (jpg, png, gif, webp, svg): Render `<img>` with presigned download URL
   - **PDFs**: Use `react-pdf` to render pages
   - **Videos** (mp4, webm): Use `<video>` with presigned URL
   - **Audio** (mp3, wav, ogg): Use `<audio>` player
   - **Others**: Show file icon + "Download" button
4. Sidebar shows:
   - File name, size, upload date, uploader
   - Context (e.g., "Attached in Chat: #general")
   - Link to context (click → navigate to chat/mail)
   - Download button
   - Delete button (if user has permission)
5. Keyboard navigation: `Esc` to close, `←/→` to navigate between files

**Edge Cases**:
- **File still scanning**: Show "Scanning for viruses..." message
- **File infected**: Show red warning banner, disable download
- **Large PDF**: Show loading spinner while `react-pdf` loads pages
- **Permission denied**: Show 403 error message

---

### Flow 3: Attach Existing File from Chat Compose

**Trigger**: User clicks "Browse files" in chat compose

**Steps**:
1. Open `FileBrowserDialog` with list of user's recent files
2. User can search/filter files by name or context
3. User selects one or more files (checkbox multi-select)
4. Click "Attach selected" → files added to compose attachment list
5. Files appear as `AttachmentChip` with remove button
6. On send, message includes `attachments: ['file-id-1', 'file-id-2']`

**Backend Behavior**:
- Backend validates user has read access to all file IDs
- Creates `file_references` table entries linking message ↔ file
- File `context_type` and `context_id` updated to include message

---

## Empty/Loading/Error States

### Empty States

**File Browser (no files)**:
```
┌─────────────────────────────────────┐
│                                     │
│         📁                          │
│    No files yet                     │
│                                     │
│  Upload your first file by         │
│  dragging it here or clicking      │
│  the "Upload" button above         │
│                                     │
└─────────────────────────────────────┘
```

**Attachment Picker (no attachments)**:
```
Drag files here or click to browse
```

### Loading States

**File Grid Loading**:
- Show 6 skeleton cards with shimmer effect
- Maintain grid layout to prevent layout shift

**Preview Modal Loading**:
```
┌─────────────────────────────────────┐
│  Loading preview...                 │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░ 40%    │
└─────────────────────────────────────┘
```

**Upload Progress**:
```
filename.pdf (2.5 MB)
▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 65%
Uploading...
```

### Error States

**Upload Failed**:
```
❌ filename.pdf
   Upload failed. [Retry] [Remove]
```

**Infected File**:
```
⚠️ filename.exe
   This file contains a virus and cannot be downloaded.
   [Remove]
```

**Preview Not Available**:
```
📄 document.docx (1.2 MB)
Preview not available for this file type.
[Download to view]
```

---

## Edge Cases & Validation

### Upload Validation
- **Max file size**: 10 MB (configurable)
- **Allowed MIME types**: All (warn for executables)
- **Filename sanitization**: Remove special chars, max 255 chars
- **Duplicate detection**: Warn if identical file hash exists (optional)

### Permission Checks
- **Read**: User must have access to file's context (chat/mail/project)
- **Delete**: Only uploader or admin can delete
- **Download infected files**: Blocked for all users

### Race Conditions
- **Multiple uploads**: Queue uploads sequentially or limit to 3 concurrent
- **Delete during upload**: Cancel XHR, remove from queue
- **Context deletion**: Mark files as orphaned, show in "Unlinked files"

---

## Acceptance Criteria

### FE-11b: File Preview UI
- [x] PDF preview renders all pages with react-pdf
- [x] Image preview shows full resolution with zoom controls
- [x] Video/audio players have standard controls (play, pause, seek, volume)
- [x] Unsupported file types show download-only UI
- [x] Preview modal keyboard navigation works (Esc, ←, →)
- [x] Sidebar displays accurate metadata (size, date, uploader, context)

### FE-11c: Attachment Display in Chat/Mail
- [x] Chat messages show inline attachment chips with thumbnails
- [x] Mail messages show attachment cards in header section
- [x] Click on attachment → opens preview modal
- [x] Download button generates presigned URL and triggers download
- [x] Remove attachment button (pre-send only) works without page reload
- [x] Upload progress bar updates smoothly (0% → 100%)
- [x] Infected files show warning icon and prevent download

---

## WebSocket Events Consumed

### File Status Updates
```typescript
socket.on('file:status_changed', (event: FileEvent) => {
  // event.fileId, event.status ('scanning' | 'ready' | 'infected' | 'failed')
  // Update file status in store + re-render UI
})
```

---

## API Endpoints Required

### Already Implemented
- `POST /files/presign` - Get presigned upload URL
- `POST /files/{fileId}/confirm` - Confirm upload completion
- `GET /files` - List files (cursor paginated)
- `GET /files/{fileId}` - Get file metadata
- `DELETE /files/{fileId}` - Delete file

### Needed (Backend Contract Request)
- `GET /files/{fileId}/download` - Get presigned download URL
  - **Response**: `{ downloadUrl: string, expiresIn: number }`
  - **Headers**: Set `Content-Disposition: attachment; filename="..."`

---

## Design Tokens

### File Type Icons (Lucide React)
- **Document**: `FileText`
- **PDF**: `FileType` with red badge
- **Image**: `Image`
- **Video**: `Video`
- **Audio**: `Music`
- **Archive**: `Archive`
- **Unknown**: `File`

### Status Badges
- **Pending**: Yellow badge with `Clock` icon
- **Scanning**: Blue badge with `Shield` icon + spinner
- **Ready**: Green checkmark badge
- **Infected**: Red badge with `AlertTriangle` icon
- **Failed**: Red badge with `X` icon

### Preview Dimensions
- **Modal**: Max 90vw × 90vh
- **Thumbnail (grid)**: 200×200px (cover fit)
- **Thumbnail (list)**: 48×48px
- **Attachment chip**: 32×32px

---

## Performance Considerations

### Lazy Loading
- Load `react-pdf` only when PDF preview is triggered (dynamic import)
- Thumbnail images use `loading="lazy"` attribute
- Infinite scroll loads 20 files per page

### Caching
- File metadata cached with `staleTime: 5 minutes`
- Presigned URLs cached for duration of expiry (typically 15 minutes)
- Thumbnail images cached in browser (use CDN-friendly URLs)

### Optimizations
- Debounce file search input (300ms)
- Virtualize file grid if >100 files (react-window)
- Cancel pending XHR uploads on component unmount

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- `Tab` → Focus next file card
- `Enter` → Open preview modal
- `Esc` → Close modal
- `Space` → Select/deselect file (in multi-select mode)
- `←/→` → Navigate between files in preview

### Screen Reader Support
- File cards have `aria-label`: "filename.pdf, 2.5 megabytes, uploaded today by John Doe"
- Upload progress announced: "Uploading filename.pdf, 65 percent complete"
- Preview modal has `role="dialog"` with `aria-labelledby`

### Focus Management
- When modal opens, focus moves to close button
- When modal closes, focus returns to trigger button
- Focus trap inside modal (cannot tab outside)

---

## Testing Strategy

### Unit Tests
- `AttachmentPicker` renders correctly with empty state
- `FilePreviewModal` determines correct preview type based on MIME
- `usePresignedUploadFlow` handles upload errors gracefully

### E2E Tests (Playwright)
1. Upload file via drag-and-drop → verify appears in attachment list
2. Send chat message with attachment → verify appears in message
3. Click attachment in chat → verify preview modal opens
4. Download file → verify presigned URL requested and file downloads
5. Delete file → verify removed from file browser and message attachments

---

## Migration Notes

### Existing Files
- Run migration to populate `context_type` and `context_id` for orphaned files
- Set `status='ready'` for all existing files (skip AV scan)

### Backward Compatibility
- Old messages without `attachments` array still render correctly
- Legacy file IDs in `files` table remain valid

---

## References
- [react-pdf documentation](https://github.com/wojtekmaj/react-pdf)
- [MinIO Presigned URL spec](https://min.io/docs/minio/linux/developers/javascript/API.html#presignedPutObject)
- Backend file service: `c:/EPop/backend/src/files/files.service.ts`
