# Global Search UI

## Overview

The Global Search UI provides a unified interface for searching across all entities in EPop: messages, projects, users, and files. It features tabbed navigation, result highlighting, cursor-based pagination, and debounced queries for optimal performance.

## Features

### Wave-1 (✅ COMPLETE)
- **Debounced Search**: 300ms delay to reduce API calls
- **Tabbed Results**: Separate tabs for All, Messages, Projects, Users, Files
- **Search Highlighting**: Query terms highlighted in results using `<mark>` tags
- **Cursor Pagination**: Efficient pagination for large result sets
- **Empty States**: User-friendly messages when no results found
- **Loading Indicators**: Spinner and loading states for better UX
- **URL Sync**: Search query synchronized with browser URL
- **Context Display**: Shows origin context (chat/task/mail) for files

### Wave-2 (Planned)
- **Preview Pane**: Quick preview without leaving search page
- **Keyboard Shortcuts**: Cmd+K/Ctrl+K to open global search
- **Advanced Filters**: Date ranges, file types, sender filters
- **Search History**: Recent searches with quick access
- **ACL-Aware Display**: Respect user permissions in results

## File Locations

```
app/(shell)/search/page.tsx       # Main search page
lib/api/hooks/use-search.ts       # Search API hooks
```

## Usage

### Basic Search

1. Navigate to `/search` or use the search icon in the navigation
2. Type your query in the search bar
3. Results appear after 300ms debounce delay
4. Switch between tabs to filter by entity type

### Search Highlighting

Query terms are automatically highlighted in results:

```tsx
// Highlight implementation
function highlightText(text: string, query: string) {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
```

### Pagination

Messages tab includes cursor-based pagination:
- Click "Next" to load more results
- Click "Previous" to go back (if available)
- Cursor is passed as query parameter

## Backend Contract

### Search Endpoint

```
GET /api/v1/search
Query Params:
  - q: string (required) - Search query
  - entity?: 'messages' | 'projects' | 'users' | 'files'
  - cursor?: string - Pagination cursor
  - limit?: number - Results per page (default: 20)
  - filters?: {
      sender?: string,
      hasAttachments?: boolean,
      dateFrom?: string,
      dateTo?: string
    }

Response:
{
  messages?: Array<{
    item: {
      id: string,
      content: string,
      chatId?: string,
      createdAt: string
    },
    highlights: Array<{
      field: string,
      matches: string[]
    }>
  }>,
  projects?: Array<{
    item: {
      id: string,
      name: string,
      description?: string,
      memberIds: string[]
    },
    highlights: Array<{ field: string, matches: string[] }>
  }>,
  users?: Array<{
    item: {
      id: string,
      name: string,
      email: string,
      role?: string
    },
    highlights: Array<{ field: string, matches: string[] }>
  }>,
  files?: Array<{
    item: {
      id: string,
      name: string,
      size: number,
      mimeType: string,
      createdAt: string,
      context: {
        type: 'chat' | 'task' | 'mail',
        id: string,
        name: string
      }
    },
    highlights: Array<{ field: string, matches: string[] }>
  }>,
  nextCursor?: string
}
```

## Component Architecture

### State Management

```typescript
// Search state
const [query, setQuery] = useState('')
const [debouncedQuery, setDebouncedQuery] = useState('')
const [activeTab, setActiveTab] = useState('all')
const [cursor, setCursor] = useState<string | null>(null)

// Debounce effect
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query)
  }, 300)
  return () => clearTimeout(timer)
}, [query])
```

### API Hooks

```typescript
// Separate hooks per entity type
const messages = useSearchMessages(debouncedQuery, filters)
const projects = useSearchProjects(debouncedQuery, filters)
const users = useSearchUsers(debouncedQuery, filters)
const files = useSearchFiles(debouncedQuery, filters)

// Combined loading state
const isSearching = messages.isLoading || projects.isLoading || 
                    users.isLoading || files.isLoading
```

## Performance Optimizations

### Debouncing
Reduces API calls by waiting 300ms after last keystroke before executing search.

### URL Synchronization
Updates browser URL without full page reload:

```typescript
useEffect(() => {
  if (debouncedQuery) {
    router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`, 
                { scroll: false })
  }
}, [debouncedQuery, router])
```

### Empty State Handling
Only shows "No results" after loading completes to avoid flashing empty states.

## Accessibility

- **Keyboard Navigation**: Full keyboard support for tabs and results
- **Focus Management**: Search input auto-focuses on page load
- **Screen Reader Support**: 
  - Loading states announced
  - Result counts announced
  - ARIA labels on interactive elements
- **Color Contrast**: Highlight colors meet WCAG AA standards

## Wave-2 Features

### Preview Pane

When implemented, clicking a result will show a preview panel:

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>/* Search results */</div>
  <div>/* Preview pane */</div>
</div>
```

### Keyboard Shortcuts

Global command palette (Cmd+K):

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      router.push('/search')
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [router])
```

### ACL-Aware Display

Results respect user permissions:
- Hide results from inaccessible chats/projects
- Show lock icons for restricted content
- Provide "Request Access" button where applicable

## Testing

### Unit Tests
```typescript
describe('Search highlighting', () => {
  it('highlights query terms', () => {
    const result = highlightText('Hello world', 'world')
    expect(result).toContain('<mark>')
  })
  
  it('handles case-insensitive matching', () => {
    const result = highlightText('Hello World', 'hello')
    expect(result).toContain('<mark>Hello</mark>')
  })
})
```

### E2E Tests
```typescript
test('Search workflow', async ({ page }) => {
  await page.goto('/search')
  await page.fill('input[type="search"]', 'test query')
  
  // Wait for debounce and results
  await page.waitForTimeout(350)
  await expect(page.locator('[data-testid="search-results"]'))
    .toContainText('test query')
    
  // Switch tabs
  await page.click('[data-testid="tab-messages"]')
  await expect(page.locator('.message-result')).toBeVisible()
})
```

## ZincSearch Integration

The search is powered by ZincSearch, an Elasticsearch alternative:

- **Indexing**: Real-time indexing via BullMQ workers
- **Full-text Search**: Advanced query syntax support
- **Fuzzy Matching**: Typo-tolerant search
- **Field Boosting**: Prioritize title matches over content

## Related Documentation

- [Backend Search Service](../backend/search-service.md)
- [ZincSearch Worker](../backend/workers.md#search-worker)
- [Performance Guidelines](./performance.md)
