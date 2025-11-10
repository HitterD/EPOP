# UI Specification: Directory & Admin

## 1. Directory Components

### OrganizationTree
**Purpose:** Hierarchical view of company structure

**Props:** `org`, `onNodeClick`, `onExpand`, `selectedId`

**Layout:**
```
┌────────────────────────────────────┐
│ 🏢 ACME Corporation                │
│   ▼ 👥 Engineering (45)            │
│      ▼ 👥 Frontend Team (12)       │
│         👤 Alice Chen              │
│         👤 Bob Smith               │
│      ▶ 👥 Backend Team (18)        │
│      ▶ 👥 DevOps Team (15)         │
│   ▶ 👥 Product (20)                │
│   ▶ 👥 Design (8)                  │
└────────────────────────────────────┘
```

**Node Types:**
- **Company:** Root, always expanded
- **Department:** Expandable, shows team count
- **Team:** Expandable, shows member count
- **User:** Leaf node with presence indicator

**Expand/Collapse:**
- Click arrow or node title
- Keyboard: `→` expand, `←` collapse

**Presence Indicators:**
- Online: 🟢 Green dot
- Away: 🟡 Yellow dot
- Offline: ⚪ Gray dot
- Position: Next to user avatar

**Search/Filter:**
- Input at top: "Search people..."
- Filters: Department, Status (active/inactive), Role

**States:**
- **Loading:** Skeleton tree structure
- **Empty department:** "(No members)"
- **Search no results:** "No users match your search"

**Keyboard:** `↑↓` navigate, `→←` expand/collapse, `Enter` select

**A11y:** `role="tree"`, nodes `role="treeitem" aria-expanded`, `aria-level`

---

### UserCard
**Purpose:** Detailed user info card

**Props:** `user`, `onCall`, `onChat`, `onEmail`, `canEdit`

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Avatar]  Alice Chen           🟢 Online│
│           Product Manager               │
│           Engineering · Frontend Team   │
├─────────────────────────────────────────┤
│ 📧 alice@company.com                    │
│ 📞 Ext: 1234                            │
│ 📍 San Francisco, CA (PST)              │
│ 💼 Joined: Jan 15, 2023                 │
├─────────────────────────────────────────┤
│ Bio:                                    │
│ Passionate about building great UX.    │
│ Loves hiking and photography.          │
├─────────────────────────────────────────┤
│ [💬 Chat] [📞 Call] [✉️ Email] [Edit]   │
└─────────────────────────────────────────┘
```

**Actions:**
- **Chat:** Opens direct message
- **Call:** Starts voice/video call (if feature available)
- **Email:** Opens mail composer with user as recipient
- **Edit:** Admin only, opens edit dialog

**Presence Status:**
- Color dot + text: "Online", "Away", "Offline"
- Custom status: "🏖️ On vacation until Jan 25"

**Timezone Display:**
- Show user's timezone if different from current user
- Local time: "3:45 PM (9 hours ahead)"

**A11y:** `role="article" aria-label="User profile for Alice Chen"`

---

### UserListView
**Purpose:** Grid/list view of all users

**Props:** `users`, `view: 'grid' | 'list'`, `onUserClick`, `filters`

**Grid View:**
```
┌──────────┬──────────┬──────────┬──────────┐
│ [Avatar] │ [Avatar] │ [Avatar] │ [Avatar] │
│ Alice    │ Bob      │ Carol    │ Dave     │
│ Product  │ Engineer │ Designer │ Engineer │
│ 🟢 Online│ 🟢 Online│ 🟡 Away  │ ⚪ Offline│
└──────────┴──────────┴──────────┴──────────┘
```

**List View:**
```
┌───┬──────────┬────────────┬───────────┬──────────┬─────────┐
│ ✓ │ Name     │ Role       │ Department│ Email    │ Status  │
├───┼──────────┼────────────┼───────────┼──────────┼─────────┤
│[ ]│Alice Chen│Product Mgr │Engineering│alice@... │🟢 Online│
│[✓]│Bob Smith │Engineer    │Engineering│bob@...   │🟢 Online│
│[ ]│Carol Lee │Designer    │Design     │carol@... │🟡 Away  │
└───┴──────────┴────────────┴───────────┴──────────┴─────────┘
```

**Sorting:**
- Name (A-Z, Z-A)
- Department
- Status (online first)
- Join date

**Filtering:**
- Department (multi-select)
- Role (multi-select)
- Status (online/away/offline)
- Active/Inactive

**Bulk Actions (admin only):**
- Export to CSV
- Send bulk email
- Deactivate users

**Keyboard:** `Arrow keys` navigate, `Space` select, `Enter` open card

**A11y:** Grid `role="grid"`, List `role="table"`

---

## 2. Admin Components

### AdminPanel
**Purpose:** Admin dashboard with quick actions

**Props:** `stats`, `actions`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Admin Dashboard                                     │
├─────────────────────────────────────────────────────┤
│ [145 Users] [12 Departments] [45 Active Today]     │
├─────────────────────────────────────────────────────┤
│ Quick Actions:                                      │
│ [+ Add User] [📥 Bulk Import] [📊 Reports] [⚙️ Settings]│
├─────────────────────────────────────────────────────┤
│ Recent Activity:                                    │
│ • Alice Chen added to Engineering                   │
│ • Bob Smith role changed to Admin                  │
│ • 5 new users imported from users.xlsx              │
└─────────────────────────────────────────────────────┘
```

