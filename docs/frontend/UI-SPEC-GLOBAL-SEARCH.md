# UI Specification: Global Search

## 1. Components

### SearchCommandPalette
**Purpose:** Universal search overlay (⌘K)

**Props:** `onSearch`, `onSelect`, `onClose`, `recentSearches`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ 🔍 Search everything...                        [×] │
├─────────────────────────────────────────────────────┤
│ Scope: [All ▼] [Messages] [Projects] [Files] [Users]│
├─────────────────────────────────────────────────────┤
│ MESSAGES (3)                                        │
│ › "Project timeline" in #general                   │
│   Alice Chen · 2 hours ago                         │
│                                                     │
│ PROJECTS (2)                                        │
│ › EPIC-123: Setup API infrastructure               │
│   In Progress · Due Jan 20                         │
│                                                     │
│ FILES (1)                                           │
│ › project-spec.pdf                                  │
│   2.4 MB · Modified yesterday                      │
│                                                     │
│ USERS (5)                                           │
│ › Alice Chen - Product Manager                     │
│   alice@company.com · Online                       │
├─────────────────────────────────────────────────────┤
│ ↑↓ Navigate  Enter Select  Esc Close              │
└─────────────────────────────────────────────────────┘
```

**Trigger:**
- Keyboard: `Cmd+K` (Mac) or `Ctrl+K` (Windows)
- Click search icon in header
- `/` from anywhere (unless in input)

**Auto-focus:** Input field on open

**Overlay:** Full screen dim backdrop, center positioned, `max-w-2xl`

**Debounced Search:** 300ms after typing stops

**Min Query Length:** 2 characters (show hint if <2)

**Keyboard:**
- `↓/↑` - Navigate results
- `Tab` - Cycle through scope filters
- `Enter` - Select result
- `Cmd+Enter` - Open in new tab
- `Escape` - Close palette

**States:**
- **Empty input:** Show recent searches
- **Typing:** Show loading skeleton
- **Results:** Group by type with counts
- **No results:** "No results for 'query'. Try different keywords."
- **Error:** "Search failed. Try again."

**A11y:**
- `role="dialog" aria-modal="true" aria-label="Search"`
- Input: `role="combobox" aria-autocomplete="list" aria-controls="results"`
- Results: `role="listbox"`, items `role="option" aria-selected`
- Live region: Announce result counts

---

### ScopeFilter
**Purpose:** Filter search by content type

**Props:** `scopes`, `selected`, `onChange`, `counts`

**Scopes:**
```typescript
type Scope = 'all' | 'messages' | 'projects' | 'files' | 'users' | 'calendar'
```

**Visual:**
```
[All (45)] [Messages (23)] [Projects (8)] [Files (9)] [Users (5)]
```

**Interaction:**
- Click to toggle
- Shows count badge
- "All" shows combined results
- Multi-select possible with checkboxes

**Keyboard:** `Tab` to navigate, `Space` to toggle

**A11y:** `role="tablist"`, chips `role="tab"`

---

### SearchResultItem
**Purpose:** Single result with context preview

**Props:** `result`, `query`, `onSelect`, `type`

**Layout by Type:**

**Message:**
```
› "Project timeline" in #general
  Alice Chen · 2 hours ago · 3 replies
  ...discussing the project timeline for Q1...
```

**Project:**
```
› EPIC-123: Setup API infrastructure
  In Progress · Alice Chen · Due Jan 20
  Tags: backend, infrastructure
```

**File:**
```
› project-spec.pdf
  📄 2.4 MB · Modified Jan 19 by Bob
  /Projects/Q1/Specs/
```

**User:**
```
› Alice Chen - Product Manager
  alice@company.com · Engineering · Online 🟢
```

**Calendar:**
```
› Team Standup
  📅 Tomorrow 9:00 AM · 30 min · Meeting Room A
  10 attendees
```

**Highlight Matches:**
- Bold matched keywords in title/content
- Use `<mark className="bg-yellow-200 dark:bg-yellow-800">` for highlights

**Context Window:**
- Show 100 chars before/after match
- Ellipsis at truncation points

**Keyboard:** `Enter` to select focused result

**A11y:** `aria-label` with full context (unhighlighted)

---

### RecentSearches
**Purpose:** Show recent queries when input empty

**Props:** `searches`, `onSelect`, `onClear`

**Layout:**
```
Recent Searches
› project timeline
› Alice Chen
› budget report
[Clear all]
```

**Storage:** localStorage, max 10 recent

**Click:** Populate input with query + auto-search

**Keyboard:** Navigate with arrows, `Enter` to select

---

### SearchFilters
**Purpose:** Advanced filters (date, user, tags)

**Props:** `filters`, `onChange`

**Layout (expandable section):**
```
▼ Filters
  Date Range:  [Last 7 days ▼]
  From:        [Alice Chen ▼]
  Has:         [ ] Attachments  [ ] Links
  Tags:        [design] [backend] [+ Add]
