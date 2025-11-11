# Implementation Prompt: Chat & Presence Components

**Target:** Claude Sonnet 4.5  
**Purpose:** Generate React components, Storybook stories, and accessibility tests  
**Reference:** [UI-SPEC-CHAT-PRESENCE.md](./UI-SPEC-CHAT-PRESENCE.md)

---

## Context

You are implementing components for a Next.js 14 application (EPOP) that uses:
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **State Management:** React hooks + React Query (already configured)
- **Testing:** Jest + @testing-library/react
- **Storybook:** v7+ with Tailwind support

**Reference Specification:** All component requirements, props, states, and behaviors are defined in `UI-SPEC-CHAT-PRESENCE.md`. Read this file first to understand the complete requirements.

**Existing Project Structure:**
```
c:\EPop\
├── app/                    # Next.js App Router
├── components/             # React components (target)
│   └── chat/              # Create this directory
├── lib/                    # Utilities
├── stories/               # Storybook stories (target)
│   └── chat/              # Create this directory
└── __tests__/             # Test files (target)
    └── chat/              # Create this directory
```

---

## Task: Implement Chat & Presence Module

### Components to Create

Create the following components in `components/chat/`:

#### 1. `ChatList.tsx`
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

interface Conversation {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  presence: 'online' | 'away' | 'offline'
  typing?: boolean
}
```

**Requirements:**
- Render scrollable list of conversations
- Show loading skeleton (3-5 items with shimmer)
- Show empty state with illustration + CTA
- Show error state with retry button
- Highlight selected conversation with `bg-accent`
- Unread badge with count
- Presence indicator (colored dot)
- Typing indicator animation ("typing...")
- Keyboard navigation (↑/↓ to navigate, Enter to select)
- A11y: `role="list"`, `aria-label` with unread count, focus rings

**Base on:** Section 1.1 in UI-SPEC-CHAT-PRESENCE.md

---

#### 2. `ChatListItem.tsx`
**Props:**
```typescript
interface ChatListItemProps {
  conversation: Conversation
  selected?: boolean
  onClick: () => void
}
```

**Requirements:**
- Avatar with presence indicator (colored dot bottom-right)
- Name + timestamp row
- Last message preview + unread badge
- Typing indicator replaces last message when active
- Hover: `bg-accent/50`
- Selected: `bg-accent`
- Focus ring for keyboard nav

**Base on:** Section 1.2 in UI-SPEC-CHAT-PRESENCE.md

---

#### 3. `ThreadView.tsx`
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

interface Message {
  id: string
  content: string
  author: User
  timestamp: Date
  reactions: Reaction[]
  replyCount: number
  readBy: User[]
  status?: 'sending' | 'sent' | 'failed'
}
```

**Requirements:**
- Scrollable message feed with virtualization (use @tanstack/react-virtual)
- ReconnectBanner at top if disconnected
- Message bubbles (left for others, right for self)
- Optimistic messages with spinner
- Failed messages with red border + retry
- Infinite scroll (load more at top)
- Keyboard: R to reply, E to react, ↑/↓ to navigate
- A11y: `role="feed"`, messages `role="article"`

**Base on:** Section 1.3 in UI-SPEC-CHAT-PRESENCE.md

---

#### 4. `MessageItem.tsx`
**Props:**
```typescript
interface MessageItemProps {
  message: Message
  isMine: boolean
  onReply: () => void
  onReact: (emoji: string) => void
  onEdit?: () => void
  onDelete?: () => void
}
```

**Requirements:**
- Avatar + name + timestamp
- Message content
- Reactions as pill badges (click to toggle)
- Read receipts (avatar stack, max 3 visible)
- Actions menu (... button)
- Status indicators (sending spinner, failed error)
- Hover: Show action buttons
- A11y: `aria-label` with full context

**Base on:** Section 1.4 in UI-SPEC-CHAT-PRESENCE.md

---

#### 5. `MessageComposer.tsx`
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

**Requirements:**
- Textarea with auto-resize
- Emoji picker popover (use shadcn Popover)
- File attach button + drag-drop
- @Mention autocomplete dropdown
- Character count when near limit
- Send button (enabled when content exists)
- Keyboard: Cmd+Enter to send, Escape to clear
- A11y: `role="textbox" aria-multiline="true"`

**Base on:** Section 1.5 in UI-SPEC-CHAT-PRESENCE.md

