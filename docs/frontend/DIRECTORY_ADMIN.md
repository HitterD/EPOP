# Directory & Admin UI/UX Specification

## Objective
Provide intuitive organizational hierarchy management with drag-and-drop, audit trail, and bulk import capabilities for administrators.

## User Roles
- **Admin**: Full access to directory tree, audit logs, bulk import
- **Manager**: Can view org tree, no edit permissions
- **Member**: Can view limited org tree (own unit + children)

## Implementation Status
- ✅ FE-4: Cursor pagination on audit log
- ✅ API hooks: `useOrgTree`, `useMoveUserToUnit`, `useMoveOrgUnit`, `useBulkImportDryRun`, `useDirectoryAudit`
- ⬜ FE-14a: Drag-move UI with visual feedback (PENDING)
- ⬜ FE-14b: Audit trail viewer component (PENDING)
- ⬜ FE-14c: Bulk import dry-run UI (PENDING)

---

## Information Architecture

### Routes
- `/directory` - Organization tree view (admin only)
- `/directory/audit` - Audit log viewer (admin only)
- `/directory/import` - Bulk import wizard (admin only)
- `/directory/users/[userId]` - User detail page
- `/directory/units/[unitId]` - Unit detail page

### Component Hierarchy
```
DirectoryPage
├── DirectoryToolbar
│   ├── SearchInput (filter by name/email)
│   ├── ViewToggle (tree/list)
│   ├── AddUserButton
│   ├── AddUnitButton
│   └── BulkImportButton
└── OrgTreeEditor
    ├── OrgTreeNode (recursive)
    │   ├── NodeHeader (expand/collapse, drag handle)
    │   ├── NodeContent (unit/user info, presence badge)
    │   ├── NodeActions (edit, delete, add child)
    │   └── Children (recursive OrgTreeNode)
    └── DropZone (visual feedback during drag)

AuditViewer
├── AuditFilters (date range, action type, user)
├── AuditTimeline
│   └── AuditEntry
│       ├── Timestamp
│       ├── Actor (user who made change)
│       ├── Action ("moved", "created", "deleted")
│       ├── Target (affected user/unit)
│       └── Changes (before/after diff)
└── AuditPagination (infinite scroll)

BulkImportWizard
├── Step1: UploadCSV
│   ├── FileUploadZone
│   └── CSVTemplate download link
├── Step2: DryRunPreview
│   ├── ValidationSummary (success/error counts)
│   ├── PreviewTable (first 10 rows)
│   └── ErrorList (validation errors)
└── Step3: ConfirmImport
    ├── FinalSummary
    └── ConfirmButton (commit import)
```

---

## State Model (Zustand Slice)

### DirectoryStore (`lib/stores/directory-store.ts`)

```typescript
interface DirectoryState {
  orgTree: OrgUnit | null
  expandedNodes: Set<string> // Unit IDs
  selectedNode: string | null
  draggedNode: string | null
  dropTarget: string | null
  
  // Actions
  setOrgTree(tree: OrgUnit): void
  toggleNode(unitId: string): void
  expandPath(unitId: string): void // Expand all ancestors
  selectNode(nodeId: string): void
  
  // Drag-drop state
  setDraggedNode(nodeId: string | null): void
  setDropTarget(unitId: string | null): void
  canDrop(dragged: string, target: string): boolean // Prevent circular refs
  
  // Audit state
  auditFilters: AuditFilters
  setAuditFilters(filters: Partial<AuditFilters>): void
}

interface OrgUnit {
  id: string
  name: string
  type: 'root' | 'department' | 'team'
  parentId?: string
  managerId?: string
  users: User[]
  children: OrgUnit[]
}

interface AuditFilters {
  dateFrom?: string
  dateTo?: string
  actionType?: 'create' | 'update' | 'delete' | 'move'
  actorId?: string
  targetType?: 'user' | 'unit'
}
```

---

## UX Flows

### Flow 1: Drag-Move User to Different Unit (FE-14a)

**Trigger**: Admin drags user card to different unit

