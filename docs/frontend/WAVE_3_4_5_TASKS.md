# 📋 Wave 3, 4, 5 - Detailed Task Breakdown

**Status**: Wave-1 ✅ Complete | Wave-2 ✅ 95% | Wave-3 🔶 85% | Wave-4 🔶 30% | Wave-5 ⬜ 0%

---

## 🎯 Wave-3 Remaining (P1)

### FE-14b: Audit Trail Viewer
**Estimate**: 8h | **Priority**: P1 | **Status**: ⬜

**Files**:
- `features/directory/components/audit-trail-viewer.tsx`
- `features/directory/components/audit-event-row.tsx`
- `lib/api/hooks/use-audit-trail.ts`

**Criteria**:
- Shows audit events with timestamp, actor, action, target
- Filters: date range, action type, user
- Export to CSV
- Real-time via `directory.audit.created`
- Cursor pagination

---

### FE-14c: Bulk Import Dry-Run UI
**Estimate**: 12h | **Priority**: P1 | **Status**: ⬜

**Files**:
- `features/admin/components/bulk-import-wizard.tsx`
- `features/admin/components/bulk-import-preview-table.tsx`
- `lib/api/hooks/use-bulk-import.ts`

**Steps**:
1. Upload CSV (max 5MB)
2. Map columns (auto-detect)
3. Dry-run validation + preview
4. Import with progress bar
5. Success summary

---

### FE-12a: SVAR DataGrid (Grid View)
**Estimate**: 16h | **Priority**: P1 | **Status**: ⬜
**Dependency**: `npm install @svar/grid-react`

**Files**:
- `features/projects/components/project-grid-view.tsx`
- `features/projects/components/grid-toolbar.tsx`

**Features**:
- Inline editing
- Sorting, filtering, export
- Column reorder & resize
- Virtualization (>1000 tasks)
- Real-time sync

---

### FE-12b: SVAR Gantt (Timeline View)
**Estimate**: 20h | **Priority**: P1 | **Status**: ⬜
**Dependency**: `npm install @svar/gantt-react`

**Files**:
- `features/projects/components/project-gantt-view.tsx`
- `features/projects/components/gantt-toolbar.tsx`
- `lib/api/hooks/use-task-dependencies.ts`

**Features**:
- Drag-to-resize & drag-to-move
- Task dependencies
- Critical path highlighting
- Baseline comparison
- Zoom controls

---

### FE-12c: Charts View (Analytics)
**Estimate**: 12h | **Priority**: P1 | **Status**: ⬜

**Files**:
- `features/projects/components/project-charts-view.tsx`
- `features/projects/components/charts/burndown-chart.tsx`
- `features/projects/components/charts/progress-chart.tsx`
- `features/projects/components/charts/workload-chart.tsx`

**Charts**:
1. Burndown (ideal vs actual)
2. Progress pie chart
3. Workload bar chart
4. Timeline line chart

---

## 🎯 Wave-4 Remaining (P1-P2)

### FE-18f: Service Worker Registration
**Estimate**: 4h | **Priority**: P1 | **Status**: 🔶 Partial

**Tasks**:
- Register SW in `app/layout.tsx`
- Test push notifications (foreground/background)
- Add SW update prompt
- Browser compatibility testing

---

### FE-19a: next-intl Integration
**Estimate**: 16h | **Priority**: P2 | **Status**: ⬜
**Dependency**: `npm install next-intl`

**Tasks**:
- Create `messages/id.json`, `messages/en.json`
- Configure locale routing (`/[locale]/...`)
- Extract all strings to locale files
- Add language switcher
- Format dates/numbers per locale

---

### FE-19b: WCAG 2.1 AA Compliance
**Estimate**: 20h | **Priority**: P2 | **Status**: ⬜

**Tasks**:
- Run axe DevTools audit
- Fix color contrast (4.5:1)
- Add alt text, aria-labels
- Test keyboard navigation
- Test with screen reader

---

### FE-19c: Keyboard Shortcuts
**Estimate**: 12h | **Priority**: P2 | **Status**: ⬜