---

#### 6. `PresenceBadge.tsx`
**Props:**
```typescript
interface PresenceBadgeProps {
  status: 'online' | 'away' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}
```

**Requirements:**
- Colored dot (green/yellow/gray)
- Sizes: 8px/12px/16px
- Pulse animation for online status (optional)
- Absolute positioning helper classes

**Base on:** Section 1.6 in UI-SPEC-CHAT-PRESENCE.md

---

#### 7. `TypingIndicator.tsx`
**Props:**
```typescript
interface TypingIndicatorProps {
  users: string[] // Names of users typing
}
```

**Requirements:**
- Display "Alice is typing..." or "Alice and Bob are typing..."
- Three bouncing dots animation
- A11y: `aria-live="polite"`

**Base on:** Section 1.7 in UI-SPEC-CHAT-PRESENCE.md

---

#### 8. `ReconnectBanner.tsx`
**Props:**
```typescript
interface ReconnectBannerProps {
  status: 'connecting' | 'disconnected'
  onRetry?: () => void
  autoRetryIn?: number // seconds
}
```

**Requirements:**
- Yellow banner for connecting (with spinner)
- Red banner for disconnected (with retry button)
- Auto-retry countdown display
- Full width, sticky at top
- A11y: `role="alert" aria-live="assertive"`

**Base on:** Section 1.8 in UI-SPEC-CHAT-PRESENCE.md

---

## Storybook Stories

Create comprehensive stories in `stories/chat/`:

### `ChatList.stories.tsx`
```typescript
export default {
  title: 'Chat/ChatList',
  component: ChatList,
  parameters: {
    layout: 'padded',
  },
}

// Required stories:
- Default (3-5 conversations)
- Selected (one conversation selected)
- WithUnread (multiple unread counts)
- WithTyping (typing indicator active)
- Loading (skeleton state)
- Empty (no conversations)
- Error (error state with retry)
- Offline (offline banner visible)
```

### `ThreadView.stories.tsx`
```typescript
// Required stories:
- Default (5-10 messages)
- WithReplies (nested replies)
- WithReactions (messages with emoji reactions)
- Sending (optimistic message with spinner)
- Failed (message failed to send)
- Disconnected (with reconnect banner)
- Loading (skeleton messages)
- Empty (new conversation)
```

### `MessageComposer.stories.tsx`
```typescript
// Required stories:
- Default (empty)
- WithText (text entered)
- WithMentions (mention dropdown visible)
- WithFiles (file attachments)
- Uploading (upload progress)
- Disabled (offline state)
- NearLimit (character count visible)
```

### Additional Stories
- `MessageItem.stories.tsx` — Own message, other's message, with reactions, with receipts, failed
- `PresenceBadge.stories.tsx` — All statuses and sizes
- `TypingIndicator.stories.tsx` — Single user, multiple users
- `ReconnectBanner.stories.tsx` — Connecting, disconnected, with countdown

---

## Accessibility Tests

Create tests in `__tests__/chat/`:

### `ChatList.test.tsx`
```typescript
describe('ChatList Accessibility', () => {
  it('has proper ARIA roles', () => {
    // role="list" on container
    // role="listitem" on each conversation
  })

  it('announces unread count to screen readers', () => {
    // aria-label="Chat with Alice, 3 unread messages"
  })

  it('supports keyboard navigation', () => {
    // Arrow down/up to navigate
    // Enter to select
  })

  it('has visible focus indicators', () => {
    // ring-2 ring-primary on focus
  })

  it('announces loading state', () => {
    // aria-live region for loading
  })
})
```

### `ThreadView.test.tsx`
```typescript
describe('ThreadView Accessibility', () => {
  it('has role="feed" for message container', () => {})
  
  it('announces new messages', () => {
    // aria-live="polite" for new messages
  })

  it('supports keyboard message navigation', () => {
    // Arrow keys to navigate
    // R to reply, E to react
  })

  it('handles focus management on modal open', () => {
    // Focus composer on mount
  })
})
```

### `MessageComposer.test.tsx`
```typescript
describe('MessageComposer Accessibility', () => {
  it('has proper textbox role', () => {
    // role="textbox" aria-multiline="true"
  })

  it('links label to input', () => {
    // aria-label="Message input"
  })

  it('announces character limit', () => {
    // aria-live when near limit
  })

  it('supports keyboard shortcuts', () => {
    // Cmd+Enter to send
    // Escape to clear
  })
})
```

