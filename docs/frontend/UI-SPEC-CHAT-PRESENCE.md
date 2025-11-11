# UI Specification: Real-time Chat & Presence

## Overview
Complete UI specification for real-time chat with threads, reactions, read receipts, and presence indicators. All components use shadcn/ui + Lucide icons with full keyboard navigation and ARIA support.

---

## 1. Component Inventory

### 1.1 ChatList
**Purpose:** Display all conversations with presence, unread counts, and preview

**Props:**
```typescript
interface ChatListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
  filter?: 'all' | 'unread' | 'mentions'
  loading?: boolean
  error?: Error
}
```

**Variants:**
- `default` - Standard density
- `compact` - Reduced spacing for power users
- `comfortable` - Increased spacing for accessibility

**States:**
- **Loading:** Skeleton with shimmer animation (3-5 items)
- **Empty:** Illustration + "No conversations yet" + CTA "Start a chat"
- **Error:** Alert banner + retry button
- **Offline:** Yellow banner "You're offline. Reconnecting..."
- **Optimistic:** New message shows with spinner, grayed until confirmed

**Component Structure:**
```
<ScrollArea className="h-full">
  <div role="list" aria-label="Conversations">
    {conversations.map(conv => (
      <ChatListItem key={conv.id} {...conv} />
    ))}
  </div>
</ScrollArea>
```

**Keyboard Shortcuts:**
- `↓/↑` - Navigate conversations
- `Enter` - Open selected conversation
- `Cmd+K` - Quick switch dialog
- `/` - Focus filter search
- `Cmd+N` - New conversation

**A11y:**
- `role="list"` on container
- `role="listitem"` on each item
- `aria-label` with unread count: "Chat with John Doe, 3 unread messages"
- `aria-current="true"` for selected item
- Focus ring with `ring-2 ring-primary ring-offset-2`

---

### 1.2 ChatListItem
**Purpose:** Single conversation preview with presence, typing, timestamp

**Props:**
```typescript
interface ChatListItemProps {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  presence: 'online' | 'away' | 'offline'
  typing?: boolean
  selected?: boolean
  onClick: () => void
}
```

**Visual Layout:**
```
┌──────────────────────────────────────────┐
│ [Avatar+Presence] Name [5555]     [Time] │
│                   Last msg...        [3] │ ← Badge unread
└──────────────────────────────────────────┘
```

**Presence Indicator:**
- Online: `<div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-background" />`
- Away: `bg-yellow-500`
- Offline: `bg-gray-400`
- Position: Absolute bottom-right of avatar

**Typing Indicator:**
- Show animated dots: "typing..."
- Replace last message preview
- `<div aria-live="polite" aria-atomic="true">John is typing...</div>`

**States:**
- **Hover:** `bg-accent/50`
- **Focus:** `ring-2 ring-primary`
- **Selected:** `bg-accent`
- **Unread:** Bold name + badge with count

---

### 1.3 ThreadView
**Purpose:** Display message thread with nested replies

**Props:**
```typescript
interface ThreadViewProps {
  conversationId: string
  messages: Message[]
  currentUserId: string
  onReply: (messageId: string, content: string) => void
  onReact: (messageId: string, emoji: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  error?: Error
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
}
```

**Layout Structure:**
```
┌──────────────────────────────────────┐
│ [Reconnect Banner - if disconnected] │
│──────────────────────────────────────│
│ ▼ Thread: "Initial message content"  │
│   ├─ Reply by Alice (1hr ago)        │
│   │  [💯 2] [❤️ 5]  [...] [Reply]    │
│   └─ Reply by Bob (30min ago)        │
│      [👍 1]  [...] [Reply]            │
│──────────────────────────────────────│
│ [Message Composer]                   │
└──────────────────────────────────────┘
```

**Message States:**
- **Sending:** Gray with spinner icon
- **Sent:** Normal color
- **Failed:** Red border + "Failed to send" + Retry button
- **Edited:** "(edited)" label
- **Deleted:** Strikethrough + "(deleted)"