**Files**:
- `lib/keyboard-shortcuts/registry.ts`
- `components/keyboard-shortcuts-help.tsx`

**Shortcuts**:
- Cmd+K: Search
- Cmd+B: Toggle sidebar
- Cmd+N: New message
- ?: Help overlay

---

### FE-19d: SWR Policy Tuning
**Estimate**: 6h | **Priority**: P2 | **Status**: ⬜

**Tasks**:
- Audit all useQuery calls
- Set optimal staleTime/cacheTime
- Configure ETag support
- Document strategy

---

### FE-19e: Performance Optimization
**Estimate**: 12h | **Priority**: P2 | **Status**: ⬜

**Tasks**:
- Profile with React DevTools
- Add React.memo to expensive components
- Implement code splitting
- Optimize images with next/image
- Lazy load modals

---

## 🎯 Wave-5: Design System & Testing (P2)

### FE-DS-1 to FE-DS-8: Storybook Stories
**Estimate**: 40h total | **Priority**: P2 | **Status**: ⬜
**Dependency**: `npm install @storybook/react @storybook/nextjs`

**Components to Document**:
1. Avatar + PresenceChip (4h)
2. MessageBubble + ThreadPane (6h)
3. RichTextEditor toolbar (6h)
4. KanbanCard + TaskModal (6h)
5. FileCard + FileUploadZone (4h)
6. SearchResultRow + DirectoryTreeItem (4h)
7. Toast/Notification components (4h)
8. Design tokens documentation (6h)

---

### FE-TEST-1: Playwright E2E Tests
**Estimate**: 24h | **Priority**: P2 | **Status**: ⬜
**Dependency**: `npm install @playwright/test`

**Test Flows**:
- Login → Dashboard
- Chat: Send message, receive reply, react
- Projects: Create project, add task, drag to column
- Files: Upload, preview, download
- Search: Query, filter, navigate
- Notifications: Click, mark as read

---

### FE-TEST-2: React Testing Library
**Estimate**: 20h | **Priority**: P2 | **Status**: ⬜

**Components to Test**:
- OptimisticMessageList
- BoardView + TaskCardDraggable
- GlobalSearchDialog
- NotificationBell
- FileUploadZone

---

### FE-CI-1: Frontend CI Pipeline
**Estimate**: 8h | **Priority**: P2 | **Status**: ✅ DONE

Already implemented in `.github/workflows/frontend-ci.yml`

---

### FE-CI-2: Lighthouse CI
**Estimate**: 6h | **Priority**: P2 | **Status**: ⬜
**Dependency**: `npm install @lhci/cli`

**Tasks**:
- Configure Lighthouse CI
- Set performance budgets
- Add to GitHub Actions
- Fail PR if scores < threshold

---

## 📊 Summary

| Wave | Tasks | Estimated Hours | Priority |
|------|-------|-----------------|----------|
| Wave-3 | 5 | 68h | P1 |
| Wave-4 | 6 | 70h | P1-P2 |
| Wave-5 | 5 groups | 98h | P2 |
| **Total** | **16** | **236h** | **~6 weeks** |

---

## 🚀 Recommended Execution Order

### Sprint 1 (Week 1-2): Wave-3 P1
1. FE-14b: Audit viewer (8h)
2. FE-14c: Bulk import (12h)
3. FE-12c: Charts view (12h)

### Sprint 2 (Week 3-4): Wave-3 Advanced
4. FE-12a: SVAR Grid (16h)
5. FE-12b: SVAR Gantt (20h)

### Sprint 3 (Week 5): Wave-4 P1
6. FE-18f: Service worker (4h)
7. FE-19d: SWR tuning (6h)
8. FE-19e: Performance (12h)

### Sprint 4 (Week 6): Wave-4 P2
9. FE-19c: Keyboard shortcuts (12h)
10. FE-19b: WCAG compliance (20h)

### Sprint 5-6 (Week 7-12): Wave-5
11. Storybook stories (40h)
12. E2E tests (24h)
13. Unit tests (20h)
14. Lighthouse CI (6h)

Last item: FE-19a i18n (16h) - can be done in parallel

---

**Next Action**: Start FE-14b (Audit Trail Viewer)