**Stats Cards:**
- Total users
- Active users (today/week/month)
- Pending invites
- Storage usage

**Recent Activity:**
- User additions
- Role changes
- Deactivations
- Bulk imports

**A11y:** `role="region" aria-label="Admin dashboard"`

---

### UserFormDialog
**Purpose:** Create/edit user

**Props:** `user?`, `onSave`, `onCancel`, `mode: 'create' | 'edit'`

**Layout:**
```
┌─────────────────────────────────────────┐
│ Add New User                      [× ]  │
├─────────────────────────────────────────┤
│ First Name: [Alice          ]  *        │
│ Last Name:  [Chen           ]  *        │
│ Email:      [alice@company  ]  *        │
│ Phone:      [+1 555-1234    ]           │
│ Extension:  [1234           ]           │
│                                         │
│ Department: [Engineering ▼  ]  *        │
│ Team:       [Frontend Team ▼]           │
│ Role:       [Product Manager]  *        │
│ Type:       ● Employee  ○ Contractor    │
│                                         │
│ Permissions:                            │
│ [ ] Admin                               │
│ [✓] Can create projects                 │
│ [✓] Can upload files                    │
│                                         │
│ Bio: [Textarea...]                      │
│                                         │
│ Send invite email? [✓]                  │
│                                         │
│           [Cancel]  [Save User]         │
└─────────────────────────────────────────┘
```

**Required Fields (* marked):**
- First name
- Last name
- Email (validate format)
- Department
- Role

**Email Validation:**
- Format: RFC 5322 regex
- Uniqueness: Check against existing users
- Show error if duplicate: "Email already in use"

**Department/Team:**
- Cascading dropdowns: Select department → teams filter
- Create new option if not in list

**Permissions:**
- Admin checkbox: Grants full access
- Granular permissions: Projects, Files, Analytics, etc.
- Only admins can grant admin permission

**Invite Email:**
- If checked, sends welcome email with temp password
- Template preview available

**Validation:**
- Real-time validation on blur
- Show errors inline below fields
- Disable save if errors present

**Keyboard:** `Tab` through fields, `Cmd+Enter` save, `Escape` cancel

**A11y:** 
- `role="dialog" aria-modal="true"`
- Labels linked to inputs: `<label htmlFor="firstName">`
- Errors: `aria-describedby="firstName-error"`

---

### BulkImportDialog
**Purpose:** Import users from Excel/CSV

**Props:** `onUpload`, `onPreview`, `onImport`, `onCancel`

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Bulk Import Users                     [× ] │
├─────────────────────────────────────────────┤
│ Step 1: Download Template                  │
│ [📥 Download Excel Template]               │
│                                             │
│ Step 2: Upload File                        │
│ Drag file here or [Browse]                 │
│                                             │
│ Step 3: Preview & Validate                 │
│ ┌─────────────────────────────────────┐   │
│ │ Name       │ Email        │ Status  │   │
│ ├───────────┼──────────────┼─────────┤   │
│ │ Alice Chen│ alice@...    │ ✓ Valid │   │
│ │ Bob Smith │ bob@...      │ ✓ Valid │   │
│ │ Invalid   │ notanemail   │ ✗ Error │   │
│ └─────────────────────────────────────┘   │
│ Summary: 2 valid, 1 error                  │
│                                             │
│ Step 4: Import                             │
│ [ ] Skip rows with errors                  │
│ [ ] Send invite emails                     │
│                                             │
│          [Cancel]  [Import 2 Users]        │
└─────────────────────────────────────────────┘
```

**Template Format:**
```csv
First Name,Last Name,Email,Phone,Department,Team,Role,Type
Alice,Chen,alice@company.com,+1-555-1234,Engineering,Frontend,Product Manager,Employee
Bob,Smith,bob@company.com,+1-555-5678,Engineering,Backend,Engineer,Employee
```

**Validation:**
- Required columns present
- Email format valid
- Department/Team exist (or create new)
- No duplicate emails
- Max 500 users per import

**Error Handling:**
- Show errors inline per row
- Highlight invalid cells in red
- Allow edit in preview table
- Option to skip invalid rows or fix them

**Progress:**
- Show progress bar during import
- "Importing user 5 of 50..."
- Toast on complete: "Imported 50 users successfully"

**A11y:** Step-by-step wizard with `aria-label` per step

---

### UserActionsMenu
**Purpose:** Actions dropdown for user row

**Props:** `user`, `onEdit`, `onDeactivate`, `onDelete`, `onResetPassword`

**Layout:**
```
[...]
 ├─ Edit User
 ├─ Reset Password
 ├─ Send Email
 ├─ View Audit Log
 ├─ Deactivate
 └─ Delete (danger)
