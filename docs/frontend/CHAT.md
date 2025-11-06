# Chat Feature

## Overview
Real-time messaging with threads, reactions, read receipts, and typing indicators. Implements cursor pagination and optimistic updates for seamless UX.

## Implementation Status
- ✅ FE-7: Thread side-pane with virtualized stream
- ✅ FE-7: Reactions and read counters with aggregates
- ✅ FE-8: Attachment preview with mime heuristics
- ✅ FE-8: Typing/presence indicators with debouncing
- ✅ FE-5: Idempotency-Key on message send
- ✅ FE-6: Real-time event reconciliation

Real-time messaging with threads, reactions, and rich compose capabilities.

## Architecture

### Routes
- `/chat` - Chat list with empty state
- `/chat/[chatId]` - Active chat conversation

### Core Hooks

### Message Management (FE-4, FE-5)

**`useChatMessages(chatId, limit)`** - Infinite scroll with cursor pagination
```typescript
const { data, fetchNextPage, hasNextPage, isLoading } = useChatMessages(chatId, 50)
// Returns: CursorPaginatedResponse with nextCursor
```

**`useSendMessage(chatId)`** - Send with idempotency
```typescript
const { mutate } = useSendMessage(chatId)
mutate({
  content: 'Hello!',
  deliveryPriority: 'normal',
  threadId: 'optional-thread-id',
  attachments: ['file-id-1', 'file-id-2']
})
// Auto-adds Idempotency-Key header
```

### Thread Support (FE-7)

**`useThreadMessages(chatId, messageId, limit)`**
```typescript
const { data } = useThreadMessages(chatId, messageId, 50)
// Loads replies in thread side-pane
```

### Reactions (FE-7)

**`useAddReaction(chatId)`**
```typescript
const { mutate } = useAddReaction(chatId)
mutate({ messageId: 'msg-123', emoji: '👍' })
```

**`useRemoveReaction(chatId)`**
```typescript
const { mutate } = useRemoveReaction(chatId)
mutate({ messageId: 'msg-123', emoji: '👍' })
```

### Message Operations (FE-7)

**`useEditMessage(chatId)`** - Edit with history
**`useDeleteMessage(chatId)`** - Soft delete
**`useMarkAsRead(chatId)`** - Update read status

### Real-time Events (FE-6, FE-8)

**`useChatMessageEvents(chatId, enabled)`**
Listens to domain events:
- `chat:message_created`
- `chat:message_updated`
- `chat:message_deleted`
- `chat:reaction_added`
- `chat:reaction_removed`

Automatically reconciles with TanStack Query cache.

**`useTypingIndicator(chatId, userId, userName)`**
```typescript
const { startTyping, stopTyping } = useTypingIndicator(chatId, userId, userName)
// Debounced 3s auto-stop
```

**`useTypingListener(chatId, currentUserId)`**
```typescript
const typingUsers = useTypingListener(chatId, currentUserId)
// Returns: TypingState[] - who is typing
```

## Components

#### ChatList (`features/chat/components/chat-list.tsx`)
- Recent chats with unread counters
- Pin/mute indicators
- Last message preview
- Presence badges on avatars
- Search/filter chats

#### MessageStream (`features/chat/components/message-stream.tsx`)
- Virtualized message list (react-window)
- Grouped by date
- Sender avatars and names
- Message bubbles with reactions
- Read receipts
- Thread indicators

#### MessageBubble (`features/chat/components/message-bubble.tsx`)
- Rich content rendering
- Reaction picker
- Thread button
- Edit/delete actions
- Delivery priority badge
- Timestamp

#### ChatCompose (`features/chat/components/chat-compose.tsx`)
- Rich text editor (TipTap)
- Formatting toolbar:
  - Bold, Italic, Underline
  - Lists (ordered/unordered)
  - Headings, Code, Quote
- Delivery priority selector
- Attachment upload
- Schedule send
- Emoji picker
- @mention autocomplete
- "Send as Mail" toggle

#### ThreadPanel (`features/chat/components/thread-panel.tsx`)
- Side sheet for thread view
- Parent message context
- Thread replies
- Reply compose

## Real-time Events

### Client Emits
```typescript
socket.emit('join_chat', chatId)
socket.emit('send_message', { chatId, message })
socket.emit('typing_start', chatId)
socket.emit('typing_stop', chatId)
```

### Server Emits
```typescript
socket.on('new_message', (message) => {})
socket.on('message_updated', (message) => {})
socket.on('reaction_added', (data) => {})
socket.on('user_typing', ({ userId, chatId }) => {})
socket.on('read_receipt', ({ messageId, userId }) => {})
```

## State Management

### ChatStore (`lib/stores/chat-store.ts`)
```typescript
interface ChatState {
  chats: Map<string, Chat>
  messages: Map<string, Message[]>
  activeChat: string | null
  typingUsers: Map<string, Set<string>>
  
  setChats(chats: Chat[]): void
  addMessage(message: Message): void
  incrementUnread(chatId: string): void
  clearUnread(chatId: string): void
}
```

## Optimistic UI

1. User sends message
2. Add to local store with `tempId`
3. Emit to server
4. Server confirms with real `id`
5. Replace `tempId` with real `id`

If server rejects:
- Remove optimistic message
- Show error toast

## API Endpoints

### GET `/api/chats`
Returns list of user's chats

### POST `/api/chats`
Create new chat (direct or group)

### GET `/api/chats/[chatId]/messages`
Paginated messages (20 per page)

### POST `/api/chats/[chatId]/messages`
Send new message

### POST `/api/chats/[chatId]/reactions`
Add reaction to message

### GET `/api/chats/[chatId]/threads`
Get thread messages

## Features

### Reactions
- Click reaction button on message
- Emoji picker modal
- Show existing reactions with counts
- Click existing reaction to toggle

### Threads
- Click "Reply in thread" button
- Opens side panel
- Shows parent message + replies
- Reply compose at bottom

### Read Receipts
- Show checkmarks on sent messages
- Single check: delivered
- Double check: read by all

### Typing Indicators
- Show "User is typing..." below messages
- Debounced typing events (500ms)
- Auto-clear after 3s of inactivity

### Delivery Priority
- Normal: Default
- Important: Orange badge
- Urgent: Red badge + notification

### Schedule Send
- Date/time picker
- Message queued until scheduled time
- Can cancel before send

### Attachments
- Drag-drop or click to upload
- Progress indicator
- Preview thumbnails
- Download/view actions

## Usage Example

```tsx
import { useChatStore } from '@/lib/stores/chat-store'
import { useSocket } from '@/lib/socket/hooks/use-socket'

function ChatPage({ params }: { params: { chatId: string } }) {
  const { socket } = useSocket()
  const messages = useChatStore(state => state.messages.get(params.chatId))
  
  useEffect(() => {
    socket?.emit('join_chat', params.chatId)
    return () => socket?.emit('leave_chat', params.chatId)
  }, [params.chatId, socket])
  
  return (
    <div className="flex h-full">
      <MessageStream messages={messages} />
      <ChatCompose chatId={params.chatId} />
    </div>
  )
}
```

## Testing

### E2E Tests (`e2e/chat.spec.ts`)
- Send message
- Receive message on second client
- Add reaction
- Create thread
- Upload attachment
- Schedule message
