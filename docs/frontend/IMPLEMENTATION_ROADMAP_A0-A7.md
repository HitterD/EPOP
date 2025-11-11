# Implementation Roadmap: A0-A7 Cross-Module Improvements

**Document:** UI-SPECIFICATIONS-INDEX.md  
**Date:** November 11, 2025  
**Status:** A0 Complete (Foundation), A1-A7 Planned

---

## 📋 Overview

This document tracks the implementation of comprehensive improvements across all 7 modules as specified in **UI-SPECIFICATIONS-INDEX.md**.

---

## ✅ A0: Cross-Module Foundation - COMPLETE

### Deliverables ✅

| File | Purpose | Status |
|------|---------|--------|
| `styles/tokens.ts` | Design tokens (spacing, z-index, durations, performance targets, retry config) | ✅ Complete |
| `styles/states.ts` | 5-state taxonomy (idle\|loading\|optimistic\|success\|error) + RetryManager | ✅ Complete |
| `styles/i18n.ts` | i18n/RTL utilities + CJK/Thai tokenization | ✅ Complete |
| `styles/a11y.ts` | ARIA helpers + keyboard nav + focus management | ✅ Complete |

### Remaining Tasks for A0

- [ ] Create `stories/INDEX.stories.mdx` (Storybook home with traceability matrix)
- [ ] Create state stories template (5-state examples)
- [ ] Create a11y test harness (axe-core integration)

---

## 📌 A1: Chat & Presence Improvements

### Spec: `UI-SPEC-CHAT-PRESENCE.md`

### Tasks

#### 1. Sticky Day Headers + Preserve Scroll ⏳
**Files to Create/Modify:**
- `lib/chat/scroll.ts` - Scroll utilities
- `components/chat/ThreadView.tsx` - Add sticky headers
- `components/chat/DayHeader.tsx` - NEW component

**Requirements:**
- Sticky date headers (e.g., "Today", "Yesterday", "Nov 10")
- Preserve scroll position when prepending messages
- Virtual scrolling with @tanstack/react-virtual

**Test Cases:**
- [ ] Scroll to bottom, load older messages, position preserved
- [ ] Day header sticks to top when scrolling
- [ ] Smooth scroll to new messages

---

#### 2. Offline Outbox UI ⏳
**Files to Create/Modify:**
- `features/chat/OfflineOutbox.tsx` - NEW component
- `lib/chat/offline-queue.ts` - Queue management
- `components/chat/ChatComposer.tsx` - Show outbox status

**Requirements:**
- Show counter of pending messages
- Purge policy: max 100 messages, oldest first
- Retry with exponential backoff (use `RetryManager` from styles/states.ts)
- Clear all button

**UI:**
```
┌─────────────────────────────────┐
│ 📤 3 messages pending          │
│ Sending when back online...    │
│ [Retry All] [Clear All]        │
└─────────────────────────────────┘
```

**Test Cases:**
- [ ] Outbox shows count
- [ ] Max 100 messages enforced
- [ ] Clear all works
- [ ] Auto-send when online

---

#### 3. Batch UI for Typing/Receipts ⏳
**Files to Create/Modify:**
- `lib/chat/batch-events.ts` - Batch event handler
- `components/chat/TypingIndicator.tsx` - Update to batch
- `components/chat/ReadReceipts.tsx` - Update to batch

**Requirements:**
- Throttle typing indicator updates to 1/sec max
- Batch read receipt updates
- Use `timeouts.throttle` from styles/tokens.ts

**Test Cases:**
- [ ] Typing updates max 1/sec even with rapid events
- [ ] Read receipts batch correctly

---

#### 4. Content Sanitization ⏳
**Files to Create/Modify:**
- `lib/chat/sanitize.ts` - Sanitization utilities
- `components/chat/MessageItem.tsx` - Apply sanitization

**Requirements:**
- Markdown support (bold, italic, links, code)
- Linkify URLs automatically
- XSS prevention (use DOMPurify)
- Emoji rendering