**Optimistic Updates:**
- Immediately append message with `status: 'sending'`
- Show spinner in timestamp position
- On success: Replace with server message
- On failure: Show error state + retry action

**Infinite Scroll:**
- Load more when scrolling to top
- Show skeleton loader while fetching
- Preserve scroll position after insert

**Keyboard Shortcuts:**
- `R` - Reply to focused message
- `E` - React to focused message
- `↓/↑` - Navigate messages
- `Cmd+Enter` - Send message in composer
- `N` - Jump to next unread

**A11y:**
- `role="feed"` for message container
- Each message: `role="article" aria-label="Message from [name] at [time]"`
- Live region for new messages: `<div aria-live="polite" aria-atomic="false">`
- Focus management: Auto-focus composer or first unread on mount

---

### 1.4 MessageItem
**Purpose:** Single message with reactions, replies, read receipts

**Props:**
```typescript
interface MessageItemProps {
  id: string
  content: string
  author: User
  timestamp: Date
  reactions: Reaction[]
  replyCount: number
  readBy: User[]
  isMine: boolean
  status?: 'sending' | 'sent' | 'failed'
  onReply: () => void
  onReact: (emoji: string) => void
  onEdit?: () => void
  onDelete?: () => void
}
```

**Visual Layout (Own Message - Right Aligned):**
```
                        [Avatar] You [5550]
                        Content here
                        [💯 2] [❤️ 5]
                        Read by: Alice, Bob, +3
                        10:30 AM ✓✓
```

**Visual Layout (Others - Left Aligned):**
```
[Avatar] Alice [5555]
Content here
[💯 2] [❤️ 5] [Reply] [...]
10:30 AM
```

**Extension Display:**
- Show user's phone extension next to their name in a small badge
- Style: `Badge` component with `variant="outline"` and `font-mono` class
- Position: Right next to the author's name
- Example: `Alice Chen [5555]`
- Only display if extension exists

**Read Receipts:**
- Display avatar stack of readers (max 3 visible)
- Tooltip on hover: "Read by Alice, Bob, Charlie, and 5 others"
- Component: `<AvatarStack users={readBy} max={3} />`

**Reactions:**
- Display as pill badges: `[emoji count]`
- Highlight if current user reacted: `bg-primary/10 border-primary`
- Click to toggle reaction
- Max 3 reactions inline, rest in "..." popover

**Actions Menu (...):**
- Edit (only if mine, within 5min)
- Delete (only if mine)
- Copy text
- Pin to channel
- Report (if not mine)

**Keyboard:**
- `Tab` to focus message
- `R` to reply
- `E` to open reaction picker
- `Enter` on menu button to open actions

**A11y:**
- `aria-label="Message from Alice at 10:30 AM: [content preview]"`
- Reactions: `role="group" aria-label="Reactions"`
- Read receipts: `aria-label="Read by 5 people"`

---

### 1.5 MessageComposer
**Purpose:** Rich input with emoji picker, file attach, @mentions

**Props:**
```typescript
interface MessageComposerProps {
  onSend: (content: string, files?: File[]) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  uploadProgress?: Record<string, number>
  mentionSuggestions?: User[]
}
```

**Layout:**
```
┌──────────────────────────────────────┐
│ Type a message...                    │
│ [@alice] mentioned                   │
│──────────────────────────────────────│
│ [📎] [😊] [GIF]     [Send ✓] │
└──────────────────────────────────────┘
```

**Features:**
- **Emoji Picker:** Popover with search + categories (using Lucide icons or emoji-mart)
- **File Attach:** Click or drag-drop, show chips below input
- **@Mentions:** Autocomplete dropdown on typing `@`
- **Draft Autosave:** Save to localStorage every 2s

**File Upload Chips:**
```
[document.pdf] [×] [Progress: 45%]
[image.png] [✓] [Uploaded]
```

**States:**
- **Empty:** Show placeholder
- **Typing:** Show character count if near limit
- **Uploading:** Disable send, show progress
- **Error:** Red border + error message below
- **Offline:** Disable + "You're offline"