```

**Date Presets:**
- Today
- Yesterday
- Last 7 days
- Last 30 days
- Custom range (date picker)

**User Filter:** Autocomplete from directory

**Has Filters:**
- Attachments
- Links
- Reactions
- Mentions of me

**Tags:** Multi-select chips

**A11y:** Fieldset with legend, all inputs labeled

---

### SearchSkeleton
**Purpose:** Loading state while fetching

**Layout:**
```
MESSAGES
[████████████████░░░░░░░░░░░░░░░░░]
[████████░░░░░░░░░░░░░░░░░░░░░░░░]

PROJECTS
[████████████████████████░░░░░░░░]
```

**Animation:** Shimmer effect across placeholders

---

### SearchEmptyState
**Purpose:** No results guidance

**Props:** `query`, `suggestions`

**Layout:**
```
🔍 No results for "budgt report"

Try these tips:
• Check your spelling
• Use different keywords
• Remove filters
• Search in specific scopes

Did you mean: "budget report"? [Search]
```

**Suggestions:**
- Spell correction (Levenshtein distance)
- Similar queries from history
- Popular searches

---

## 2. User Flows

**Quick Search:**
1. User presses `Cmd+K` → Palette opens
2. Types "project" → Debounce 300ms → Query API
3. Results appear grouped by type
4. Use `↓` to navigate, `Enter` to open
5. Result opens in main view, palette closes

**Scoped Search:**
1. Open palette → Click "Messages" scope
2. Type query → Only message results shown
3. Select result → Navigate to message thread

**Recent Search:**
1. Open palette, input empty → Show recent searches
2. Click "Alice Chen" → Populates input + searches
3. Results appear

**Advanced Filter:**
1. Open palette → Expand "Filters"
2. Set date: "Last 7 days", from: "Bob"
3. Type query → Results filtered by criteria
4. Select result

**No Results:**
1. Type "budgt report" → 0 results
2. See suggestion "Did you mean budget report?"
3. Click suggestion → New search with corrected term

---

## 3. States & Copy

**Empty Input:**
- Show recent searches
- Hint: "Search messages, projects, files, and more..."

**Loading:**
- Skeleton with shimmer
- "Searching..." announced to screen reader

**No Results:**
- "No results for '{query}'"
- Tips: Check spelling, try different keywords
- Spell suggestions if available

**Error:**
- "Search failed. Check your connection and try again."
- [Retry] button

**Partial Results:**
- "Showing results for messages and projects. Files unavailable."

**Slow Search (>2s):**
- Show incremental results
- Toast: "Large search taking longer..."

---

## 4. Search Ranking

**Relevance Score Factors:**
1. **Exact match:** Higher rank for exact query match in title
2. **Partial match:** Lower rank for substring matches
3. **Recency:** Boost recent items (last 7 days)
4. **Popularity:** Boost frequently accessed items
5. **User relevance:** Boost items user interacted with
6. **Field weight:** Title > Content > Tags

**Example Algorithm:**
```typescript
function calculateScore(item: SearchableItem, query: string) {
  let score = 0
  
  // Exact match in title
  if (item.title.toLowerCase() === query.toLowerCase()) {
    score += 100
  }
  
  // Partial match in title
  if (item.title.toLowerCase().includes(query.toLowerCase())) {
    score += 50
  }
  
  // Match in content
  if (item.content.toLowerCase().includes(query.toLowerCase())) {
    score += 10
  }
  
  // Recency boost (last 7 days)
  const daysSinceModified = (Date.now() - item.modifiedAt) / (1000 * 60 * 60 * 24)
  if (daysSinceModified < 7) {
    score += (7 - daysSinceModified) * 5
  }
  
  // User interaction boost
  if (item.lastAccessedByUser) {
    score += 20
  }
  
  return score
}
```

**Sort:** By score descending, then by date descending

---

## 5. Highlight Algorithm

**Match Highlighting:**
```typescript
function highlightMatches(text: string, query: string): JSX.Element {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
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

**Context Snippet:**
- Extract 50 chars before match, 50 chars after
- Ellipsis if truncated: "...context before **match** context after..."

---

## 6. Layout Tokens

**Spacing:**
- Modal: `p-0`, sections `p-4`
- Result gap: `space-y-2`
- Group gap: `space-y-4`

**Sizes:**
- Modal: `max-w-2xl` (672px), `max-h-[80vh]`
- Input: `h-12` (48px)
- Result item: `min-h-16` (64px)

**Responsive:**
- Desktop: Centered modal
- Mobile: Full screen overlay

**Z-index:**
- Backdrop: `z-50`
- Modal: `z-50`

---

## 7. Performance

**Debounce:** 300ms after last keystroke

**Min Query:** 2 characters (reduce unnecessary requests)

**Cache:** Store recent queries + results for 5 min

**Incremental Rendering:**
- Show first 5 results per group immediately
- Load more on scroll

**Pagination:**
- Load 20 results per group
- "Load more" button if >20

**Cancel Previous:** Abort previous search request on new query (AbortController)

**Indexing (Backend):**
- Full-text search with Elasticsearch or PostgreSQL FTS
- Index: title, content, tags, metadata
- Update index on content change (debounced)

**Latency Targets:**
- P50: <200ms
- P95: <500ms
- P99: <1s

---

## 8. A11y Checklist

✅ `role="dialog" aria-modal="true"`  
✅ Input: `role="combobox" aria-autocomplete="list"`  
✅ Results: `role="listbox"`, items `role="option"`  
✅ Keyboard: Full nav without mouse  
✅ Focus trap: Keep focus in modal  
✅ Live region: Announce result counts  
✅ Screen reader: "3 messages, 2 projects, 1 file found"  
✅ Contrast: Highlights 4.5:1 minimum  
✅ Focus rings: Visible on all interactive elements

---

## 9. Edge Cases

**Empty query:** Show recent searches, don't query API

**Special chars:** Escape regex special chars (. * + ? [ ])

**Very long query (>200 chars):** Truncate, show warning

**Simultaneous searches:** Cancel previous request, only show latest

**Stale results:** If result opened, then deleted, show "Item no longer available"

**Permission filtered:** Don't show results user can't access

**Large result set (>1000):** Paginate, suggest narrowing with filters

**Slow backend:** Show skeleton after 300ms, timeout after 10s

**Offline:** Show cached recent searches, disable live search

---

## 10. Search Indexing Strategy

**Indexed Fields:**
```typescript
interface SearchIndex {
  id: string
  type: 'message' | 'project' | 'file' | 'user' | 'event'
  title: string
  content: string
  tags: string[]
  author: string
  createdAt: Date
  modifiedAt: Date
  metadata: Record<string, any>
  permissions: string[] // User IDs with access
}
```

**Update Triggers:**
- On create: Index immediately
- On update: Re-index with debounce (5s)
- On delete: Remove from index

**Partial Matching:**
- Prefix matching: "proj" matches "project"
- Fuzzy matching: Allow 1-2 char difference (Levenshtein)
- Stemming: "running" matches "run", "runs"

---

## 11. API Endpoints

```
GET /api/search?q={query}&scope={scope}&limit=20&offset=0
  Query params:
    q: Search query (required)
    scope: all|messages|projects|files|users
    dateFrom: ISO date
    dateTo: ISO date
    author: User ID
    tags: Comma-separated
    hasAttachments: boolean
    limit: 20 (default)
    offset: 0 (default)
    
  Response:
    {
      results: {
        messages: [...],
        projects: [...],
        files: [...],
        users: [...]
      },
      counts: {
        messages: 23,
        projects: 8,
        files: 9,
        users: 5
      },
      took: 145, // ms
      hasMore: true
    }

GET /api/search/suggestions?q={query}
  Response: {
    suggestions: ["budget report", "project budget"],
    corrections: ["budget report"] // if typo detected
  }
```

---

## 12. Success Criteria

✅ Search results appear <500ms (P95)  
✅ Keyboard nav covers 100% of features  
✅ Highlight shows match context clearly  
✅ Spell correction for common typos  
✅ Recent searches persist across sessions  
✅ WCAG AA compliant  
✅ Works offline (cached results)  
✅ Mobile-friendly full screen overlay  
✅ No dev questions on implementation