**Test Cases:**
- [ ] Markdown renders correctly
- [ ] URLs become clickable links
- [ ] XSS attempts blocked
- [ ] Emojis display

---

### Stories to Create
- `stories/chat/ThreadView-Virtualized.stories.tsx`
- `stories/chat/OfflineOutbox.stories.tsx`
- `stories/chat/MessageItem-Sanitized.stories.tsx`

---

## 📌 A2: Mail Compose & Folders Improvements

### Spec: `UI-SPEC-MAIL-COMPOSE.md`

### Tasks

#### 1. Draft Lock Indicator (Multi-Tab) ⏳
**Files to Create/Modify:**
- `features/mail/DraftLockIndicator.tsx` - NEW component
- `lib/mail/draft-lock.ts` - Lock management with BroadcastChannel
- `components/mail/MailComposer.tsx` - Show lock indicator

**Requirements:**
- Detect editing in multiple tabs via BroadcastChannel
- Show "Editing in another tab" warning
- Conflict resolution: LWW (Last Write Wins) + merge prompt
- Lock expires after 5 min of inactivity

**UI:**
```
⚠️ This draft is being edited in another tab
Last saved: 2 minutes ago by Tab #2
[Force Edit] [Discard My Changes] [Merge]
```

**Test Cases:**
- [ ] Lock shows when editing in 2+ tabs
- [ ] Merge prompt appears on conflict
- [ ] Lock expires after 5 min

---

#### 2. Virus Scan Status & Allowlist ⏳
**Files to Create/Modify:**
- `components/mail/AttachmentStatus.tsx` - NEW component
- `components/mail/MailDetail.tsx` - Show scan status

**Requirements:**
- Show virus scan status (scanning, clean, threat detected, failed)
- Display allowlist filetypes
- Block download if threat detected

**UI:**
```
📎 document.pdf (2.4 MB)
✅ Virus scan: Clean
🔒 Allowed type: PDF

📎 suspicious.exe (500 KB)
⚠️ Virus scan: Threat detected
🚫 Download blocked
```

**Test Cases:**
- [ ] Scan status displays correctly
- [ ] Threat detected blocks download
- [ ] Allowlist enforced

---

#### 3. Collapse Quoted Text ⏳
**Files to Create/Modify:**
- `components/mail/QuotedText.tsx` - NEW component
- `components/mail/MailDetail.tsx` - Use QuotedText

**Requirements:**
- Collapse quoted text by default
- Show "..." to expand
- Lock threadId/messageId in UI

**UI:**
```
──────── Original Message ────────
[Expand] Show quoted text (3 lines)

[Expanded view shows full quoted content]
```

**Test Cases:**
- [ ] Quoted text collapsed by default
- [ ] Expand shows full content
- [ ] ThreadId/messageId preserved

---

### Stories to Create
- `stories/mail/DraftLock-Conflict.stories.tsx`
- `stories/mail/AttachmentStatus-Scanning.stories.tsx`
- `stories/mail/QuotedText-Collapsed.stories.tsx`

---

## 📌 A3: Projects (Kanban/Gantt) Improvements

### Spec: `UI-SPEC-PROJECTS-KANBAN-GANTT.md`

**IMPORTANT:** Use TanStack, NO SVAR libraries

### Tasks

#### 1. TZ/DST-Aware Utilities ⏳
**Files to Create/Modify:**
- `lib/projects/timezone.ts` - NEW utilities + tests
- `lib/projects/timezone.test.ts` - NEW tests

**Requirements:**
```typescript
function utcDateSpanToPx(
  startDate: Date,
  endDate: Date,
  scale: 'day' | 'week' | 'month',
  timezone: string
): { left: number; width: number }

function handleDST(date: Date, timezone: string): Date
```

**Test Cases:**
- [ ] Handles DST transitions correctly
- [ ] Scales (day/week/month) calculate properly
- [ ] Timezone conversions accurate

---

