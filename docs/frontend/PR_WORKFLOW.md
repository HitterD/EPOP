# 🔄 Frontend PR Workflow & Guidelines

**Principal Product Designer + Staff Frontend Architect**

---

## 📝 PR Template

```markdown
## [FE-XXX] Feature Title

### Task ID
- **Wave**: Wave-3 / Wave-4 / Wave-5
- **Task ID**: FE-14b / FE-19a / etc.
- **Estimate**: 8h
- **Priority**: P0 / P1 / P2

### Description
Brief description of what this PR implements.

### Changes
- ✅ Created `features/*/components/*.tsx`
- ✅ Created `lib/api/hooks/use-*.ts`
- ✅ Updated `types/index.ts` with new interfaces
- ✅ Updated `/docs/frontend/*.md`

### Testing
- [x] Manual testing completed
- [x] All acceptance criteria met
- [ ] E2E tests added (if applicable)
- [ ] Unit tests added (if applicable)

### Screenshots/Video
(Attach screenshots or Loom video)

### Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

### Documentation Updated
- [x] `docs/frontend/FEATURE.md` updated
- [x] `EPop_Status.md` tracker updated
- [x] Component props documented

### [FE→BE] Contract Request (if needed)
**Not applicable** / **Required** (see below)

---

## Contract Request: [Feature Name]

### Missing Backend Endpoints
1. `GET /api/v1/endpoint` - Description
   - Response: `{ data: [] }`
2. `POST /api/v1/endpoint` - Description
   - Request: `{ field: "value" }`
   - Response: `{ id: "123" }`

### Missing WebSocket Events
1. `domain.event.name` - Payload: `{ id, data }`

### Suggested Implementation
(Optional: suggest how BE should implement)

---

### Deployment Notes
- No migration needed / Migration required
- No env vars needed / Add `NEXT_PUBLIC_*` to `.env.local`

### Checklist
- [x] Code follows style guide
- [x] No console.log left
- [x] TypeScript strict mode passes
- [x] Dark mode tested
- [x] Mobile responsive tested
- [x] Accessibility checked
```

---

## 🔀 Branch Naming Convention

```
feat/fe-14b-audit-viewer
feat/fe-19a-i18n-integration
fix/fe-chat-scroll-bug
refactor/fe-grid-component
docs/fe-update-roadmap
```

**Pattern**: `<type>/fe-<task-id>-<short-description>`

---

## 📦 Commit Message Format

```
feat(fe): FE-14b - Add audit trail viewer component

- Created AuditTrailViewer with cursor pagination
- Added date range and action type filters
- Implemented export to CSV functionality
- Real-time updates via directory.audit.created event
```

**Pattern**:
```
<type>(fe): <task-id> - <short summary>

<detailed description>
- Bullet point 1
- Bullet point 2
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

---

## ✅ Pre-Commit Checklist

### Code Quality
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: 0
- [ ] No `console.log` statements
- [ ] No `any` types (except where unavoidable)
- [ ] No commented-out code

### Functionality
- [ ] Component renders without errors
- [ ] All props validated
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented

### UI/UX
- [ ] Dark mode tested
- [ ] Mobile responsive (375px, 768px, 1920px)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Tooltips added where needed

### Performance
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Images optimized (next/image)
- [ ] Code split if > 50KB
- [ ] Lazy load modals/dialogs

### Documentation
- [ ] Component props documented
- [ ] README updated (if new pattern)
- [ ] Storybook story added (Wave-5)
- [ ] `EPop_Status.md` task marked complete

---

## 🧪 Testing Requirements

### Manual Testing
**Required for all PRs**

1. **Happy Path**: Normal user flow works
2. **Error Path**: Graceful error handling
3. **Edge Cases**: Empty data, network errors, slow connections
4. **Cross-browser**: Chrome, Firefox, Safari
5. **Responsive**: Desktop, tablet, mobile

### Automated Testing
**Required for Wave-5**

1. **Unit Tests** (React Testing Library)
   - Component rendering
   - User interactions
   - State management

2. **E2E Tests** (Playwright)
   - Critical user flows
   - Integration with backend
   - Real-time features

### Accessibility Testing
**Required for Wave-4 P2**

1. **Keyboard Navigation**: Tab through all elements
2. **Screen Reader**: Test with NVDA/VoiceOver
3. **Color Contrast**: Use axe DevTools
4. **Focus Management**: Visible focus indicators

---

## 📋 PR Review Checklist (for Reviewers)

### Code Review
- [ ] Code is readable and maintainable
- [ ] Component structure follows conventions
- [ ] No code duplication
- [ ] Error handling is robust
- [ ] Types are accurate

### Functionality Review
- [ ] All acceptance criteria met
- [ ] No regressions introduced
- [ ] Real-time features work
- [ ] Optimistic updates with rollback

### UI/UX Review
- [ ] Matches design system
- [ ] Consistent with existing patterns
- [ ] Loading states are smooth
- [ ] Animations are subtle
- [ ] Feedback is clear (toasts, errors)

### Documentation Review
- [ ] `EPop_Status.md` updated
- [ ] Component documented
- [ ] API contracts clear
- [ ] README updated if needed

---

## 🚨 Contract Request Workflow

### When to Request BE Changes

**Submit contract request if**:
- Missing endpoint needed
- Missing WebSocket event needed
- Endpoint returns incomplete data
- Endpoint has incorrect response shape
- Performance issue (N+1 queries, slow response)

**Do NOT submit if**:
- FE can work around it
- It's a FE-only concern (UI state, styling)
- It's covered by existing endpoint

### Contract Request Format

```markdown
## [FE→BE] Contract Request: Audit Trail Pagination

### Current Issue
The `/api/v1/directory/audit` endpoint returns all audit events without pagination,
causing slow response times (>5s) and memory issues in FE for large orgs.

### Proposed Solution
Add cursor-based pagination to `/api/v1/directory/audit` endpoint.

**Request**:
```
GET /api/v1/directory/audit?limit=20&cursor=abc123
```

**Response**:
```json
{
  "items": [...],
  "nextCursor": "def456",
  "hasMore": true
}
```

### FE Impact
- Enables infinite scroll in AuditTrailViewer
- Reduces initial load time from 5s to <500ms
- Reduces memory usage in browser

### BE Estimate
~4 hours (reuse existing cursor pagination helper)

### Priority
P1 - Blocks FE-14b completion

### Alternative
(If BE unavailable: FE can fetch all and paginate client-side, but not scalable)
```

---

## 🔄 PR Lifecycle

### 1. Create Branch
```bash
git checkout -b feat/fe-14b-audit-viewer
```

### 2. Implement Feature
- Write code
- Test manually
- Update documentation

### 3. Self-Review
- Run through pre-commit checklist
- Test all acceptance criteria
- Record demo video (Loom)

### 4. Commit & Push
```bash
git add .
git commit -m "feat(fe): FE-14b - Add audit trail viewer"
git push origin feat/fe-14b-audit-viewer
```

### 5. Create PR
- Fill out PR template
- Add screenshots/video
- Mark task in `EPop_Status.md`
- Request review

### 6. Address Feedback
- Make requested changes
- Push new commits
- Reply to comments

### 7. Merge
- Squash and merge (preferred)
- Delete branch after merge

### 8. Update Status
- Mark task ✅ in `EPop_Status.md`
- Update progress tracker
- Notify team in Slack/Teams

---

## 📊 Definition of Done

A task is **DONE** when:

- [x] Code merged to main
- [x] All acceptance criteria met
- [x] Manual testing completed
- [x] Documentation updated
- [x] `EPop_Status.md` marked ✅
- [x] No known bugs
- [x] Works in production (staging)

---

## 🎯 Example PR: FE-14b Audit Trail Viewer

```markdown
## [FE-14b] Add Directory Audit Trail Viewer Component

### Task ID
- **Wave**: Wave-3
- **Task ID**: FE-14b
- **Estimate**: 8h
- **Priority**: P1

### Description
Implements a comprehensive audit trail viewer for directory changes (user moves,
org unit changes, etc.) with filtering, export, and real-time updates.

### Changes
- ✅ Created `features/directory/components/audit-trail-viewer.tsx`
- ✅ Created `features/directory/components/audit-event-row.tsx`
- ✅ Created `features/directory/components/audit-filters.tsx`
- ✅ Created `lib/api/hooks/use-audit-trail.ts`
- ✅ Added `AuditEvent` interface to `types/index.ts`
- ✅ Updated `docs/frontend/DIRECTORY_ADMIN.md`

### Testing
- [x] Manual testing completed
- [x] All acceptance criteria met
- [x] Tested with >1000 audit events
- [x] Tested real-time updates
- [x] Tested CSV export

### Screenshots
[Attach screenshot of audit viewer with filters]

### Acceptance Criteria
- [x] Shows audit events with timestamp, actor, action, target, details
- [x] Supports filtering by date range, action type, user
- [x] Supports export to CSV with all columns
- [x] Updates in real-time when new audit events occur
- [x] Loads next page smoothly with cursor pagination
- [x] Shows readable descriptions

### Documentation Updated
- [x] `docs/frontend/DIRECTORY_ADMIN.md` updated with component docs
- [x] `EPop_Status.md` FE-14b marked ✅
- [x] Component props documented inline

### [FE→BE] Contract Request
**Not applicable** - Backend endpoint already supports cursor pagination

### Deployment Notes
- No migration needed
- No new env vars needed

### Checklist
- [x] Code follows style guide
- [x] No console.log left
- [x] TypeScript strict mode passes
- [x] Dark mode tested
- [x] Mobile responsive tested
- [x] Accessibility checked (keyboard nav, aria-labels)
```

---

**Last Updated**: 5 November 2025, 1:00 PM