### Additional Tests
- `ReconnectBanner.test.tsx` — Alert role, assertive live region
- `PresenceBadge.test.tsx` — Visual + aria-label for status

---

## Visual Snapshot Tests

Add Storybook test runner configuration:

### `.storybook/test-runner.ts`
```typescript
import { toMatchImageSnapshot } from 'jest-image-snapshot'

expect.extend({ toMatchImageSnapshot })

export default {
  async postRender(page, context) {
    // Visual regression test
    const image = await page.screenshot()
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: '__snapshots__',
      customSnapshotIdentifier: context.id,
    })
  },
}
```

---

## Implementation Guidelines

### Styling
- Use Tailwind utility classes
- Use shadcn/ui components as base: Button, Avatar, ScrollArea, Popover, Dialog
- Support dark/light mode via `dark:` prefix
- Focus rings: `ring-2 ring-primary ring-offset-2`
- Transitions: `transition-colors duration-150`

### State Management
- Use React hooks (useState, useEffect)
- Don't connect to real API — use mock data from props
- Optimistic updates: Show immediately, confirm with callback

### Performance
- Memoize expensive components with React.memo
- Use @tanstack/react-virtual for message list
- Debounce typing indicator emit (1s)

### Accessibility
- All interactive elements must be keyboard accessible
- Use semantic HTML (nav, main, article)
- Provide aria-labels for icon-only buttons
- Announce dynamic content with aria-live regions
- Test with axe-core (install @axe-core/react)

---

## Commands to Run

### Development
```bash
# Start Storybook
pnpm storybook

# Run tests
pnpm test chat

# Run accessibility audit
pnpm test:a11y chat

# Visual regression tests
pnpm test-storybook
```

### Verification Checklist

**Components:**
- [ ] All 8 components created in `components/chat/`
- [ ] TypeScript interfaces match spec
- [ ] All states implemented (loading, empty, error, offline)
- [ ] Dark/light mode supported
- [ ] Keyboard navigation works

**Storybook:**
- [ ] Stories for all components
- [ ] All state variants have stories
- [ ] Stories render correctly in dark/light mode
- [ ] Interactive controls work (Args)

**Accessibility:**
- [ ] All tests pass (100% pass rate)
- [ ] Axe-core reports zero violations
- [ ] Keyboard-only navigation works
- [ ] Screen reader announcements correct (test with NVDA/VoiceOver)

**Visual:**
- [ ] Snapshot tests pass
- [ ] Components match design in UI-SPEC
- [ ] Responsive on mobile/tablet/desktop

---

## Output Format

Provide implementation as:

1. **Component files** — Full code for each component
2. **Story files** — Complete .stories.tsx files
3. **Test files** — Full test suites
4. **Summary** — Brief checklist of what was implemented

**File Structure:**
```
components/chat/
  ├── ChatList.tsx
  ├── ChatListItem.tsx
  ├── ThreadView.tsx
  ├── MessageItem.tsx
  ├── MessageComposer.tsx
  ├── PresenceBadge.tsx
  ├── TypingIndicator.tsx
  ├── ReconnectBanner.tsx
  └── index.ts

stories/chat/
  ├── ChatList.stories.tsx
  ├── ThreadView.stories.tsx
  ├── MessageComposer.stories.tsx
  ├── MessageItem.stories.tsx
  ├── PresenceBadge.stories.tsx
  ├── TypingIndicator.stories.tsx
  └── ReconnectBanner.stories.tsx

__tests__/chat/
  ├── ChatList.test.tsx
  ├── ThreadView.test.tsx
  ├── MessageComposer.test.tsx
  └── ReconnectBanner.test.tsx
```

---

## Success Criteria

✅ All components render correctly in Storybook  
✅ All state variants (loading, empty, error) have stories  
✅ Accessibility tests pass with 100% coverage  
✅ Keyboard navigation works for all interactions  
✅ Visual appearance matches UI-SPEC-CHAT-PRESENCE.md  
✅ Dark/light mode switching works  
✅ No TypeScript errors  
✅ No console warnings in Storybook

---

**Ready to implement?** Start with the core components (ChatList, ThreadView, MessageComposer), then add supporting components (PresenceBadge, TypingIndicator, ReconnectBanner). Create stories alongside each component to verify behavior immediately.