#### 2. Column Virtualization in Gantt ⏳
**Files to Create/Modify:**
- `features/projects/gantt/GanttChart.tsx` - Add virtualization
- `features/projects/gantt/GanttColumns.tsx` - Virtualized columns
- Use `@tanstack/react-virtual`

**Requirements:**
- Virtualize columns (day/week/month)
- Snap rules (snap to day/week/month boundaries)
- Handle 1000+ tasks smoothly

**Test Cases:**
- [ ] Renders 1000+ tasks without lag
- [ ] Snap to grid works
- [ ] Virtualization scrolls smoothly

---

#### 3. WIP Guard Engine ⏳
**Files to Create/Modify:**
- `lib/projects/wip-guard.ts` - WIP enforcement
- `features/projects/kanban/KanbanLane.tsx` - Apply WIP limits

**Requirements:**
- Status transition map (drag rules)
- Reject drag when WIP exceeded (show toast)
- Override option for admins

**Status Transitions:**
```
Backlog → In Progress → Review → Done
       ↓             ↓        ↓
     Blocked      On Hold  Cancelled
```

**Test Cases:**
- [ ] Drag rejected when WIP exceeded
- [ ] Override works for admins
- [ ] Status transitions follow map

---

#### 4. Dependency Edit UX ⏳
**Files to Create/Modify:**
- `features/projects/shared/DependencyEditor.tsx` - NEW component
- `lib/projects/cycle-detection.ts` - Cycle detection

**Requirements:**
- Esc to cancel edit
- Cycle detection with aria-live announcement
- Visual feedback for invalid dependencies

**Test Cases:**
- [ ] Esc cancels edit
- [ ] Cycle detection announces
- [ ] Invalid dependency shows error

---

### Stories to Create
- `stories/projects/Gantt-Performance.stories.tsx` (1-2k tasks)
- `stories/projects/Kanban-WIPLimit.stories.tsx`
- `stories/projects/DependencyEditor-CycleDetection.stories.tsx`

---

## 📌 A4: Global Search Improvements

### Spec: `UI-SPEC-GLOBAL-SEARCH.md`

### Tasks

#### 1. Explain Score (Dev Tooltip) ⏳
**Files to Create/Modify:**
- `features/search/ScoreExplain.tsx` - NEW component
- `features/search/SearchResultItem.tsx` - Add tooltip

**Requirements:**
- Show score breakdown (title match, content match, recency)
- Dev mode only (check `process.env.NODE_ENV === 'development'`)
- Tooltip on hover

**UI:**
```
Score: 0.85
├─ Title match: 0.4
├─ Content match: 0.3
└─ Recency: 0.15
```

---

#### 2. Prefetch on Hover ⏳
**Files to Create/Modify:**
- `features/search/use-prefetch.ts` - NEW hook
- `features/search/SearchResultItem.tsx` - Use prefetch

**Requirements:**
- Prefetch result detail on hover
- Debounce 300ms
- Use AbortController to cancel

---

#### 3. Locale Tokenization (UI Layer) ⏳
**Files to Create/Modify:**
- `features/search/SearchCommandPalette.tsx` - Use i18n tokenization
- Use `tokenization` from `styles/i18n.ts`

**Requirements:**
- CJK tokenization (character-based)
- Thai tokenization (Intl.Segmenter)
- Fallback to word-based

---

#### 4. Cmd+Enter Open in New Tab ⏳
**Files to Create/Modify:**
- `features/search/SearchCommandPalette.tsx` - Add keyboard handler

**Requirements:**
- Cmd+Enter opens result in new tab
- Ctrl+Click also opens in new tab

---

### Stories to Create
- `stories/search/SearchResults-SlowNetwork.stories.tsx`
- `stories/search/SearchResults-Typos.stories.tsx`
- `stories/search/SearchResults-i18n.stories.tsx`

---

## 📌 A5: Directory & Admin Improvements

### Spec: `UI-SPEC-DIRECTORY-ADMIN.md`

### Tasks

#### 1. Column Mapper Dialog ⏳
**Files to Create/Modify:**
- `features/admin/ColumnMapper.tsx` - NEW component
- `features/admin/BulkImportDialog.tsx` - Add mapper step

