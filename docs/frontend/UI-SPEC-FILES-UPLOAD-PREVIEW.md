# UI Specification: Files Upload & Preview

## 1. Components

### FileUploadZone
**Props:** `onUpload`, `maxSize`, `allowedTypes`, `maxFiles`, `disabled`

**Layout:**
```
┌─────────────────────────────────────┐
│       📁                             │
│   Drag files here or click to browse│
│   Supports: PDF, Images, Docs       │
│   Max size: 50 MB per file          │
└─────────────────────────────────────┘
```

**States:**
- **Idle:** Border dashed gray, icon gray
- **Hover:** Border solid blue, `bg-accent/10`
- **Drag over:** Border solid green, `bg-green-500/10`, "Drop to upload"
- **Uploading:** Show progress queue below
- **Error:** Border red, show error message
- **Disabled:** Opacity 50%, cursor not-allowed

**Drag & Drop:**
- Listen to `dragenter`, `dragover`, `drop` events
- Prevent default to allow drop
- Extract `dataTransfer.files`
- Validate each file (type, size)

**Click to Browse:**
- Hidden `<input type="file" multiple accept=".pdf,.png,.jpg,.docx" />`
- Click zone triggers input click
- On change → Process files

**Validation:**
```typescript
function validateFile(file: File) {
  const allowedTypes = ['image/*', 'application/pdf', '.docx', '.xlsx']
  const maxSize = 50 * 1024 * 1024 // 50 MB
  
  if (!allowedTypes.some(type => file.type.match(type))) {
    return { valid: false, error: 'File type not allowed' }
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'File exceeds 50 MB limit' }
  }
  return { valid: true }
}
```

**Keyboard:** `Enter` on zone to open file browser

**A11y:** `role="button" aria-label="Upload files, drag and drop or click to browse" tabindex="0"`

---

### FileUploadQueue
**Purpose:** Show upload progress for multiple files

**Props:** `files`, `onCancel`, `onRetry`, `onRemove`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Uploading 3 files...                                    │
├─────────────────────────────────────────────────────────┤
│ [📄] document.pdf (2.4 MB)    [████████░░] 78%   [×]   │
│ [🖼️] image.png (1.2 MB)       [✓] Done            [×]   │
│ [📊] data.xlsx (450 KB)       [Error: Too large]  [↻]   │
└─────────────────────────────────────────────────────────┘
```

**File Item States:**
- **Queued:** Gray, "Waiting..."
- **Uploading:** Blue progress bar, percentage, [Cancel]
- **Done:** Green checkmark, [Remove]
- **Error:** Red border, error message, [Retry]
- **Virus scanning:** Yellow, "Scanning...", spinner

**Progress Bar:**
```tsx
<Progress value={progress} className="w-full" />
<span className="text-sm text-muted-foreground">{progress}%</span>
```

**Actions:**
- **Cancel:** Stop upload, remove from queue
- **Retry:** Re-attempt upload (max 3 times)
- **Remove:** Clear from queue (after done/error)

**Keyboard:** `Tab` to navigate items, `Enter` to retry/remove

**A11y:** 
- `role="list"`, each item `role="listitem"`
- Progress: `aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"`
- Live region: `<div aria-live="polite">` announces completions

---

### FileList
**Purpose:** Display uploaded files with actions

**Props:** `files`, `onPreview`, `onDownload`, `onRename`, `onMove`, `onDelete`, `view: 'grid' | 'list'`

**Grid View:**
```
┌──────────┬──────────┬──────────┬──────────┐
│ [Thumb]  │ [Thumb]  │ [Thumb]  │ [Thumb]  │
│ image.png│ doc.pdf  │ data.xlsx│ video.mp4│
│ 1.2 MB   │ 2.4 MB   │ 450 KB   │ 15 MB    │
│ Jan 20   │ Jan 19   │ Jan 18   │ Jan 17   │
│ [...More]│ [...More]│ [...More]│ [...More]│
└──────────┴──────────┴──────────┴──────────┘
```

**List View:**
```
┌────┬─────────┬──────────┬─────────┬──────────┬─────────┐
│ ✓  │ Name    │ Type     │ Size    │ Modified │ Actions │
├────┼─────────┼──────────┼─────────┼──────────┼─────────┤
│ [ ]│image.png│ PNG      │ 1.2 MB  │ Jan 20   │ [...]   │
│ [✓]│doc.pdf  │ PDF      │ 2.4 MB  │ Jan 19   │ [...]   │
│ [ ]│data.xlsx│ Excel    │ 450 KB  │ Jan 18   │ [...]   │
└────┴─────────┴──────────┴─────────┴──────────┴─────────┘
```

