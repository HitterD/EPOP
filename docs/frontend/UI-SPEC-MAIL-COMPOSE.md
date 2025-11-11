# UI Specification: Mail Compose & Folders

## 1. Components

### MailSidebar
**Props:** `folders`, `selectedFolder`, `onSelectFolder`, `unreadCounts`

**Layout:**
```
[+ Compose]
📥 Inbox      (12)
📤 Sent
🗑️ Deleted    (3)
📋 Drafts     (1)
```

**Keyboard:** `C` compose, `G I` inbox, `G S` sent, `G D` deleted

**States:** loading skeleton, selected `bg-accent`, hover `bg-accent/50`

**A11y:** `role="navigation"`, badge `aria-label="12 unread"`

---

### MailList
**Props:** `messages`, `selectedIds`, `onSelect`, `onBulkAction`, `sortBy`

**Layout:**
```
[✓] [Delete] [Archive] [Mark Read]    Sort: Date ▼
[ ] ⭐ Alice Chen     Re: Project...      10:30
[✓]    Bob Smith     Invoice #1234      09:15
[ ] 🔴 Carol Lee     URGENT: Server...  08:00
```

**Row:** `[Checkbox] [Priority] [Avatar] [Name] [Subject] [Time] [Unread•]`

**Keyboard:** `J/K` navigate, `X` select, `Shift+A` archive, `Shift+D` delete, `Enter` open, `U` mark unread, `S` star

**Selection:** Single (X), Multi (Cmd+click), Range (Shift+click), All (`*+A`)

**States:** unread (bold + blue dot), selected `bg-accent`, loading skeleton, empty "No messages"

**A11y:** `role="table"`, `aria-selected`, announce selection count

---

### MailDetail
**Props:** `message`, reply/forward/delete actions

**Layout:**
```
[← Back]  [Reply] [Reply All] [Forward] [...]
Re: Project Update                         ⭐
From: Alice <alice@company.com>
To: You, Bob
CC: Carol
Date: Jan 15, 2025 10:30 AM
📎 document.pdf (2.4 MB) [Download] [Preview]
─────────────────────────────────────────
Message body content...
```

**Actions menu:** Mark unread, toggle priority, archive, delete, print, block, report

**Keyboard:** `R` reply, `A` reply all, `F` forward, `Shift+D` delete, `E` archive, `U` mark unread

**A11y:** `role="article"`, sanitized HTML body

---

### MailComposer
**Props:** `mode` (compose/reply/forward), `replyTo`, `onSend`, `onSaveDraft`

**Layout:**
```
[Send] [Discard] [Save Draft]
To:      [Alice Chen, Bob...]        [↓]
Cc:      [Add CC]
Subject: [Re: Project Update]
Priority: [ ] High
[B] [I] [U] [List] [Link] [📎] [😊]
Type your message...
📎 image.png (1.2 MB) [×]
```

**Toolbar:** Bold (Cmd+B), Italic (Cmd+I), Underline (Cmd+U), Lists, Link (Cmd+K), Attach, Emoji

**Draft autosave:** Every 3s to localStorage, show "Saving..." indicator

**Validation:** Require ≥1 recipient, warn if subject empty, block >25MB files

**Keyboard:** `Cmd+Enter` send, `Cmd+S` save draft, `Escape` discard

**States:** composing, sending (disabled+spinner), uploading (show progress), offline (disabled), error (red border)

**A11y:** `role="form"`, recipient `role="combobox"`, editor `role="textbox" aria-multiline`

---

### RecipientInput
**Props:** `value`, `onChange`, `suggestions`, `onSearch`

**Behavior:** Type → autocomplete dropdown → select → chip with avatar+name → remove with backspace/click X

**A11y:** `role="combobox" aria-autocomplete="list"`, dropdown `role="listbox"`

---

### AttachmentChip
**Props:** `file`, `progress`, `status` (uploading/uploaded/error), `onRemove`, `onRetry`

**Visual:**
```
[Icon] document.pdf (2.4 MB) [Progress: 45%] [×]
[Icon] image.png (1.2 MB) [✓] [Preview] [×]
[Icon] video.mp4 [Error: Too large] [Retry] [×]
```