**Requirements:**
- Drag CSV header to user field
- Auto-detect delimiter (comma, tab, semicolon)
- Preview mapping before import

**UI:**
```
CSV Column → User Field
──────────────────────
Name       → [Name ▼]
Email      → [Email ▼]
Phone      → [Extension ▼]
```

---

#### 2. Undo Last Import ⏳
**Files to Create/Modify:**
- `features/admin/ImportHistory.tsx` - NEW component
- `features/admin/AdminPanel.tsx` - Add undo button

**Requirements:**
- Show last import timestamp
- Undo button (stub for now)
- Tooltip: "Admin only - reverts last import"

---

#### 3. Dry-Run Summary ⏳
**Files to Create/Modify:**
- `features/admin/DryRunSummary.tsx` - NEW component
- `features/admin/BulkImportDialog.tsx` - Add dry-run step

**Requirements:**
- Show summary: X new users, Y updates, Z errors
- Allow review before apply
- Show validation errors

---

### Stories to Create
- `stories/admin/ColumnMapper.stories.tsx`
- `stories/admin/DryRunSummary.stories.tsx`
- `stories/admin/ImportHistory-Undo.stories.tsx`

---

## 📌 A6: Files Upload & Preview Improvements

### Spec: `UI-SPEC-FILES-UPLOAD-PREVIEW.md`

### Tasks

#### 1. Chunked Resumable Upload ⏳
**Files to Create/Modify:**
- `lib/files/chunked-upload.ts` - Chunked upload logic
- `features/files/FileUploadQueue.tsx` - Show per-chunk progress

**Requirements:**
- Chunk size: 8-16MB
- Parallel: 3 chunks max
- Resume on network error
- Per-chunk progress bar

**UI:**
```
📄 large-file.zip (150 MB)
├─ Chunk 1/10 ████████░░ 80%
├─ Chunk 2/10 ██████░░░░ 60%
└─ Chunk 3/10 ██░░░░░░░░ 20%
```

---

#### 2. Content-Addressed (SHA256) ⏳
**Files to Create/Modify:**
- `lib/files/hash.ts` - SHA256 calculation
- `features/files/FileCard.tsx` - Show hash badge

**Requirements:**
- Calculate SHA256 on upload
- Show hash badge (truncated)
- Duplicate detection

**UI:**
```
📄 document.pdf
🔒 SHA: 3a4f...9c2e
✅ No duplicates
```

---

#### 3. Office→PDF Fallback ⏳
**Files to Create/Modify:**
- `lib/files/convert.ts` - Conversion utilities
- `features/files/FilePreviewModal.tsx` - Add fallback

**Requirements:**
- Attempt PDF conversion for Office files
- If fails, show metadata-only card + download button

**UI:**
```
📄 presentation.pptx
⚠️ Preview unavailable
📥 Download to view
```

---

### Stories to Create
- `stories/files/FileUpload-Resumable.stories.tsx`
- `stories/files/FileUpload-Error.stories.tsx`
- `stories/files/FileCard-Hash.stories.tsx`

---

## 📌 A7: Notifications & PWA Improvements

### Spec: `UI-SPEC-NOTIFICATIONS-PWA.md`

### Tasks

#### 1. Quiet Hours & Rate Limit ⏳
**Files to Create/Modify:**
- `lib/notifications/quiet-hours.ts` - Quiet hours logic
- `lib/notifications/rate-limit.ts` - Rate limiting
- `features/notifications/NotificationSettings.tsx` - Add quiet hours UI

**Requirements:**
- Quiet hours (e.g., 10PM - 8AM)
- Critical override (allow urgent notifications)
- Toast rate limit (max 5/min)

**UI:**
```
🌙 Quiet Hours
From: [10:00 PM ▼]
To:   [ 8:00 AM ▼]
☑️ Allow critical notifications
```

---