**Thumbnails:**
- **Images:** Actual thumbnail (lazy loaded)
- **PDF:** First page thumbnail
- **Docs/Excel:** Generic icon `<FileText/>`, `<Sheet/>`
- **Video:** Frame from middle or generic `<Video/>`
- **Audio:** Waveform or generic `<Music/>`
- **Unknown:** `<File/>`

**Actions Menu (...):**
- Preview
- Download
- Rename
- Move to folder
- Copy link
- Delete

**Bulk Actions (when selected):**
- Download as ZIP
- Move to folder
- Delete

**Sorting:**
- Name (A-Z, Z-A)
- Date modified (newest, oldest)
- Size (largest, smallest)
- Type (A-Z)

**Filtering:**
- Type: Images, Documents, Videos, etc.
- Date: Today, This week, This month, Custom range
- Size: <1MB, 1-10MB, >10MB

**Search:** Fuzzy match file names

**States:**
- **Loading:** Skeleton grid/list
- **Empty:** "No files. Upload files to get started."
- **Error:** Alert + retry

**Keyboard:** `Arrow keys` navigate, `Space` select, `Enter` preview, `Del` delete

**A11y:**
- Grid: `role="grid"`, items `role="gridcell"`
- List: `role="table"`
- Actions: `aria-label="Actions for image.png"`

---

### FilePreviewModal
**Purpose:** Preview file content in modal

**Props:** `file`, `onClose`, `onDownload`, `onNext`, `onPrev`

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ [← Prev]  image.png (1.2 MB)  [Next →]       [× Close]│
├────────────────────────────────────────────────────────┤
│                                                        │
│                 [Image Preview]                        │
│                                                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│ [Download] [Zoom: 100% ▼] [Rotate]                   │
└────────────────────────────────────────────────────────┘
```

**Supported Previews:**

**Images (PNG, JPG, GIF, WebP, SVG):**
- Display with zoom controls
- Pan with mouse drag
- Keyboard: `+/-` zoom, `R` rotate, `0` reset

**PDF:**
- Embed `<iframe>` with PDF.js or native viewer
- Page navigation: [1/10] [<] [>]
- Zoom controls

**Text (TXT, MD, JSON, CSV):**
- Syntax highlighted code editor (read-only)
- Use Monaco or simple `<pre>`

**Video (MP4, WebM):**
- `<video>` player with controls
- Keyboard shortcuts: Space play/pause, `←/→` seek

**Audio (MP3, WAV, OGG):**
- `<audio>` player with waveform visualization

**Office Docs (DOCX, XLSX, PPTX):**
- Use Office Online embed or convert to PDF server-side
- Fallback: "Preview not available. [Download]"

**Unsupported:**
- Show file icon + metadata
- "Preview not available for this file type. [Download]"

**Loading:**
- Show spinner while fetching file
- Stream large files (range requests)

**Error:**
- "Failed to load preview. [Retry] or [Download]"

**Keyboard:** `Escape` close, `Arrow Left/Right` prev/next, `D` download

**A11y:**
- `role="dialog" aria-modal="true"`
- Focus trap
- Return focus to trigger on close
- Image: `alt` with file name

---

### FileRenameDialog
**Purpose:** Rename file inline or in dialog

**Props:** `file`, `onRename`, `onCancel`

**Layout:**
```
┌────────────────────────────┐
│ Rename File                │
├────────────────────────────┤
│ Name: [image.png     ]     │
│                            │
│       [Cancel]  [Rename]   │
└────────────────────────────┘
```

**Validation:**
- Not empty
- No invalid characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
- No duplicate name in same folder

**Keyboard:** `Cmd+Enter` rename, `Escape` cancel

**A11y:** Focus input on open, announce validation errors

---

### FolderTree
**Purpose:** Navigate file folders

**Props:** `folders`, `selectedId`, `onSelect`, `onCreate`, `onRename`, `onDelete`

**Layout:**
```
📁 My Files
  📁 Projects
    📁 Project A
    📁 Project B
  📁 Documents
  📁 Images
