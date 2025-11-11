# Implementation Prompt: Mail Compose & Folders

**Target:** Claude Sonnet 4.5  
**Purpose:** Generate React components, Storybook stories, and accessibility tests  
**Reference:** [UI-SPEC-MAIL-COMPOSE.md](./UI-SPEC-MAIL-COMPOSE.md)

---

## Context

Implementing email-like messaging system for EPOP (Next.js 14, Tailwind CSS + shadcn/ui, Lucide icons).

**Reference:** All requirements in `UI-SPEC-MAIL-COMPOSE.md`

**Project Setup:**
- Next.js 14 App Router
- Tailwind CSS + shadcn/ui
- Lucide React icons
- Jest + @testing-library/react
- Storybook v7+

---

## Task: Implement Mail Module

### Components to Create (in `components/mail/`)

#### 1. `MailSidebar.tsx`
**Props:**
```typescript
interface MailSidebarProps {
  folders: MailFolder[]
  selectedFolder: string
  onSelectFolder: (folderId: string) => void
  onCompose: () => void
  unreadCounts: Record<string, number>
}

interface MailFolder {
  id: 'inbox' | 'sent' | 'deleted' | 'drafts' | 'archive'
  label: string
  icon: LucideIcon
  count: number
}
```

**Requirements:**
- Folder list with icons (Inbox 📥, Sent 📤, Deleted 🗑️, etc.)
- Unread count badges
- [+ Compose] button at top
- Selected folder highlighted `bg-accent`
- Keyboard: C to compose, G+I/S/D for navigation
- A11y: `role="navigation"`

**Reference:** Section 1.1 in UI-SPEC-MAIL-COMPOSE.md

---

#### 2. `MailList.tsx`
**Props:**
```typescript
interface MailListProps {
  messages: MailMessage[]
  selectedIds: string[]
  onSelect: (id: string, multi?: boolean) => void
  onSelectAll: () => void
  onOpen: (id: string) => void
  onBulkAction: (action: BulkAction, ids: string[]) => void
  loading?: boolean
  error?: Error
  sortBy: 'date' | 'sender' | 'subject'
  sortOrder: 'asc' | 'desc'
}

interface MailMessage {
  id: string
  from: User
  subject: string
  preview: string
  timestamp: Date
  isRead: boolean
  priority: 'normal' | 'high'
  hasAttachments: boolean
}
```

**Requirements:**
- Table-like list with checkboxes
- Bulk action bar when items selected
- Unread: Bold text + blue dot
- Priority: Red circle icon for high priority
- Hover: Show quick actions (star, archive, delete)
- Keyboard: J/K navigate, X select, Enter open, Shift+D delete
- A11y: `role="table"`, announce selection count

**Reference:** Section 1.2 in UI-SPEC-MAIL-COMPOSE.md

---

#### 3. `MailDetail.tsx`
**Props:**
```typescript
interface MailDetailProps {
  message: MailMessage
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onDelete: () => void
  onArchive: () => void
  onTogglePriority: () => void
  loading?: boolean
}
```

**Requirements:**
- Header: From, To, CC, Date, Subject
- Priority badge if high
- Attachment chips with download buttons
- Action buttons: Reply, Reply All, Forward, Delete
- Actions menu (...) with more options
- Sanitized HTML body display
- Keyboard: R reply, A reply all, F forward
- A11y: `role="article"`

**Reference:** Section 1.3 in UI-SPEC-MAIL-COMPOSE.md

---

#### 4. `MailComposer.tsx`
**Props:**
```typescript
interface MailComposerProps {
  mode: 'compose' | 'reply' | 'replyAll' | 'forward'
  replyTo?: MailMessage
  to?: User[]
  onSend: (data: MailComposerData) => void
  onSaveDraft: (data: MailComposerData) => void
  onDiscard: () => void
  loading?: boolean
}

interface MailComposerData {
  to: User[]
  cc: User[]
  bcc: User[]
  subject: string
  body: string // HTML
  attachments: File[]
  priority: 'normal' | 'high'
}
```

**Requirements:**
- Recipient fields with autocomplete (To, Cc, Bcc)
- Subject line input
- Rich text editor (bold, italic, underline, lists, links)
- File attachment with progress bars
- Priority checkbox
- Send, Save Draft, Discard buttons
- Draft auto-save every 3s
- Keyboard: Cmd+Enter send, Cmd+S save, Escape discard
- A11y: `role="form"`, proper field labels

**Reference:** Section 1.4 in UI-SPEC-MAIL-COMPOSE.md

---

#### 5. `RecipientInput.tsx`
**Props:**
```typescript
interface RecipientInputProps {
  value: User[]
  onChange: (users: User[]) => void
  placeholder?: string
  suggestions?: User[]
  onSearch: (query: string) => void
  label: string
  required?: boolean
}
```

**Requirements:**
- Chip-based display for selected users
- Autocomplete dropdown on typing
- Remove chip with X or Backspace
- Avatar + name + email in dropdown
- A11y: `role="combobox" aria-autocomplete="list"`

**Reference:** Section 1.5 in UI-SPEC-MAIL-COMPOSE.md

---

#### 6. `AttachmentChip.tsx`
**Props:**
```typescript
interface AttachmentChipProps {
  file: File | Attachment
  progress?: number // 0-100
  status: 'uploading' | 'uploaded' | 'error'
  onRemove: () => void
  onRetry?: () => void
  onPreview?: () => void
}
```