#### 2. SW Update UI ⏳
**Files to Create/Modify:**
- `features/pwa/ServiceWorkerUpdate.tsx` - Update component
- `features/pwa/UpdateBadge.tsx` - Version badge

**Requirements:**
- Show version badge (current vs available)
- Auto-update when idle (30s)
- Rollback notice if update fails

**UI:**
```
🔄 Update available
Current: v1.2.3
New: v1.2.4
[Update Now] [Later]

Auto-updating in 30s...
```

---

#### 3. BroadcastChannel Sync ⏳
**Files to Create/Modify:**
- `lib/notifications/broadcast-sync.ts` - BroadcastChannel logic
- `features/notifications/NotificationCenter.tsx` - Use sync

**Requirements:**
- Sync badge count across tabs
- Sync read state across tabs
- Use BroadcastChannel API

**Test Cases:**
- [ ] Badge updates in all tabs
- [ ] Mark as read syncs across tabs

---

### Stories to Create
- `stories/pwa/ServiceWorkerUpdate.stories.tsx`
- `stories/notifications/QuietHours.stories.tsx`
- `stories/notifications/NotificationCenter-Offline.stories.tsx`

---

## 🧪 Testing Infrastructure

### Create A11y Test Harness

**File:** `lib/testing/a11y-harness.ts`

```typescript
import { axe } from 'jest-axe';

export async function runA11yTests(component: React.ReactElement) {
  const { container } = render(component);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
  
  return {
    violations: results.violations,
    passes: results.passes,
  };
}
```

### Create State Stories Template

**File:** `stories/templates/StateStories.tsx`

```typescript
export const stateStories = {
  Idle: () => <Component state="idle" />,
  Loading: () => <Component state="loading" />,
  Optimistic: () => <Component state="optimistic" data={mockData} />,
  Success: () => <Component state="success" data={mockData} />,
  Error: () => <Component state="error" error={mockError} />,
};
```

---

## 📊 Progress Tracking

| Module | Tasks | Stories | Tests | Status |
|--------|-------|---------|-------|--------|
| **A0: Foundation** | 4/4 | 0/4 | 0/4 | ✅ 100% |
| **A1: Chat** | 0/4 | 0/3 | 0/4 | ⏳ 0% |
| **A2: Mail** | 0/3 | 0/3 | 0/3 | ⏳ 0% |
| **A3: Projects** | 0/4 | 0/3 | 0/4 | ⏳ 0% |
| **A4: Search** | 0/4 | 0/3 | 0/4 | ⏳ 0% |
| **A5: Admin** | 0/3 | 0/3 | 0/3 | ⏳ 0% |
| **A6: Files** | 0/3 | 0/3 | 0/3 | ⏳ 0% |
| **A7: PWA** | 0/3 | 0/3 | 0/3 | ⏳ 0% |

**Overall:** 4/28 tasks complete (14%)

---

## 🚀 Next Actions

### Immediate Priority
1. ✅ ~~Create foundation files (A0)~~
2. ⏳ Create Storybook INDEX.stories.mdx
3. ⏳ Create state stories template
4. ⏳ Create a11y test harness

### Short Term (Week 1)
1. ⏳ Implement A1 (Chat improvements)
2. ⏳ Implement A2 (Mail improvements)

### Medium Term (Week 2)
1. ⏳ Implement A3 (Projects improvements)
2. ⏳ Implement A4 (Search improvements)

### Long Term (Week 3-4)
1. ⏳ Implement A5 (Admin improvements)
2. ⏳ Implement A6 (Files improvements)
3. ⏳ Implement A7 (PWA improvements)

---

## ✅ Summary

**A0 Foundation** is complete and production-ready! All modules can now use:
- ✅ Standardized state taxonomy
- ✅ Retry logic with exponential backoff
- ✅ i18n/RTL utilities
- ✅ ARIA helpers and a11y utilities
- ✅ Design tokens and performance targets

**Next:** Implement module-specific improvements (A1-A7) using the foundation.

**Estimated Timeline:** 3-4 weeks for full implementation of A1-A7.
