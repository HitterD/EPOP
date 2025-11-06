# Directory Feature (Admin Only)

## Overview
Organizational tree editor with drag-drop user management.

## Implementation Status
- ✅ FE-3: RBAC gating (admin:access permission required)
- ✅ FE-14: Transactional move with audit trail
- ✅ FE-14: Bulk import with dry-run validation

## Access
- Admin users only
- Available in Dashboard and `/directory`

### 403 Handling (RBAC)
- Directory page uses `IfCan` to hide or show admin-only content.
- When access is forbidden, the UI renders a clear 403 message and no data is fetched.

## Features

### Tree Structure
- Divisions and Teams
- Nested hierarchy
- Drag-drop to reorganize

### User Management
- Drag users between org units
- Show name, title, extension
- Presence badges
- Click to view profile

### Inline Editing
- Rename org units
- Add/delete units
- Reorder units

## Components

### DirectoryTreeEditor
- Recursive tree component
- Drag-drop with `react-arborist`
- Inline edit mode
- Context menu actions

## Transactional Operations (FE-14)

### Move User
```typescript
const { mutate: moveUser } = useMoveUserToUnit()
moveUser({ 
  userId, 
  toUnitId 
})
// Idempotent, atomic transaction with audit log
```

### Move Org Unit
```typescript
const { mutate: moveUnit } = useMoveOrgUnit()
moveUnit({ 
  unitId, 
  toParentId // or undefined for root
})
// Updates all descendants, maintains tree integrity
```

### Audit Trail
```typescript
const { data: auditLog } = useDirectoryAudit(50)
// Returns: DirectoryAuditEntry[]
// Shows: user_moved, unit_created, unit_updated, unit_deleted
```

## Bulk Import (FE-14)

### CSV Format
```csv
email,name,unitPath
user@example.com,John Doe,Division A/Team 1
jane@example.com,Jane Smith,Division B/Team 2
```

### Dry-Run Validation
```typescript
const { mutate: dryRun } = useBulkImportDryRun()
dryRun(csvFile)
// Returns: { valid, invalid, errors[], preview[] }
```

### Commit Import
```typescript
const { mutate: commit } = useBulkImportCommit()
commit(csvFile)
// Returns: { imported: number }
```

### Import UI Flow
1. User selects CSV file
2. Frontend calls `/directory/import/dry-run`
3. Show preview with validation errors
4. User confirms
5. Frontend calls `/directory/import/commit`
6. Success: invalidate org-tree cache

## API Endpoints
- `GET /api/directory` - Full org tree
- `PATCH /api/directory/units/[unitId]` - Update unit
- `PATCH /api/directory/users/[userId]/move` - Move user (transactional)
- `PATCH /api/directory/units/[unitId]/move` - Move unit (transactional)
- `POST /api/directory/import/dry-run` - Validate CSV
- `POST /api/directory/import/commit` - Execute import
- `GET /api/directory/audit` - Audit log (cursor paginated)