**Steps**:
1. User presses mouse down on user card → drag handle appears
2. User drags → card follows cursor with 50% opacity
3. Potential drop zones highlight with blue dashed border
4. Invalid drop zones show red border (e.g., user's current unit)
5. User hovers over valid unit → unit expands automatically (after 800ms)
6. User releases mouse → drop confirmation tooltip appears
7. User confirms → **API call** `useMoveUserToUnit({ userId, toUnitId })`
8. Optimistic update: User card moves instantly to new unit
9. **Backend response**: Success → audit log created
10. **Socket.IO event**: `directory:user_moved` → all clients update tree
11. If error → rollback move, show error toast, user returns to original unit

**Visual Feedback**:
- **Dragging**: Ghost card follows cursor, original card dims
- **Valid drop zone**: Blue dashed border, pulse animation
- **Invalid drop zone**: Red border, shake animation
- **Drop preview**: Dotted outline where user will appear

**Edge Cases**:
- **Circular reference**: Cannot move unit into its own descendant
- **Permission check**: Non-admins see read-only tree (no drag handles)
- **Network failure**: Rollback optimistic update, show retry button
- **Concurrent move**: Last write wins, show conflict warning

---

### Flow 2: View Audit Trail for User Move (FE-14b)

**Trigger**: Admin clicks "Audit Log" button

**Steps**:
1. Navigate to `/directory/audit`
2. UI loads with default filters (last 30 days, all actions)
3. **Client fetches** `useDirectoryAudit(50)` → cursor-paginated audit entries
4. Timeline renders entries grouped by date
5. Each entry shows:
   - **Timestamp**: "2 hours ago" (relative time)
   - **Actor**: "John Doe (Admin)" with avatar
   - **Action**: Icon + verb ("moved", "created", "deleted")
   - **Target**: "Jane Smith" or "Engineering Dept"
   - **Changes**: Before/after diff (e.g., "From: HR → To: Engineering")
6. User scrolls to bottom → infinite scroll loads next page
7. User applies filters (date range, action type) → refetch with filters

**Audit Entry Types**:
- **User moved**: `{actor} moved {user} from {oldUnit} to {newUnit}`
- **Unit created**: `{actor} created unit {unitName}`
- **Unit renamed**: `{actor} renamed {oldName} to {newName}`
- **User added**: `{actor} added {user} to {unit}`
- **User removed**: `{actor} removed {user} from {unit}`

**Export Feature**:
- "Export to CSV" button → generates CSV with all filtered entries
- Includes: Timestamp, Actor, Action, Target, Details

---

### Flow 3: Bulk Import Users with Dry-Run (FE-14c)

**Trigger**: Admin clicks "Bulk Import" button

**Steps**:

#### Step 1: Upload CSV
1. Show file upload zone with example CSV template link
2. User drags CSV file or clicks to browse
3. **Client uploads** file via `useBulkImportDryRun(file)`
4. Show progress bar during upload
5. **Backend validates** CSV structure and returns dry-run result

**CSV Template** (`users-import-template.csv`):
```csv
email,firstName,lastName,title,unitPath,role
john@example.com,John,Doe,Developer,Engineering/Backend,member
jane@example.com,Jane,Smith,Manager,Engineering,manager
```

#### Step 2: Dry-Run Preview
6. Display validation summary:
   - ✅ 245 users valid
   - ⚠️ 12 users with warnings (duplicate emails)
   - ❌ 3 users invalid (missing required fields)
7. Show preview table (first 10 rows) with color-coded status:
   - **Green row**: Valid, will be created
   - **Yellow row**: Warning, will be created but needs review
   - **Red row**: Invalid, will be skipped
8. Show detailed error list below table:
   - "Row 15: Missing email address"
   - "Row 23: Unit 'Marketing/Digital' does not exist"
9. User can download error report or fix CSV and re-upload

#### Step 3: Confirm Import
10. User clicks "Proceed with Import" (disabled if critical errors exist)
11. Confirmation dialog: "Import 245 users? This cannot be undone."
12. User confirms → **API call** `useBulkImportCommit(file)`
13. Show progress bar with live count: "Imported 120/245 users..."
14. **Backend processes** import transactionally (all or nothing per user)
15. On completion, show summary:
    - ✅ 242 users imported successfully
    - ❌ 3 users failed (with error details)
16. Audit log entries created for each imported user
17. **Socket.IO event**: `directory:bulk_import_completed` → all clients refresh tree

**Edge Cases**:
- **Large CSV** (>1000 rows): Show warning, suggest splitting file
- **Unit doesn't exist**: Offer to create missing units automatically
- **Duplicate emails**: Skip or update existing user (admin chooses)
- **Invalid role**: Default to 'member' with warning

---

## Empty/Loading/Error States

### Empty States

**Org Tree (no units)**:
```
┌─────────────────────────────────────┐
│    🏢 No organizational units yet    │
│                                     │
│    Click "Add Unit" to create      │
│    your first department or team   │
└─────────────────────────────────────┘
```

**Audit Log (no entries)**:
```
No audit entries found for selected filters.
Try adjusting the date range or removing filters.
```

### Loading States

**Org Tree Loading**:
- Show skeleton tree with 3 levels of placeholder nodes
- Preserve expand/collapse state during refetch

**Audit Log Loading**:
- Show 5 skeleton timeline entries with shimmer effect

**Bulk Import Progress**:
```
Importing users...
▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 120/245 (49%)
Estimated time remaining: 2 minutes
```

### Error States

**Move Failed**:
```
❌ Failed to move user
   User may have been moved by another admin.
   [Refresh tree] [Retry]
```

**Import Failed**:
```
❌ Import failed at row 156
   Database connection lost. 
   No users were imported (transaction rolled back).
   [Download error report] [Retry]
```

---

## Edge Cases & Validation

### Drag-Drop Validation
- **Prevent self-drop**: User cannot drop node into itself
- **Prevent circular refs**: Unit cannot be moved into its own descendant
- **Permission check**: Only admin can drag, others see read-only tree
- **Max depth**: Warn if tree depth exceeds 5 levels (performance)

### Bulk Import Validation
- **Required fields**: email, firstName, lastName
- **Email format**: Regex validation (RFC 5322)
- **Unit path**: Must exist or be created in order (parent before child)
- **Role**: Must be one of ['admin', 'manager', 'member']
- **Max file size**: 5 MB (approx 50,000 rows)

### Audit Log Retention
- **Default retention**: 90 days
- **Admin-configurable**: Can extend to 1 year
- **Soft delete**: Deleted users/units remain in audit log

---

## Acceptance Criteria

### FE-14a: Directory Drag-Move UI
- [x] Drag user card → ghost card follows cursor
- [x] Valid drop zones highlight with blue border
- [x] Invalid drop zones highlight with red border
- [x] Hover on unit for 800ms → auto-expands unit
- [x] Drop confirmation tooltip appears on release
- [x] Optimistic move → instant UI update
- [x] Rollback on error → user returns to original position
- [x] Socket.IO event updates all connected clients <1s

### FE-14b: Audit Trail Viewer
- [x] Timeline displays entries grouped by date
- [x] Each entry shows actor, action, target, changes
- [x] Relative timestamps ("2 hours ago") with hover for absolute time
- [x] Filters work: date range, action type, actor
- [x] Infinite scroll loads next page on bottom reach
- [x] Export to CSV downloads all filtered entries

### FE-14c: Bulk Import Dry-Run UI
- [x] CSV upload with drag-drop and file picker
- [x] Dry-run shows validation summary (valid/warning/error counts)
- [x] Preview table color-codes rows (green/yellow/red)
- [x] Error list displays detailed validation messages
- [x] Download CSV template link works
- [x] Commit button disabled if critical errors exist
- [x] Progress bar shows live count during import
- [x] Final summary shows success/failure breakdown

---

## WebSocket Events Consumed

### Directory Events
```typescript
socket.on('directory:user_moved', (event: DirectoryEvent) => {
  // event.userId, event.fromUnitId, event.toUnitId
  queryClient.invalidateQueries(['org-tree'])
})

socket.on('directory:unit_created', (event: DirectoryEvent) => {
  // event.unitId, event.parentId, event.unitName
  queryClient.invalidateQueries(['org-tree'])
})

socket.on('directory:bulk_import_completed', (event: DirectoryEvent) => {
  // event.importedCount, event.failedCount
  queryClient.invalidateQueries(['org-tree'])
  toast.success(`Import completed: ${event.importedCount} users`)
})
```

---

## API Endpoints (Already Implemented)

- `GET /directory` - Get org tree
- `PATCH /directory/{unitId}` - Update unit
- `PATCH /directory/users/{userId}/move` - Move user (transactional)
- `PATCH /directory/units/{unitId}/move` - Move unit (transactional)
- `POST /directory/import/dry-run` - Validate CSV (returns preview)
- `POST /directory/import/commit` - Execute import (transactional)
- `GET /directory/audit` - Get audit log (cursor paginated)

---

## Design Tokens

### Tree Visual Hierarchy
- **Root node**: Bold, 18px font, indigo background
- **Department node**: 16px font, blue background
- **Team node**: 14px font, gray background
- **User card**: 14px font, white background, avatar on left

### Indentation
- **Level 1**: 0px
- **Level 2**: 24px
- **Level 3**: 48px
- **Level 4**: 72px
- **Max levels**: 5 (warn if exceeded)

### Drag-Drop Colors
- **Valid drop zone**: `border-blue-400 border-dashed animate-pulse`
- **Invalid drop zone**: `border-red-400 border-dashed animate-shake`
- **Dragging card**: `opacity-50 rotate-2 shadow-2xl`

### Audit Entry Icons
- **Create**: `Plus` (green)
- **Update**: `Edit` (blue)
- **Delete**: `Trash` (red)
- **Move**: `Move` (orange)

---

## Performance Considerations

### Tree Rendering
- **Virtualization**: Use `react-window` if tree has >500 nodes
- **Lazy expand**: Load children on demand (if tree is very deep)
- **Debounce search**: 300ms delay to avoid excessive filtering

### Drag-Drop Performance
- **Throttle drag events**: Update ghost position every 16ms (60fps)
- **Cancel hover timeout**: Clear auto-expand timer on drag leave
- **Optimistic update**: Instant UI change, rollback on error

### Bulk Import
- **Chunk processing**: Process CSV in batches of 100 rows
- **Progress updates**: Stream progress via Server-Sent Events (optional)
- **Transaction size**: Commit every 100 users to avoid long locks

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- `Tab` → Focus next node
- `Enter` → Expand/collapse node
- `Space` → Select node
- `Arrow Up/Down` → Navigate tree vertically
- `Arrow Left/Right` → Collapse/expand node
- `Ctrl+C` → Copy node ID (for power users)

### Screen Reader Support
- Tree has `role="tree"` with `aria-label="Organization hierarchy"`
- Each node has `role="treeitem"` with `aria-expanded` state
- Drag-drop announced: "Dragging John Doe" → "Dropped in Engineering department"
- Audit entries announced: "John Doe moved Jane Smith from HR to Engineering, 2 hours ago"

### Focus Management
- When node is moved, focus remains on moved node in new location
- When importing, focus moves to progress bar during import
- When modal closes, focus returns to "Bulk Import" button

---

## Testing Strategy

### Unit Tests
- `OrgTreeNode` renders correctly with nested children
- `useMoveUserToUnit` optimistic update works and rolls back on error
- `BulkImportWizard` validates CSV structure before upload

### E2E Tests (Playwright)
1. Drag user from one unit to another → verify appears in new unit
2. Verify audit log entry created for move
3. Upload CSV with 5 users → verify dry-run preview shows correct counts
4. Confirm import → verify users appear in org tree
5. Apply audit filters → verify filtered results render

---

## Migration Notes

### Existing Users
- Run migration to assign all users to default "Unassigned" unit
- Admin must manually organize users into proper units

### Audit Log Backfill
- Optionally create synthetic audit entries for historical data
- Use "System" as actor for pre-migration actions

---

## References
- Backend directory service: `c:/EPop/backend/src/directory/directory.service.ts`
- Backend admin service: `c:/EPop/backend/src/admin/admin.service.ts`
- CSV parsing: `csv-parse` library (sync mode)
- Drag-drop: `@dnd-kit/core` + `@dnd-kit/sortable`
