# Global Search Feature

## Overview
Unified search across messages, projects, users, and files with ACL-aware filtering.

## Implementation Status
- ✅ FE-15: Tabbed results (Messages/Projects/Users/Files)
- ✅ FE-15: Highlight matched text
- ✅ FE-15: Advanced filters (date, sender, type)
- ✅ FE-15: ACL enforcement (backend filters by permissions)

## Access
- Header search box
- Keyboard shortcut: `Ctrl+K`
- Command palette style

## Search Results

### Tabs
- **Messages** - Chat and mail messages
- **Projects** - Projects and tasks
- **Users** - Directory search
- **Files** - File search

### Filters
- Date range
- Sender/author
- Project
- File type

## Search Implementation (FE-15)

### Unified Search Hook
```typescript
const { data } = useSearch({
  query: 'project updates',
  tab: 'all', // or 'messages', 'projects', 'users', 'files'
  filters: {
    dateRange: { from: '2024-01-01', to: '2024-12-31' },
    senderId: 'user-123',
    projectId: 'proj-456',
    fileType: 'pdf',
    hasAttachments: true
  },
  limit: 20
})

// Returns: SearchResult with highlighted matches
```

### Tab-Specific Hooks
```typescript
// Search only messages
const { data } = useSearchMessages(query, filters)

// Search only projects
const { data } = useSearchProjects(query, filters)

// Search only users
const { data } = useSearchUsers(query, filters)

// Search only files
const { data } = useSearchFiles(query, filters)
```

### Result Structure
```typescript
interface SearchResultItem<T> {
  item: T
  highlights?: SearchHighlight[]
  score: number
}

interface SearchHighlight {
  field: string // 'content', 'title', 'name'
  matches: string[] // highlighted snippets
}
```

### Highlighting Display
```typescript
// Render matched text with highlighting
{result.highlights?.map(h => (
  <mark className="bg-yellow-200">{h.matches[0]}</mark>
))}
```

### ACL Enforcement

**Backend automatically filters results based on user permissions:**
- User sees only messages from chats they have access to
- Projects filtered by membership
- Files filtered by context permissions
- Directory respects `directory:read` permission

**Frontend doesn't need to filter** - backend handles all ACL.

### ZincSearch Integration

When backend uses ZincSearch:
- Full-text indexing with relevance scoring
- Fuzzy matching for typos
- Field boosting (title > content)
- Faceted search results
- Sub-millisecond response times

### Reindex (Admin Only)
```typescript
const { refetch } = useReindexEntity()
// Triggers: POST /search/reindex
// Rebuilds ZincSearch indexes
```

## API Endpoints
- `GET /api/search?q=<query>&tab=<tab>&...filters` - Search with ACL
- `POST /api/search/reindex` - Reindex all entities (admin)