🗑️ Trash
```

**Expand/Collapse:** Click folder to toggle children

**Actions (right-click or ...):**
- New folder
- Rename
- Delete (moves to Trash)
- Move

**Drag & Drop:** Drag files to folder to move

**Keyboard:** `Arrow keys` navigate, `Enter` expand/collapse, `Del` delete

**A11y:** 
- `role="tree"`
- Items: `role="treeitem" aria-expanded="true"`
- Keyboard nav with arrow keys

---

### StorageQuota
**Purpose:** Show storage usage

**Props:** `used`, `total`

**Layout:**
```
┌────────────────────────────┐
│ Storage: 12.5 GB / 50 GB   │
│ [████████░░░░░░░░░░░] 25%  │
└────────────────────────────┘
```

**States:**
- <50%: Green
- 50-80%: Yellow
- 80-100%: Red + warning "Storage almost full. Delete files or upgrade."

**Link:** "Manage storage" → Opens file manager filtered by size (largest first)

**A11y:** `aria-label="Storage used: 12.5 GB of 50 GB, 25%"`

---

## 2. User Flows

**Upload Flow:**
1. User drags files → Hover state activates
2. Drop → Validate files
3. Invalid files → Toast error "File XYZ too large"
4. Valid files → Add to upload queue
5. Upload starts → Show progress
6. Server processes → Virus scan (if enabled)
7. Complete → Toast "3 files uploaded" + Add to file list

**Preview Flow:**
1. User clicks file in grid/list
2. Modal opens → Show loading spinner
3. Fetch file (range streaming for large files)
4. Render preview based on type
5. User navigates prev/next with arrows
6. Close with `Escape` or [×]

**Download Flow:**
1. User clicks [Download] in preview or actions menu
2. Generate signed URL from server
3. Trigger browser download: `<a href={signedUrl} download />`
4. Toast: "Downloading image.png"

**Move to Folder:**
1. Select files
2. Click [Move] → Folder picker dialog
3. Select destination folder
4. Confirm → API call
5. Remove from current view, add to destination
6. Toast: "2 files moved to Projects"

**Delete Flow:**
1. Select file(s)
2. Click [Delete] → Confirmation "Delete 2 files? They'll move to Trash."
3. Confirm → Move to Trash folder
4. Toast: "2 files deleted [Undo 5s]"
5. Permanent delete: From Trash → "Permanently delete? Cannot be undone."

---

## 3. States & Copy

**Empty:**
- No files: "No files yet. Drag files here to upload."
- No search results: "No files match your search."
- Trash empty: "Trash is empty. Deleted files appear here for 30 days."

**Errors:**
- Upload failed: "Upload failed. Check connection and retry."
- File too large: "File exceeds 50 MB limit. Compress or use smaller file."
- Type blocked: ".exe files are blocked for security."
- Quota exceeded: "Storage full. Delete old files or upgrade plan."
- Virus detected: "File blocked. Virus scan detected threat."
- Preview failed: "Failed to load preview. Try downloading."

**Warnings:**
- Near quota: "Storage 85% full. Consider deleting old files."
- Large upload: "Large file may take several minutes to upload."

**Success:**
- Upload: "3 files uploaded successfully"
- Delete: "2 files moved to Trash [Undo]"
- Rename: "File renamed to project-final.pdf"
- Move: "2 files moved to Documents"

---

## 4. Layout Tokens

**Spacing:**
- Upload zone: `p-12` (48px)
- Grid gap: `gap-4` (16px)
- List row: `py-3` (12px)

**Sizes:**
- Thumbnail: `w-32 h-32` (128px)
- Preview modal: `max-w-6xl` (1152px), `h-[80vh]`

**Responsive:**
- Mobile: Grid 2 columns, list stacked
- Tablet: Grid 3 columns
- Desktop: Grid 4-6 columns

**Z-index:**
- Preview modal: `z-50`
- Upload queue: `z-10`

---

## 5. A11y Checklist

✅ Upload zone: `role="button"`, keyboard trigger  
✅ Progress: `aria-valuenow/min/max`  
✅ File list: Grid `role="grid"`, Table `role="table"`  
✅ Preview modal: `role="dialog" aria-modal`, focus trap  
✅ Keyboard: Full nav without mouse  
✅ Screen reader: Announce upload status, errors  
✅ Images: `alt` text with file names  
✅ Contrast: 4.5:1 text, 3:1 UI

---

## 6. Edge Cases

**Duplicate file name:** Append ` (1)`, ` (2)`, etc.

**Large file (>100MB):** Chunked upload, resume on disconnect

**Concurrent upload:** Queue all, upload 3 parallel max

**Offline upload:** Queue locally, sync on reconnect

**Virus scan pending:** Show yellow badge "Scanning...", block preview/download

**Preview timeout:** If file takes >10s, show error

**Mobile camera upload:** Support `capture="camera"` attribute

**Paste to upload:** Listen to paste event, extract clipboard files

---

## 7. Performance

- Lazy load thumbnails (IntersectionObserver)
- Virtualize file list if >200 items
- Stream large files (range requests)
- Debounce search 300ms
- Cache thumbnails (localStorage or IndexedDB)

---

## 8. API Endpoints

```
POST   /api/files/upload          (FormData file)
GET    /api/files                 (?folder=&type=&search=)
GET    /api/files/{id}            (metadata)
GET    /api/files/{id}/download   (signed URL)
GET    /api/files/{id}/preview    (stream content)
PATCH  /api/files/{id}            (rename, move)
DELETE /api/files/{id}            (move to trash)
DELETE /api/files/{id}/permanent  (hard delete)
GET    /api/files/quota           (used, total)
```

---

**Success Criteria:** All file types supported, upload/preview smooth, quota tracking, offline queue, WCAG AA, no dev questions.