**Requirements:**
- File icon based on type (PDF, image, video, doc)
- File name + size
- Progress bar when uploading
- Checkmark when uploaded
- Error state with retry button
- Preview button for images/PDFs

**Reference:** Section 1.6 in UI-SPEC-MAIL-COMPOSE.md

---

#### 7. `BulkActionBar.tsx`
**Props:**
```typescript
interface BulkActionBarProps {
  selectedCount: number
  onDelete: () => void
  onArchive: () => void
  onMarkRead: () => void
  onMarkUnread: () => void
  onMove: (folderId: string) => void
  onClearSelection: () => void
}
```

**Requirements:**
- Sticky at top of MailList when selection active
- Show selected count
- Action buttons: Delete, Archive, Mark Read, Move
- Clear selection button
- A11y: `role="toolbar"`

**Reference:** Section 1.7 in UI-SPEC-MAIL-COMPOSE.md

---

#### 8. `EmptyState.tsx`
**Props:**
```typescript
interface EmptyStateProps {
  folder: 'inbox' | 'sent' | 'deleted' | 'drafts' | 'archive'
  onAction?: () => void
}
```

**Requirements:**
- Contextual copy per folder
- Large icon illustration
- Optional CTA button
- Examples: "You're all caught up! 🎉", "No drafts saved."

**Reference:** Section 1.8 in UI-SPEC-MAIL-COMPOSE.md

---

## Storybook Stories (in `stories/mail/`)

### `MailSidebar.stories.tsx`
- Default (all folders with counts)
- SelectedInbox (inbox selected)
- NoUnread (all counts zero)

### `MailList.stories.tsx`
- Default (5-10 messages)
- WithUnread (some bold + blue dots)
- WithPriority (high priority messages)
- Selected (some rows selected, bulk bar visible)
- Loading (skeleton rows)
- Empty (no messages)
- Error (error banner with retry)

### `MailDetail.stories.tsx`
- Default (normal message)
- WithAttachments (file chips)
- HighPriority (red banner)
- WithCC (CC field visible)
- Loading (skeleton)

### `MailComposer.stories.tsx`
- Compose (empty new message)
- Reply (pre-filled recipient + quoted body)
- WithRecipients (chips displayed)
- WithAttachments (uploading + uploaded)
- Sending (disabled, spinner)
- Error (red border, error message)

### Additional Stories
- `RecipientInput.stories.tsx` — Empty, with chips, dropdown open
- `AttachmentChip.stories.tsx` — Uploading, uploaded, error
- `BulkActionBar.stories.tsx` — With selection count, actions

---

## Accessibility Tests (in `__tests__/mail/`)

### `MailList.test.tsx`
```typescript
describe('MailList Accessibility', () => {
  it('has role="table"', () => {})
  it('announces selection count', () => {})
  it('supports keyboard navigation (J/K/X)', () => {})
  it('has visible focus indicators', () => {})
})
```

### `MailComposer.test.tsx`
```typescript
describe('MailComposer Accessibility', () => {
  it('has role="form"', () => {})
  it('links labels to inputs', () => {})
  it('announces validation errors', () => {})
  it('supports Cmd+Enter to send', () => {})
})
```

### `RecipientInput.test.tsx`
```typescript
describe('RecipientInput Accessibility', () => {
  it('has role="combobox"', () => {})
  it('dropdown has role="listbox"', () => {})
  it('supports arrow key navigation', () => {})
})
```

---

## Implementation Guidelines

### Rich Text Editor
Use **Tiptap** or **Lexical** for rich text:
```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const editor = useEditor({
  extensions: [StarterKit, Link],
  content: '',
})
```

Toolbar buttons trigger: `editor.chain().focus().toggleBold().run()`

### Draft Auto-save
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onSaveDraft(composerData)
  }, 3000)
  return () => clearTimeout(timer)
}, [composerData])
```

### Styling
- Use shadcn/ui: Button, Input, Textarea, Select, Popover, ScrollArea
- Folder icons: Lucide `<Inbox />`, `<Send />`, `<Trash2 />`, `<Archive />`
- Priority icon: `<AlertCircle className="text-red-500" />`

---

## Commands

```bash
# Storybook
pnpm storybook

# Tests
pnpm test mail

# Accessibility audit
pnpm test:a11y mail
```

---

## Verification Checklist

**Components:**
- [ ] All 8 components in `components/mail/`
- [ ] Vim-style keyboard shortcuts work (J/K/X)
- [ ] Rich text editor functional (bold, italic, lists, links)
- [ ] Draft auto-save works (3s debounce)
- [ ] Attachment upload with progress
- [ ] Dark/light mode

**Storybook:**
- [ ] Stories for all components
- [ ] All states covered (loading, empty, error, sending)
- [ ] Interactive controls work

**Accessibility:**
- [ ] All tests pass
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Form validation accessible

---

## Success Criteria

✅ Mail workflow works end-to-end in Storybook  
✅ Keyboard shortcuts functional (J/K/X/R/A/F)  
✅ Rich text editor works with toolbar  
✅ Accessibility tests 100% pass  
✅ Visual matches UI-SPEC-MAIL-COMPOSE.md  
✅ No TypeScript errors

---

**Implementation Order:**
1. MailSidebar, MailList (core navigation)
2. MailDetail (message view)
3. MailComposer, RecipientInput, AttachmentChip (compose flow)
4. BulkActionBar, EmptyState (polish)