```

**Actions:**
- **Edit:** Opens UserFormDialog in edit mode
- **Reset Password:** Sends password reset email, toast confirmation
- **Send Email:** Opens mail composer
- **View Audit Log:** Opens modal with user's activity history
- **Deactivate:** Soft delete, user can't log in, data retained
- **Delete:** Hard delete, requires confirmation: "Permanently delete Alice Chen? All data will be lost."

**Permissions:**
- Only admins see this menu
- Delete requires super admin role

**Keyboard:** `Enter` to open menu, `↑↓` navigate, `Enter` select, `Escape` close

**A11y:** `role="menu"`, items `role="menuitem"`

---

### RolePermissionsMatrix
**Purpose:** Visual matrix of roles and permissions

**Props:** `roles`, `permissions`, `onChange`

**Layout:**
```
┌──────────────┬───────┬────────┬───────┬──────┐
│ Permission   │ Admin │ Manager│ Member│ Guest│
├──────────────┼───────┼────────┼───────┼──────┤
│ View Projects│   ✓   │   ✓    │   ✓   │  ✓   │
│ Edit Projects│   ✓   │   ✓    │   ✓   │      │
│ Delete Proj. │   ✓   │   ✓    │       │      │
│ Manage Users │   ✓   │        │       │      │
│ View Analytics│  ✓   │   ✓    │       │      │
└──────────────┴───────┴────────┴───────┴──────┘
```

**Interaction:**
- Click checkbox to toggle permission
- Changes auto-save or have "Save" button

**Visual:**
- Checkboxes for each role-permission combo
- Striped rows for readability
- Sticky header when scrolling

**A11y:** `role="table"`, checkboxes labeled with role+permission

---

### AuditLogViewer
**Purpose:** View user activity history

**Props:** `userId`, `logs`, `filters`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Audit Log: Alice Chen                               │
├─────────────────────────────────────────────────────┤
│ Filters: [Action ▼] [Date Range ▼]                 │
├─────────────────────────────────────────────────────┤
│ Jan 20, 10:30 AM · Login from 192.168.1.100         │
│ Jan 20, 10:35 AM · Created project "Website Redesign"│
│ Jan 20, 11:00 AM · Uploaded file "specs.pdf"        │
│ Jan 20, 2:45 PM  · Deleted message in #general      │
│ Jan 20, 4:00 PM  · Logout                           │
├─────────────────────────────────────────────────────┤
│ Page 1 of 5                           [< 1 2 3 >]  │
└─────────────────────────────────────────────────────┘
```

**Log Entry:**
- Timestamp
- Action type (login, create, edit, delete, etc.)
- Details (resource ID, IP address, user agent)
- Result (success/failure)

**Filters:**
- Action type (multi-select)
- Date range
- Result (success/failure)

**Export:**
- Download as CSV for compliance/auditing

**A11y:** `role="log" aria-live="polite"` for real-time updates

---

## 3. User Flows

**View Directory:**
1. User navigates to Directory tab
2. See org tree on left, user list on right
3. Click department → Expands to show teams
4. Click user → Shows UserCard in detail panel

**Search User:**
1. Focus search input (/)
2. Type name → Filters tree and list in real-time
3. Select user → Opens UserCard

**Admin: Add User:**
1. Admin clicks [+ Add User]
2. UserFormDialog opens
3. Fill required fields (email, name, dept, role)
4. Toggle "Send invite" checkbox
5. Click [Save] → Validates → Creates user + sends email
6. Toast: "User added. Invite sent to alice@company.com"

**Admin: Bulk Import:**
1. Click [Bulk Import]
2. Dialog opens → Download template
3. Fill Excel with user data
4. Upload file → Preview table shows validation
5. Fix errors or skip invalid rows
6. Click [Import] → Progress bar → Complete
7. Toast: "Imported 50 users successfully"