**Keyboard:**
- `Cmd+Enter` - Send
- `Escape` - Clear input or close mention dropdown
- `↓/↑` - Navigate mentions
- `Tab` - Accept mention

**A11y:**
- `role="textbox" aria-label="Message input" aria-multiline="true"`
- Mention dropdown: `role="listbox" aria-label="Mention suggestions"`
- Upload button: `aria-label="Attach files"`
- Character count: `aria-live="polite"` when near limit

---

### 1.6 PresenceBadge
**Purpose:** Reusable presence indicator

**Props:**
```typescript
interface PresenceBadgeProps {
  status: 'online' | 'away' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}
```

**Variants:**
- `sm` - 8px dot
- `md` - 12px dot (default)
- `lg` - 16px dot

**Pulse Animation (online only):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

### 1.7 TypingIndicator
**Purpose:** Show who is typing in conversation

**Props:**
```typescript
interface TypingIndicatorProps {
  users: string[] // Names of users typing
}
```

**Display:**
- 1 user: "Alice is typing..."
- 2 users: "Alice and Bob are typing..."
- 3+ users: "Alice, Bob, and 2 others are typing..."

**Animation:**
- Three bouncing dots
- `aria-live="polite"` for screen readers

**Component:**
```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
  <span>{typingText}</span>
  <span className="flex gap-1">
    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
  </span>
</div>
```

---

### 1.8 ReconnectBanner
**Purpose:** Show connection status and retry action

**Props:**
```typescript
interface ReconnectBannerProps {
  status: 'connecting' | 'disconnected'
  onRetry?: () => void
  autoRetryIn?: number // seconds
}
```

