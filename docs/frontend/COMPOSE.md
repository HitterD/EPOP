# Compose / Mail Feature

## Overview
Email-style messaging with folders (Received, Sent, Deleted).

## Implementation Status
- ✅ FE-4: Cursor pagination on mail lists
- ✅ FE-5: Idempotency-Key on send mail
- ✅ FE-9: HTML sanitization (DOMPurify) + folder operations
- ✅ FE-10: Bulk operations + send-as-mail from chat

## Routes
- `/mail/received` - Inbox
- `/mail/sent` - Sent items
- `/mail/deleted` - Deleted items
- `/mail/[folder]/[messageId]` - Message detail

## Components

### MailList
- Folder sidebar
- Message list with subject/preview
- Unread indicators
- Star/flag messages

### MailDetail
- Header: To, Cc, Bcc, Subject
- HTML body rendering
- Attachments list
- Reply/Forward/Delete actions

### MailCompose
- To/Cc/Bcc fields with autocomplete
- Subject line
- Rich text editor
- Priority selector
- Attachments
- Send/Save draft

## HTML Sanitization (FE-9)

### Client-Side Sanitization
```typescript
import { sanitizeHtml, sanitizeEmailHtml } from '@/lib/utils/sanitize'

// Render email body safely
<div dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(message.body) }} />

// More permissive for compose
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
```

**Allowed Tags:** p, br, strong, em, u, a, ul, ol, li, blockquote, h1-h6
**Blocked:** script, iframe, object, embed, form

### Server-Side
Backend also sanitizes HTML before storing (defense in depth).

## Folder Operations (FE-9)

### Move Message
```typescript
const { mutate: moveMessage } = useMoveMail()
moveMessage({ 
  messageId, 
  folder: 'deleted' 
})
```

### Bulk Operations (FE-10)
```typescript
// Bulk move
const { mutate: bulkMove } = useBulkMoveMail()
bulkMove({ 
  messageIds: ['msg-1', 'msg-2'], 
  folder: 'deleted' 
})

// Restore from deleted
const { mutate: restore } = useRestoreMail()
restore(['msg-1', 'msg-2'])

// Permanent delete
const { mutate: permDelete } = usePermanentlyDeleteMail()
permDelete(['msg-1', 'msg-2'])
```

## Send as Mail from Chat (FE-10)

### Toggle in Chat Compose
```typescript
// In chat compose UI
<button onClick={() => setMode('mail')}>
  Send as Mail
</button>

// Opens mail compose dialog
// Pre-fills recipients from chat members
// Sends via /api/mail instead of /api/messages
```

### File Autolink
Attachments uploaded to mail automatically appear in Files module with `context_type='mail'`.