**Admin: Edit User:**
1. In user list, click [...] → Edit
2. UserFormDialog opens with pre-filled data
3. Change department from Engineering to Product
4. Click [Save] → Updates user
5. Toast: "User updated"
6. Audit log records: "Alice Chen moved to Product department"

**Admin: Deactivate User:**
1. Click [...] → Deactivate
2. Confirmation: "Deactivate Bob Smith? He won't be able to log in."
3. Confirm → User status changes to Inactive
4. User grayed out in list, presence shows offline
5. Toast: "Bob Smith deactivated"

---

## 4. States & Copy

**Empty:**
- No users in department: "(No members)"
- No search results: "No users match your search. Try different keywords."

**Errors:**
- Email duplicate: "Email already in use. Choose different email."
- Invalid email: "Invalid email format. Use name@company.com."
- Required field: "This field is required."
- Import error: "Row 5: Invalid email format"

**Confirmations:**
- Deactivate: "Deactivate [Name]? They won't be able to log in."
- Delete: "Permanently delete [Name]? All their data will be lost. This cannot be undone."
- Reset password: "Send password reset email to [email]?"

**Success:**
- User added: "User added successfully. Invite sent to [email]."
- User updated: "User updated successfully."
- User deactivated: "User deactivated. [Undo 5s]"
- Bulk import: "Imported 50 users successfully."
- Password reset: "Password reset email sent to [email]."

**Warnings:**
- Unsaved changes: "You have unsaved changes. Discard?"
- Import errors: "3 rows have errors. Fix them or skip to continue."

---

## 5. Layout Tokens

**Spacing:**
- Tree indent: `pl-6` (24px) per level
- Card padding: `p-6` (24px)
- List row: `py-3` (12px)

**Sizes:**
- Avatar: `w-12 h-12` (48px) in card, `w-8 h-8` in list
- Presence dot: `w-3 h-3` (12px)
- Tree node height: `h-10` (40px)

**Responsive:**
- Desktop: Tree + List side-by-side
- Tablet: Tree collapsible, List full width
- Mobile: Tree in drawer, List only

**Z-index:**
- Dialogs: `z-50`
- Dropdowns: `z-40`

---

## 6. RBAC Indicators

**Visual Role Badges:**
- Admin: Red badge "Admin"
- Manager: Blue badge "Manager"
- Member: Green badge "Member"
- Guest: Gray badge "Guest"

**Permission-based UI:**
- Show/hide actions based on user role
- Disable buttons if no permission
- Tooltip on disabled: "Admin permission required"

**In User List:**
- Role column shows badge
- Sort by role (Admin first)

**In UserCard:**
- Show role badge next to name
- If viewer is admin, show [Edit Permissions] link

---

## 7. A11y Checklist

✅ Org tree: `role="tree"`, keyboard nav `↑↓→←`  
✅ User list: `role="table"` or `role="grid"`  
✅ Dialogs: `role="dialog" aria-modal`, focus trap  
✅ Forms: Labels linked to inputs, errors announced  
✅ Actions: All keyboard accessible  
✅ Screen reader: Announce state changes (user added, etc.)  
✅ Contrast: Role badges 4.5:1 minimum  
✅ Focus rings: Visible on all interactive elements

---

## 8. Edge Cases

**Duplicate email in bulk import:** Show error, allow skip or edit

**User deleted while editing:** Show error "User no longer exists"

**Concurrent edit:** Detect conflicts, show warning "User modified by Admin. Reload?"

**Self-deactivation:** Prevent admins from deactivating themselves

**Last admin delete:** Prevent deletion if only 1 admin remains

**Circular department structure:** Validate on org tree edit, prevent cycles

**Large org (10k+ users):** Virtualize tree/list, lazy load branches

**Offline:** Show cached data, disable mutations, queue actions

---

## 9. Performance

- Virtualize user list if >200 users
- Lazy load org tree branches (fetch children on expand)
- Debounce search 300ms
- Cache user cards for 5 min
- Paginate audit logs (50 per page)

---

## 10. API Endpoints

```
GET    /api/directory/org-tree
GET    /api/directory/users?dept=&role=&status=&search=
GET    /api/directory/users/{id}
POST   /api/directory/users         (create)
PATCH  /api/directory/users/{id}    (update)
DELETE /api/directory/users/{id}    (deactivate or delete)
POST   /api/directory/users/bulk-import  (FormData with CSV/Excel)
GET    /api/directory/users/{id}/audit-log
POST   /api/directory/users/{id}/reset-password
GET    /api/directory/roles         (list roles & permissions)
PATCH  /api/directory/roles/{id}    (update role permissions)
```

---

**Success Criteria:** Full CRUD for users, bulk import functional, RBAC clear in UI, audit logs complete, WCAG AA, no dev questions.