**Visual:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Connection lost. Reconnecting...  [×] │
└─────────────────────────────────────────┘
```

**States:**
- **Connecting:** Yellow banner + spinner + "Reconnecting..."
- **Disconnected:** Red banner + "Connection lost" + [Retry] button
- **Auto-retry:** Show countdown: "Retrying in 5s..."

**Auto-dismiss:** When reconnected

**A11y:**
- `role="alert"` for immediate announcement
- `aria-live="assertive"` for critical state changes

---

## 2. User Flows

### Flow 1: Start New Chat
1. User clicks "New Chat" button or `Cmd+N`
2. Dialog opens with user search
3. User types to filter contacts
4. Select user → Opens empty thread
5. Composer auto-focused
6. Type message → Send
7. Optimistic update → Shows sending state
8. WebSocket confirms → Updates to sent state

### Flow 2: Reply to Thread
1. User hovers message → [Reply] button appears
2. Click or press `R` → Opens inline reply composer
3. Type reply → `@mention` user
4. Mention dropdown appears → Select with `↓` + `Enter`
5. Send → Reply nests under parent
6. Parent shows reply count badge

### Flow 3: Add Reaction
1. Hover message → Reaction button (😊) appears
2. Click or press `E` → Emoji picker popover
3. Select emoji → Immediately adds to message
4. Optimistic: Shows reaction with count+1
5. WebSocket confirms → Updates final count
6. Click again to remove reaction

### Flow 4: Read Receipts
1. User scrolls message into view
2. Client sends `read` event to server
3. Server broadcasts to all participants
4. Other users' UI updates read receipt avatars
5. Sender sees "Read by Alice, Bob..."

### Flow 5: Handle Disconnect
1. WebSocket disconnects
2. Banner appears: "Connection lost. Reconnecting..."
3. Auto-retry every 5s (exponential backoff)
4. Queue outgoing messages locally
5. On reconnect: Flush queue + sync missed messages
6. Banner dismisses

### Flow 6: Handle Duplicate Message
1. Optimistic message assigned `clientId`
2. Server confirms with `serverId`
3. Client deduplicates by matching content + timestamp
4. Replace optimistic with confirmed message
5. Prevent duplicate if server pushes same message via broadcast

---

## 3. Interaction Rules

### Hover States
- **ChatListItem:** `bg-accent/50` + show timestamp
- **Message:** Show action buttons (Reply, React, ...)
- **Reaction:** Show tooltip with user list

### Focus States
- All interactive elements: `ring-2 ring-primary ring-offset-2`
- Skip navigation: Tab skips to main composer with "Skip to compose" link

### Touch States
- Long-press message → Context menu (mobile)
- Swipe-to-reply (optional, mobile)
- Pull-to-refresh for loading more messages

### Loading States
- **Initial load:** Full-page skeleton (3-5 messages)
- **Pagination:** Top-aligned skeleton
- **Sending:** Spinner in message timestamp
- **Uploading:** Progress bar in file chip

### Error States
- **Network error:** Red banner + "Check your connection" + Retry
- **Send failed:** Red border on message + "Failed to send" + Retry
- **Upload failed:** Red chip with "Upload failed" + Remove button

---

## 4. Copywriting & Micro-copy

### Empty States
- **No conversations:** "No conversations yet. Start chatting with your team!"
- **No messages:** "This is the beginning of your conversation with [Name]"
- **No results:** "No conversations match your search"

### Error Messages
- **Network error:** "Connection lost. Trying to reconnect..."
- **Send failed:** "Message failed to send. Retry or delete."
- **Upload failed:** "Upload failed. File too large or connection lost."
- **Quota exceeded:** "Storage limit reached. Delete old files or upgrade."

### Offline States
- **Banner:** "You're offline. Messages will send when reconnected."
- **Composer disabled:** "Cannot send while offline"

### Confirmation
- **Delete message:** "Delete this message? This cannot be undone."
- **Leave conversation:** "Leave this chat? You'll no longer see new messages."

### Success Toast
- **Message sent:** (silent, no toast needed)
- **File uploaded:** "File uploaded successfully"
- **Reaction added:** (silent)

---

## 5. Layout Tokens

### Spacing
- **Message vertical gap:** `space-y-2` (8px)
- **Reply indent:** `ml-8` (32px)
- **Composer padding:** `p-4` (16px)
- **List item padding:** `px-4 py-3` (16px, 12px)

### Density Modes
- **Compact:** `py-1.5` on list items, `text-sm`
- **Default:** `py-3`, `text-base`
- **Comfortable:** `py-4`, `text-lg`

### Min/Max Widths
- **ChatList sidebar:** `min-w-[280px] max-w-[360px]`
- **ThreadView:** `flex-1` (fluid)
- **Message bubble:** `max-w-prose` (~65ch)
- **Composer:** `min-h-[80px]`

### Responsive Rules
```css
/* Mobile: Stacked layout */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }
  .chat-list {
    width: 100%;
    max-height: 40vh;
  }
}

/* Tablet+: Side-by-side */
@media (min-width: 769px) {
  .chat-container {
    flex-direction: row;
  }
  .chat-list {
    width: 320px;
  }
}