**Icons:** `<FileText/>` PDF, `<Image/>` images, `<Video/>`, `<File/>` generic

---

### BulkActionBar
**Props:** `selectedCount`, delete/archive/mark actions

**Visual:** `3 selected [Delete] [Archive] [Mark Read] [Move ▼]`

**Position:** Sticky top, visible when selection > 0

**A11y:** `role="toolbar"`, announce count changes

---

## 2. User Flows

**Compose & Send:**  
Compose (C) → To autocomplete → Subject → Body → Attach files (progress) → Send (Cmd+Enter) → Optimistic Sent folder → Confirm → Toast "Sent"

**Reply:**  
Open message → Reply (R) → Pre-filled To/Subject/Quoted body → Type above quote → Send

**Bulk Delete:**  
Navigate (J/K) → Select (X) multi → Delete (Shift+D) → Confirm → Move to Deleted → Toast "3 deleted [Undo 5s]"

**Draft Recovery:**  
Compose → Auto-save every 3s → Browser crash → Return → Toast "Draft found [Restore] [Discard]"

**Forward:**  
Open → Forward (F) → Empty To → Original body+attachments → Add recipients → Send

---

## 3. States & Copy

**Empty:** Inbox "You're all caught up! 🎉", Sent "Start a conversation", Deleted "Trash is empty"

**Errors:**
- Network: "Connection lost. Check internet."
- Send failed: "Failed to send. Check recipients."
- Upload >25MB: "File exceeds limit. Choose smaller file."
- Blocked .exe: ".exe files not allowed for security."

**Confirmations:**
- Delete: "Delete message? Moved to Trash."
- Discard: "Discard message? Unsaved changes lost."

**Success:** "Message sent", "Draft saved", "3 messages deleted [Undo]", "Archived [Undo]"

---

## 4. Layout Tokens

**Spacing:** Sidebar `w-64`, list `px-4 py-3`, composer `p-6`, toolbar `h-12`

**Density:** Compact `py-2`, Default `py-3`, Comfortable `py-4`

**Responsive:**
- Mobile: Stacked (full width)
- Tablet (769px+): Sidebar + List
- Desktop (1024px+): Sidebar + List + Detail (grid: `256px 400px 1fr`)

**Z-index:** Bulk bar `z-10`, composer `z-50`, dropdowns `z-40`, toasts `z-100`

---

## 5. A11y Checklist

✅ Roles: navigation, table, article, form, toolbar, combobox  
✅ Keyboard: J/K navigate, X select, Enter open, R reply, shortcuts documented  
✅ Screen reader: Announce selection, folder changes, errors  
✅ Focus: Auto-focus composer, trap in modal, visible rings `ring-2 ring-primary`  
✅ Contrast: 4.5:1 text, 3:1 UI  
✅ Motion: Respect `prefers-reduced-motion`

---

## 6. Edge Cases

**Duplicate send:** Disable button on click, debounce

**Large file:** Block >25MB, suggest file sharing link

**Offline compose:** Save draft to localStorage, disable send, queue on reconnect

**Draft conflict (multi-tab):** Sync via localStorage events, warn "Modified in another tab [Reload]"

**Invalid recipient:** Validate on blur, show red chip, prevent send

**Delete undo:** Move to Deleted, toast [Undo 5s], permanent delete needs confirmation

**Empty subject:** Confirm "Send without subject? [Go back] [Send anyway]"

**Upload retry:** Show [Retry] on error, max 3 retries

---

## 7. Performance

- Virtualize list (`@tanstack/react-virtual`) for 1000+ messages
- Debounce draft save 3s, recipient search 300ms
- Chunked upload for files >5MB with resume support
- Sanitize HTML once on receive, cache result

---

## 8. API Endpoints

```
GET    /api/mail/{folderId}?page=1&limit=50&sort=date
POST   /api/mail/send         (to, cc, bcc, subject, body, attachments, priority)
POST   /api/mail/drafts       (to, subject, body, attachments)
PATCH  /api/mail/move         (messageIds[], targetFolder)
DELETE /api/mail/bulk         (messageIds[])
POST   /api/mail/attachments  (FormData file)
```

---

**Success Criteria:** Full CRUD lifecycle, all states defined, keyboard nav complete, A11y WCAG AA, no dev questions needed.
