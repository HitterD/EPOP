# EPop Utilities Guide

**Complete reference for cross-module utilities (A0-A7)**

---

## 📚 Table of Contents

1. [Foundation (A0)](#foundation-a0)
2. [Chat Utilities (A1)](#chat-utilities-a1)
3. [Mail Utilities (A2)](#mail-utilities-a2)
4. [Projects Utilities (A3)](#projects-utilities-a3)
5. [Search Utilities (A4)](#search-utilities-a4)
6. [Testing Utilities](#testing-utilities)

---

## Foundation (A0)

### State Management (`styles/states.ts`)

**5-State Taxonomy:** `idle | loading | optimistic | success | error`

#### useAsyncState Hook
```typescript
import { useAsyncState } from '@/styles/states';

function DataLoader() {
  const {
    state,        // Current state
    data,         // Data payload
    error,        // Error object
    setIdle,      // Set to idle
    setLoading,   // Set to loading
    setOptimistic,// Set to optimistic (instant feedback)
    setSuccess,   // Set to success
    setError,     // Set to error
    isLoading,    // Boolean helpers
    isSuccess,
    isError,
  } = useAsyncState<MyData>();

  async function load() {
    setLoading();
    try {
      const result = await api.fetch();
      setSuccess(result);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      {isLoading && <Spinner />}
      {isError && <Error error={error} />}
      {isSuccess && <Data items={data} />}
    </>
  );
}
```

#### RetryManager
```typescript
import { RetryManager } from '@/styles/states';

const retry = new RetryManager({
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  multiplier: 2,
  jitter: 0.1,
});

async function fetchWithRetry() {
  try {
    return await api.fetch();
  } catch (error) {
    if (retry.canRetry()) {
      const delay = retry.getDelay();
      retry.recordAttempt();
      await sleep(delay);
      return fetchWithRetry();
    }
    throw error;
  }
}
```

---

### i18n/RTL (`styles/i18n.ts`)

#### useLocale Hook
```typescript
import { useLocale } from '@/styles/i18n';

function Component() {
  const {
    locale,           // 'en-US', 'ar-SA', etc.
    direction,        // 'ltr' or 'rtl'
    isRTL,           // boolean
    formatNumber,    // Locale-aware number formatting
    formatDate,      // Locale-aware date formatting
  } = useLocale();

  return (
    <div dir={direction}>
      <p>{formatDate(new Date(), { dateStyle: 'long' })}</p>
      <p>{formatNumber(1234.56, { style: 'currency', currency: 'USD' })}</p>
    </div>
  );
}
```

#### RTL-Aware Styling
```typescript
import { rtlStyles } from '@/styles/i18n';

function Card({ direction }: { direction: 'ltr' | 'rtl' }) {
  return (
    <div className={`
      ${rtlStyles.marginStart(4, direction)}
      ${rtlStyles.paddingEnd(2, direction)}
      ${rtlStyles.borderStart(direction)}
      ${rtlStyles.textAlign('left', direction)}
    `}>
      Content
    </div>
  );
}
```

#### CJK/Thai Tokenization
```typescript
import { tokenization } from '@/styles/i18n';

// Chinese (character-based)
const tokens = tokenization.tokenize('你好世界', 'zh-CN');
// ['你', '好', '世', '界']

// English (word-based)
const tokens2 = tokenization.tokenize('Hello world', 'en-US');
// ['hello', 'world']

// Search matching
const matches = tokenization.matches('Alice Chen', 'chen', 'en-US');
// true
```

---

### Accessibility (`styles/a11y.ts`)

#### ARIA Helpers
```typescript
import { ariaHelpers } from '@/styles/a11y';

// Button labels
ariaHelpers.buttonLabel('Delete', 'selected')
// "Delete, selected"

// List labels
ariaHelpers.listLabel(5, 'Users')
// "Users, 5 items"

// Progress labels
ariaHelpers.progressLabel(75, 100, 'Upload')
// "Upload, 75% complete"

// Search results
ariaHelpers.searchResultsLabel(12, 'react')
// "12 results for 'react'"
```

#### Keyboard Utilities
```typescript
import { keyboardUtils } from '@/styles/a11y';

function handleKeyDown(event: React.KeyboardEvent) {
  if (keyboardUtils.isActivationKey(event)) {
    // Enter or Space pressed
    handleActivate();
  }
  
  if (keyboardUtils.isEscapeKey(event)) {
    handleClose();
  }
  
  const direction = keyboardUtils.getArrowDirection(event);
  if (direction) {
    navigateInDirection(direction); // 'up' | 'down' | 'left' | 'right'
  }
}
```

#### Focus Management
```typescript
import { useFocusTrap } from '@/styles/a11y';

function Modal({ open }: { open: boolean }) {
  const containerRef = useFocusTrap(open);
  
  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {/* Focus trapped inside */}
    </div>
  );
}
```

#### Screen Reader Announcements
```typescript
import { useA11yAnnounce } from '@/styles/a11y';

function SearchResults({ results, query }) {
  const { announce } = useA11yAnnounce();
  
  useEffect(() => {
    announce(`${results.length} results for ${query}`);
  }, [results, query]);
}
```

#### Roving Tabindex
```typescript
import { useRovingTabIndex } from '@/styles/a11y';

function Menu({ items }: { items: Item[] }) {
  const { getTabIndex, handleKeyDown } = useRovingTabIndex(items.length);
  
  return (
    <div role="menu">
      {items.map((item, index) => (
        <div
          key={item.id}
          role="menuitem"
          tabIndex={getTabIndex(index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

---

## Chat Utilities (A1)

### Content Sanitization (`lib/chat/sanitize.ts`)

```typescript
import { sanitizeMessage } from '@/lib/chat/sanitize';

const sanitized = sanitizeMessage(userInput, {
  allowMarkdown: true,   // **bold**, *italic*, `code`
  allowLinks: true,      // Convert URLs to <a> tags
  allowEmoji: true,      // Preserve emoji
  maxLength: 10000,      // Truncate if too long
});

// Use in MessageItem
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

**Other Functions:**
```typescript
// Extract plain text from HTML
const text = extractPlainText('<p>Hello <strong>World</strong></p>');
// "Hello World"

// Check for XSS attempts
if (hasXssAttempt(content)) {
  console.warn('Potential XSS detected');
}

// Sanitize file names
const safeName = sanitizeFileName('file<>:name.txt');
// "file___name.txt"

// Get content length (excluding HTML)
const length = getContentLength('<p>Test</p>'); // 4
```

---

### Offline Queue (`lib/chat/offline-queue.ts`)

```typescript
import { useOfflineQueue } from '@/lib/chat/offline-queue';

function ChatComposer() {
  const {
    queue,          // All queued messages
    add,            // Add to queue
    remove,         // Remove from queue
    clearAll,       // Clear all
    clearFailed,    // Clear failed only
    size,           // Total count
    pendingCount,   // Pending count
    failedCount,    // Failed count
  } = useOfflineQueue();

  async function sendMessage(content: string) {
    // Add to offline queue
    add({
      id: generateId(),
      conversationId: currentConversation.id,
      content,
    });

    // Try to send
    try {
      await api.sendMessage(content);
      remove(messageId);
    } catch (error) {
      // Will retry automatically
    }
  }

  return (
    <>
      {pendingCount > 0 && (
        <Alert>
          {pendingCount} messages pending
          <Button onClick={clearAll}>Clear All</Button>
        </Alert>
      )}
    </>
  );
}
```

---

### Scroll Utilities (`lib/chat/scroll.ts`)

#### Scroll Preservation (for prepending)
```typescript
import { useScrollPreservation } from '@/lib/chat/scroll';

function MessageList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { savePosition, restorePosition } = useScrollPreservation(containerRef);

  async function loadOlderMessages() {
    savePosition();
    const older = await api.getOlderMessages();
    setMessages(prev => [...older, ...prev]);
    
    // After render
    requestAnimationFrame(() => {
      restorePosition();
    });
  }

  return <div ref={containerRef}>{/* messages */}</div>;
}
```

#### Auto-Scroll to Bottom
```typescript
import { useAutoScrollBottom } from '@/lib/chat/scroll';

function MessageList({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom } = useAutoScrollBottom(containerRef, messages);

  return (
    <>
      <div ref={containerRef}>{/* messages */}</div>
      <Button onClick={scrollToBottom}>Scroll to Bottom</Button>
    </>
  );
}
```

---

## Mail Utilities (A2)

### Draft Lock (`lib/mail/draft-lock.ts`)

```typescript
import { useDraftLock } from '@/lib/mail/draft-lock';

function MailComposer({ draftId }: { draftId: string }) {
  const { isLocked, lockInfo, forceTake } = useDraftLock(draftId);

  if (isLocked && lockInfo) {
    return (
      <Alert>
        This draft is being edited in another tab
        <p>Last activity: {new Date(lockInfo.lastActivity).toLocaleString()}</p>
        <Button onClick={forceTake}>Force Edit</Button>
      </Alert>
    );
  }

  return <Editor />;
}
```

---

## Projects Utilities (A3)

### Timezone Handling (`lib/projects/timezone.ts`)

```typescript
import { utcDateSpanToPx, snapToGrid } from '@/lib/projects/timezone';

function GanttTask({ task, viewportStart }: Props) {
  const position = utcDateSpanToPx(
    task.startDate,
    task.endDate,
    'week',                    // scale
    'America/New_York',        // timezone
    viewportStart,
    40                         // pixels per day
  );

  return (
    <div style={{
      position: 'absolute',
      left: position.left,
      width: position.width,
    }}>
      {task.name}
    </div>
  );
}

// Snap to grid
const snapped = snapToGrid(new Date(), 'week');
// Returns start of week (Sunday, 00:00:00)
```

---

## Search Utilities (A4)

### Prefetch (`lib/search/prefetch.ts`)

```typescript
import { usePrefetchOnHover } from '@/lib/search/prefetch';

function SearchResultItem({ result }: { result: SearchResult }) {
  const {
    handleMouseEnter,
    handleMouseLeave,
    isPrefetching,
    isCached,
    cachedData,
  } = usePrefetchOnHover(
    result.id,
    (signal) => api.getDetail(result.id, { signal })
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={isCached ? 'bg-green-50' : ''}
    >
      {result.title}
      {isPrefetching && <Spinner />}
    </div>
  );
}
```

---

## Testing Utilities

### A11y Test Harness (`lib/testing/a11y-harness.ts`)

```typescript
import {
  runA11yTests,
  testKeyboardNavigation,
  testAriaAttributes,
  createA11yTestSuite,
} from '@/lib/testing/a11y-harness';

describe('Button Accessibility', () => {
  test('should have no violations', async () => {
    await runA11yTests(<Button>Click me</Button>);
  });

  test('should have correct ARIA', () => {
    testAriaAttributes(<Button aria-label="Close">X</Button>, {
      expectedAttributes: {
        'aria-label': 'Close',
        'role': 'button',
      },
    });
  });

  test('should support keyboard', () => {
    testKeyboardNavigation(<Menu items={items} />, {
      testTabKey: true,
      expectedFocusableCount: 5,
    });
  });
});

// Or use test suite creator
createA11yTestSuite('Button', Button, {
  defaultProps: { children: 'Click me' },
  scenarios: [
    { name: 'primary', props: { variant: 'primary' } },
    { name: 'disabled', props: { disabled: true } },
  ],
  testKeyboard: true,
});
```

---

## Best Practices

### 1. State Management
✅ **DO:** Use the 5-state taxonomy consistently  
✅ **DO:** Use RetryManager for failed operations  
❌ **DON'T:** Create custom state enums  

### 2. i18n/RTL
✅ **DO:** Use rtlStyles for direction-aware CSS  
✅ **DO:** Use tokenization for search in CJK/Thai  
❌ **DON'T:** Hardcode LTR assumptions  

### 3. Accessibility
✅ **DO:** Use ariaHelpers for labels  
✅ **DO:** Test with a11y-harness  
✅ **DO:** Support keyboard navigation  
❌ **DON'T:** Skip ARIA attributes  

### 4. Content Sanitization
✅ **DO:** Sanitize all user input  
✅ **DO:** Use DOMPurify for HTML  
❌ **DON'T:** Trust client-side validation alone  

### 5. Offline Handling
✅ **DO:** Use offline queue for resilience  
✅ **DO:** Implement retry with backoff  
❌ **DON'T:** Block UI while offline  

---

## Performance Tips

1. **Memoization:** Use React.useMemo/useCallback
2. **Debouncing:** Use timeouts from tokens.ts
3. **Throttling:** Limit event handlers to 100ms
4. **Virtualization:** Use @tanstack/react-virtual for long lists
5. **Code Splitting:** Lazy load heavy components
6. **Prefetching:** Prefetch on hover for better UX

---

## Common Patterns

### Async Operation with Retry
```typescript
const state = useAsyncState<Data>();
const retry = new RetryManager();

async function load() {
  state.setLoading();
  try {
    const data = await api.fetch();
    state.setSuccess(data);
    retry.reset();
  } catch (error) {
    state.setError(error);
    if (retry.canRetry()) {
      setTimeout(load, retry.getDelay());
      retry.recordAttempt();
    }
  }
}
```

### RTL-Aware Component
```typescript
const { direction } = useLocale();

<div className={`
  ${rtlStyles.marginStart(4, direction)}
  ${rtlStyles.textAlign('left', direction)}
`}>
```

### Accessible Modal
```typescript
const containerRef = useFocusTrap(open);
const { announce } = useA11yAnnounce();

useEffect(() => {
  if (open) announce('Modal opened', true);
}, [open]);

<div ref={containerRef} role="dialog" aria-modal="true">
```

---

## Troubleshooting

### State not updating?
- Check if you're calling the correct setState function
- Verify state transitions are valid
- Use React DevTools to inspect state

### RTL layout broken?
- Ensure document.dir is set correctly
- Use rtlStyles helpers, not hardcoded classes
- Test with actual RTL language (ar-SA, he-IL)

### A11y violations?
- Run axe in browser DevTools
- Use a11y-harness in tests
- Check ARIA labels exist

### Sanitization not working?
- Verify DOMPurify is installed
- Check allowMarkdown/allowLinks options
- Test with actual XSS payloads

---

## Reference Links

- [Storybook INDEX](../../stories/INDEX.stories.mdx)
- [State Stories Template](../../stories/templates/StateStories.tsx)
- [A11y Test Harness](../../lib/testing/a11y-harness.ts)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