/* Desktop: Max width for readability */
@media (min-width: 1280px) {
  .thread-view {
    max-width: 1024px;
    margin: 0 auto;
  }
}
```

### Z-index Scale
- **Reconnect banner:** `z-50`
- **Popover (emoji, mentions):** `z-40`
- **Dialog:** `z-50`
- **Toast:** `z-100`

---

## 6. Accessibility Checklist

### ARIA Roles
- ✅ `role="list"` on ChatList container
- ✅ `role="listitem"` on ChatListItem
- ✅ `role="feed"` on ThreadView messages
- ✅ `role="article"` on MessageItem
- ✅ `role="textbox"` on MessageComposer
- ✅ `role="listbox"` on mention dropdown
- ✅ `role="alert"` on ReconnectBanner

### Live Regions
- ✅ Typing indicator: `aria-live="polite"`
- ✅ New message: `aria-live="polite" aria-atomic="false"`
- ✅ Connection status: `aria-live="assertive"`
- ✅ Character count: `aria-live="polite"` (when > 80%)

### Focus Management
- ✅ Auto-focus composer on thread open
- ✅ Focus first unread message if exists
- ✅ Return focus to trigger after dialog close
- ✅ Trap focus in modal dialogs

### Keyboard Navigation
- ✅ All interactive elements keyboard-accessible
- ✅ Visible focus indicators (`ring-2 ring-primary`)
- ✅ Skip links for main regions
- ✅ Shortcut documentation in `?` help dialog

### Screen Reader Support
- ✅ All images have `alt` text
- ✅ Buttons have `aria-label` when icon-only
- ✅ Form inputs have `<label>` associations
- ✅ Error messages linked to inputs via `aria-describedby`

### Color Contrast
- ✅ Text: Minimum 4.5:1 (WCAG AA)
- ✅ Large text: Minimum 3:1
- ✅ UI components: Minimum 3:1
- ✅ Dark mode: Maintain same contrast ratios

### Motion
- ✅ Respect `prefers-reduced-motion`
- ✅ Disable pulse/bounce animations when requested
- ✅ Provide static alternatives

---

## 7. Edge Cases & State Handling

### Duplicate Message Delivery
**Problem:** WebSocket sends same message twice (reconnect/server retry)

**Solution:**
```typescript
const messageMap = new Map<string, Message>()

function handleIncomingMessage(msg: Message) {
  if (messageMap.has(msg.id)) {
    // Deduplicate by ID
    return
  }
  
  // Check for optimistic match
  const optimistic = findByClientId(msg.clientId)
  if (optimistic) {
    // Replace optimistic with server version
    replaceMessage(optimistic.id, msg)
  } else {
    addMessage(msg)
  }
  
  messageMap.set(msg.id, msg)
}
```

### Message Send Failure
**Scenario:** User sends message, but request fails (network/server error)

**Handling:**
1. Show message with `status: 'failed'`
2. Red border + "Failed to send" tooltip
3. Retry button → Re-attempts send
4. Delete button → Removes from UI
5. Store in `failedMessages` queue for later retry

**Auto-retry:**
- Wait 5s → Retry automatically
- Max 3 retries → Then require manual retry

### Offline Message Queuing
**Scenario:** User sends messages while offline

**Handling:**
1. Store in `localStorage` queue
2. Show all messages with "Sending..." state
3. Display offline banner
4. On reconnect → Flush queue in order
5. Update to sent/failed based on results

### Connection State Machine
```
┌─────────┐  disconnect  ┌──────────────┐
│CONNECTED├─────────────→│DISCONNECTED  │
└────┬────┘              └──────┬───────┘
     │                          │
     │ auto-retry               │ reconnect
     │                          │
     │                    ┌─────▼────────┐
     └────────────────────┤CONNECTING    │
                          └──────────────┘
```

**States:**
- **CONNECTED:** Normal operation
- **DISCONNECTED:** Show red banner, queue messages
- **CONNECTING:** Show yellow banner with spinner, retry countdown

**Retry Logic:**
- Attempt 1: Immediate
- Attempt 2: 2s delay
- Attempt 3: 5s delay
- Attempt 4+: 10s delay (exponential backoff)

### Scroll Position Preservation
**Scenario:** New messages arrive while user scrolled up (reading history)

**Handling:**
1. Detect if user is at bottom (`scrollHeight - scrollTop < threshold`)
2. If at bottom → Auto-scroll to new message + smooth animation
3. If scrolled up → Show "New messages" badge + scroll-to-bottom button
4. On load more (top) → Preserve scroll position after DOM insert

### Read Receipt Race Condition
**Scenario:** Multiple users read at same time

**Handling:**
1. Server merges read events by message ID
2. Broadcast deduplicated list
3. Client replaces entire `readBy` array (don't append)
4. Optimistic: Add self immediately, server confirms

### Message Editing After Reaction
**Scenario:** User edits message that has reactions

**Handling:**
- Preserve reactions on edit
- Show "(edited)" label
- Emit `message.edited` event with updated content
- Reactions remain attached to message ID

---

## 8. Performance Considerations

### Virtualization
- Use `react-window` or `@tanstack/react-virtual` for message list
- Render only visible messages (viewport + overscan)
- Target: Smooth scroll with 1000+ messages

### Optimistic Updates
- Immediately show sent message with `clientId`
- Replace with server response on confirmation
- Prevents perceived latency

### Debounce/Throttle
- Typing indicator: Throttle to max 1 event/second
- Scroll read receipts: Debounce 300ms
- Draft autosave: Debounce 2s

### WebSocket Message Batching
- Batch read receipts for multiple messages
- Send as single event: `{ type: 'read', messageIds: [...] }`
- Reduces socket traffic

### Image Lazy Loading
- Avatars: Preload visible ones, lazy-load others
- Message images: `loading="lazy"` + blur placeholder

---

## 9. Implementation Checklist

### Phase 1: Core Chat (MVP)
- [ ] ChatList with conversations
- [ ] ThreadView with messages
- [ ] MessageComposer (text only)
- [ ] Basic presence indicators
- [ ] WebSocket connection

### Phase 2: Rich Features
- [ ] Threaded replies
- [ ] Emoji reactions
- [ ] File attachments
- [ ] @Mentions autocomplete
- [ ] Read receipts

### Phase 3: Real-time & Offline
- [ ] Typing indicators
- [ ] Reconnect banner & retry logic
- [ ] Offline message queue
- [ ] Optimistic updates
- [ ] Duplicate message handling

### Phase 4: Polish
- [ ] Keyboard shortcuts
- [ ] Search within conversation
- [ ] Message editing/deletion
- [ ] Accessibility audit (WAVE, axe)
- [ ] Performance testing (1000+ messages)

---

## 10. Component Props Summary Table

| Component | Key Props | States | A11y |
|-----------|-----------|--------|------|
| `ChatList` | `conversations`, `onSelect` | loading, empty, error, offline | `role="list"`, live region |
| `ChatListItem` | `presence`, `unreadCount`, `typing` | hover, focus, selected | `aria-label` with unread count |
| `ThreadView` | `messages`, `connectionStatus` | loading, error, disconnected | `role="feed"`, live region |
| `MessageItem` | `reactions`, `readBy`, `status` | sending, sent, failed | `role="article"`, aria-label |
| `MessageComposer` | `onSend`, `uploadProgress` | empty, typing, uploading, offline | `role="textbox"`, character count |
| `PresenceBadge` | `status`, `showPulse` | online, away, offline | Color + aria-label |
| `TypingIndicator` | `users` | animated | `aria-live="polite"` |
| `ReconnectBanner` | `status`, `onRetry` | connecting, disconnected | `role="alert"` |

---

## 11. Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js extensions
module.exports = {
  theme: {
    extend: {
      spacing: {
        'message-gap': '0.5rem', // 8px
        'reply-indent': '2rem',  // 32px
      },
      maxWidth: {
        'message': '65ch',
      },
      zIndex: {
        'banner': '50',
        'popover': '40',
        'toast': '100',
      },
      keyframes: {
        'pulse-presence': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'pulse-presence': 'pulse-presence 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
}
```

---

## 12. Success Metrics

### Functional Completeness
- ✅ All 8 components implemented with specified props
- ✅ All 6 user flows executable end-to-end
- ✅ All edge cases handled (duplicates, failures, offline)

### Accessibility
- ✅ WCAG 2.1 AA compliance (contrast, keyboard, screen reader)
- ✅ Zero critical issues in axe DevTools audit
- ✅ Keyboard navigation covers 100% of features

### Performance
- ✅ First message render < 200ms
- ✅ Smooth scroll with 1000+ messages (60fps)
- ✅ Optimistic updates feel instant (<50ms)

### Developer Experience
- ✅ All components documented with TypeScript interfaces
- ✅ Storybook stories for all variants/states
- ✅ Zero implementation questions from devs (complete spec)

---

**End of UI Specification: Real-time Chat & Presence**
