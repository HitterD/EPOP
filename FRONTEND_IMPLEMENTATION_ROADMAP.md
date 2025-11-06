# Frontend Implementation Roadmap - EPOP

**Date**: 5 November 2025  
**Role**: Principal Product Designer + Staff Frontend Architect  
**Scope**: Complete frontend GAP closure with detailed UI/UX specifications and phased implementation

---

## Executive Summary

Berdasarkan analisis mendalam terhadap `EPop_Status.md` dan `FE_BE_GAP.md`, saya telah menyusun spesifikasi UI/UX terperinci dan roadmap implementasi bertahap untuk menutup seluruh GAP frontend EPOP. Implementasi dibagi menjadi 5 Wave dengan total 40+ task, diprioritaskan berdasarkan dampak bisnis dan dependensi teknis.

### Status Saat Ini (5 Nov 2025)
- ✅ **Wave-1 (Infrastructure)**: COMPLETED — Auth, pagination, idempotency, events, tracing, ETag
- ✅ **Wave-2 (Core Features)**: MOSTLY COMPLETE — Chat, compose, files (presign flow done, preview pending)
- 🔶 **Wave-3 (Advanced)**: PARTIAL — Projects sync done, Grid/Gantt/Search/Directory UI pending
- ⬜ **Wave-4 (Polish)**: PENDING — Notifications, i18n, a11y, performance tuning
- ⬜ **Wave-5 (Design System)**: PENDING — Storybook stories, component documentation

### Deliverables Completed Today
1. ✅ **TODO Execution Tracker** — Added to `EPop_Status.md`
2. ✅ **FILE_PREVIEW.md** — File preview & attachment UI spec (FE-11b, FE-11c)
3. ✅ **DIRECTORY_ADMIN.md** — Directory drag-move & audit UI spec (FE-14a-c)
4. ✅ **NOTIFICATION_CENTER.md** — Notification center & Web Push spec (FE-18a-c)
5. ✅ **PROJECTS_ADVANCED.md** — SVAR Grid/Gantt/Charts spec (FE-12a-c)
6. ✅ **I18N_A11Y_PERFORMANCE.md** — i18n/a11y/perf spec (FE-19a-e)
7. ✅ **DESIGN_SYSTEM.md** — Storybook & component library spec (FE-DS-1 to FE-DS-8)
8. ✅ **TESTING_CI.md** — Testing strategy & CI/CD pipeline spec (FE-TEST-1/2, FE-CI-1/2)

---

## Implementation Waves

### Wave-1: P0 Infrastructure ✅ COMPLETED
**Duration**: Completed  
**Goal**: Establish solid foundation for all features

#### Tasks Completed
- [x] **FE-1**: Cookie-only session + 401→refresh→retry
- [x] **FE-2**: Session center with device tracking
- [x] **FE-3**: RBAC with `<IfCan>` component
- [x] **FE-4**: Cursor pagination (Messages, Tasks, Files, Mail, Audit)
- [x] **FE-5**: Idempotency-Key header on POST/PATCH
- [x] **FE-6**: `useDomainEvents()` + optimistic reconciliation
- [x] **FE-16**: Trace ID propagation (X-Request-Id)
- [x] **FE-17**: ETag caching + If-None-Match

**Validation**:
- ✅ Re-send POST with same Idempotency-Key → no duplicate
- ✅ 401 response → auto-refresh → retry → success
- ✅ Cursor pagination loads 50+ items without offset issues
- ✅ Socket.IO events reconcile with TanStack Query cache <1s

---

### Wave-2: Core Features — Chat/Compose/Files 🔶 MOSTLY COMPLETE
**Duration**: 2-3 weeks  
**Goal**: Complete messaging and file management features

#### Completed Tasks
- [x] **FE-7**: Thread side-pane with virtualized stream
- [x] **FE-8**: Typing/presence indicators (debounced 3s)
- [x] **FE-9**: HTML sanitization (DOMPurify) + mail folders
- [x] **FE-10**: Bulk mail operations + "Send as Mail" toggle
- [x] **FE-11**: Presigned upload flow (3-step: presign→upload→confirm)

#### Pending Tasks (P0 Blockers)
- [ ] **FE-11b**: File preview UI (PDF with react-pdf, images, video, audio)
  - **Estimate**: 3 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: PDF renders all pages, images zoomable, unsupported files show download button
  - **Spec**: `/docs/frontend/FILE_PREVIEW.md`

- [ ] **FE-11c**: Attachment display in Chat/Mail
  - **Estimate**: 2 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: Click attachment → preview modal opens, download button works
  - **Spec**: `/docs/frontend/FILE_PREVIEW.md`

**PR Template**:
```markdown
## [FE-11b] File Preview UI

### Changes
- Implement PDFPreview component with react-pdf
- Implement ImagePreview with zoom controls
- Implement VideoPreview and AudioPreview
- Add UnsupportedPreview fallback
- Update FilePreviewModal to route to correct preview type

### Testing
- [ ] PDF preview renders all pages
- [ ] Image preview shows full resolution
- [ ] Video/audio players work
- [ ] Keyboard navigation (Esc, ←, →)
- [ ] Preview modal opens from file browser
- [ ] Sidebar shows metadata and context

### Screenshots
[Attach preview modal screenshots]

### Related Docs
- Spec: `/docs/frontend/FILE_PREVIEW.md`
- Backend: No changes needed (presigned URLs already implemented)
```

---

### Wave-3: Advanced Features — Projects/Search/Directory 🔶 PARTIAL
**Duration**: 4-5 weeks  
**Goal**: Complete power-user and admin features

#### Completed Tasks
- [x] **FE-12**: Real-time sync across Board/Grid/Gantt/Schedule
- [x] **FE-13**: Timezone support + drag-reorder with rollback
- [x] **FE-15**: Search tabs + filters + ACL-aware

#### Pending Tasks (P1 Enhanced UX)

##### Projects Advanced Views
- [ ] **FE-12a**: SVAR DataGrid integration for Grid view
  - **Estimate**: 5 days
  - **Owner**: Senior Frontend Engineer
  - **Dependencies**: Consider ag-grid-community as free alternative
  - **Acceptance**: Inline editing, sorting, filtering, export to CSV
  - **Spec**: `/docs/frontend/PROJECTS_ADVANCED.md`

- [ ] **FE-12b**: SVAR Gantt integration for Timeline view
  - **Estimate**: 6 days
  - **Owner**: Senior Frontend Engineer
  - **Dependencies**: Consider frappe-gantt as free alternative
  - **Acceptance**: Drag bars, resize, create dependencies, critical path
  - **Spec**: `/docs/frontend/PROJECTS_ADVANCED.md`

- [ ] **FE-12c**: Charts view (Burndown, Progress, Workload)
  - **Estimate**: 4 days
  - **Owner**: Frontend Engineer
  - **Dependencies**: Recharts (already in package.json)
  - **Acceptance**: All 4 charts render, filters work, export PNG/CSV
  - **Spec**: `/docs/frontend/PROJECTS_ADVANCED.md`

##### Directory & Admin
- [ ] **FE-14a**: Directory drag-move UI with visual feedback
  - **Estimate**: 4 days
  - **Owner**: Frontend Engineer
  - **Dependencies**: @dnd-kit/core (already in package.json)
  - **Acceptance**: Drag user to unit, visual feedback, optimistic update
  - **Spec**: `/docs/frontend/DIRECTORY_ADMIN.md`

- [ ] **FE-14b**: Audit trail viewer component
  - **Estimate**: 2 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: Timeline display, filters, export CSV
  - **Spec**: `/docs/frontend/DIRECTORY_ADMIN.md`

- [ ] **FE-14c**: Bulk import dry-run UI with preview
  - **Estimate**: 3 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: CSV upload, validation preview, error list, commit import
  - **Spec**: `/docs/frontend/DIRECTORY_ADMIN.md`

**Backend Contract Requests** (for FE-12a-c):
```markdown
### [BE Contract] Chart Data Endpoints

**Needed for**: FE-12c (Charts View)

**New Endpoints**:
- `GET /projects/:id/charts/burndown?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /projects/:id/charts/progress`
- `GET /projects/:id/charts/workload?assigneeId=...`
- `GET /projects/:id/charts/timeline?start=YYYY-MM-DD&end=YYYY-MM-DD`

**Response Formats**: See `/docs/frontend/PROJECTS_ADVANCED.md`

**Priority**: P1 (needed before Wave-3 completion)
```

---

### Wave-4: Polish — Notifications/i18n/A11y/Performance ⬜ PENDING
**Duration**: 3-4 weeks  
**Goal**: Production-ready quality and accessibility

#### Notifications (P0 for MVP)
- [ ] **FE-18a**: Notification center UI component
  - **Estimate**: 3 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: Bell popover, infinite scroll, mark as read, navigate to action
  - **Spec**: `/docs/frontend/NOTIFICATION_CENTER.md`

- [ ] **FE-18b**: Notification settings page
  - **Estimate**: 2 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: Per-channel toggles, Do Not Disturb, auto-save
  - **Spec**: `/docs/frontend/NOTIFICATION_CENTER.md`

- [ ] **FE-18c**: Web Push subscription flow
  - **Estimate**: 4 days
  - **Owner**: Senior Frontend Engineer
  - **Acceptance**: Service worker registered, VAPID subscription, test push works
  - **Spec**: `/docs/frontend/NOTIFICATION_CENTER.md`

**Backend Contract Requests**:
```markdown
### [BE Contract] Notification Endpoints

**Needed for**: FE-18a-c

**Missing Endpoint**:
- `POST /notifications/test` - Send test push notification
  - Response: `{ success: true, message: "Test notification sent" }`

**Verify Existing**:
- `GET /notifications` (cursor paginated)
- `POST /notifications/:id/read`
- `POST /notifications/mark-all-read`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /notifications/web-push/subscribe`
- `POST /notifications/web-push/unsubscribe`

All documented in backend CI smoke tests (per memory).
```

#### Internationalization
- [ ] **FE-19a**: next-intl full integration (en/id)
  - **Estimate**: 5 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: All text uses `useTranslations()`, language switcher works
  - **Spec**: `/docs/frontend/I18N_A11Y_PERFORMANCE.md`

#### Accessibility
- [ ] **FE-19b**: WCAG 2.1 AA compliance audit + fixes
  - **Estimate**: 6 days
  - **Owner**: Senior Frontend Engineer
  - **Acceptance**: Lighthouse a11y >90, screen reader tested, keyboard navigation works
  - **Spec**: `/docs/frontend/I18N_A11Y_PERFORMANCE.md`

- [ ] **FE-19c**: Keyboard shortcuts global registry + overlay
  - **Estimate**: 2 days
  - **Owner**: Frontend Engineer
  - **Acceptance**: Ctrl+? opens help, all shortcuts work
  - **Spec**: `/docs/frontend/I18N_A11Y_PERFORMANCE.md`

#### Performance
- [ ] **FE-19d**: SWR policy tuning per query type
  - **Estimate**: 2 days
  - **Owner**: Senior Frontend Engineer
  - **Acceptance**: Query cache hit rate >70%, optimized staleTime per query
  - **Spec**: `/docs/frontend/I18N_A11Y_PERFORMANCE.md`

- [ ] **FE-19e**: Performance profiling + React.memo optimization
  - **Estimate**: 3 days
  - **Owner**: Senior Frontend Engineer
  - **Acceptance**: LCP <2.5s, CLS <0.1, bundle <300KB gzipped
  - **Spec**: `/docs/frontend/I18N_A11Y_PERFORMANCE.md`

---

### Wave-5: Design System & Testing 📋 PLANNED
**Duration**: 3-4 weeks  
**Goal**: Documentation and quality assurance

#### Storybook Stories
- [ ] **FE-DS-1**: Avatar + PresenceChip stories
- [ ] **FE-DS-2**: MessageBubble + ThreadPane stories
- [ ] **FE-DS-3**: RichTextEditor toolbar stories
- [ ] **FE-DS-4**: KanbanCard + TaskModal stories
- [ ] **FE-DS-5**: FileCard + FileUploadZone stories
- [ ] **FE-DS-6**: SearchResultRow + DirectoryTreeItem stories
- [ ] **FE-DS-7**: Toast/Notification stories
- [ ] **FE-DS-8**: Design tokens documentation

**Estimate**: 2 days per group (16 days total)  
**Owner**: UI/UX Engineer  
**Spec**: `/docs/frontend/DESIGN_SYSTEM.md`

#### Testing
- [ ] **FE-TEST-1**: Playwright E2E tests (login, chat, projects)
  - **Estimate**: 8 days
  - **Owner**: QA Engineer / Senior Frontend Engineer
  - **Acceptance**: Critical flows covered, runs on CI, POM pattern
  - **Spec**: `/docs/frontend/TESTING_CI.md`

- [ ] **FE-TEST-2**: React Testing Library unit tests
  - **Estimate**: 10 days
  - **Owner**: All Frontend Engineers
  - **Acceptance**: Coverage >70%, MSW mocks, runs on CI
  - **Spec**: `/docs/frontend/TESTING_CI.md`

#### CI/CD
- [ ] **FE-CI-1**: Frontend CI pipeline (lint, test, build)
  - **Estimate**: 2 days
  - **Owner**: DevOps / Senior Frontend Engineer
  - **Acceptance**: Runs on every PR, fails on errors
  - **Spec**: `/docs/frontend/TESTING_CI.md`

- [ ] **FE-CI-2**: Lighthouse CI for performance regression
  - **Estimate**: 2 days
  - **Owner**: DevOps / Senior Frontend Engineer
  - **Acceptance**: Scores >90, budgets enforced
  - **Spec**: `/docs/frontend/TESTING_CI.md`

---

## Prioritized Execution Plan

### Immediate Next Steps (Week 1-2)
**Focus**: Close P0 blockers for MVP

1. **FE-11b + FE-11c**: File Preview & Attachments (5 days)
   - PR 1: PDF/Image/Video preview components
   - PR 2: Attachment display in Chat
   - PR 3: Attachment display in Mail

2. **FE-18a + FE-18b**: Notification Center UI (5 days)
   - PR 1: NotificationBell + popover
   - PR 2: NotificationSettings page
   - PR 3: Socket.IO event integration

### Short-Term (Week 3-6)
**Focus**: Complete Wave-3 advanced features

3. **FE-14a + FE-14b + FE-14c**: Directory Admin (9 days)
   - PR 1: Drag-move UI with @dnd-kit
   - PR 2: Audit trail viewer
   - PR 3: Bulk import wizard

4. **FE-18c**: Web Push Subscription (4 days)
   - PR 1: Service worker setup
   - PR 2: VAPID subscription flow
   - PR 3: Test notification + docs

### Mid-Term (Week 7-12)
**Focus**: Polish and quality (Wave-4)

5. **FE-12a + FE-12b + FE-12c**: Projects Advanced Views (15 days)
   - PR 1: DataGrid with inline editing
   - PR 2: Gantt with drag/resize/dependencies
   - PR 3: Charts view (4 chart types)

6. **FE-19a + FE-19b + FE-19c**: i18n + A11y (13 days)
   - PR 1: next-intl setup + translations
   - PR 2: WCAG audit + fixes
   - PR 3: Keyboard shortcuts overlay

7. **FE-19d + FE-19e**: Performance Tuning (5 days)
   - PR 1: SWR policy optimization
   - PR 2: React.memo + bundle analysis

### Long-Term (Week 13-16)
**Focus**: Design system and testing (Wave-5)

8. **FE-DS-1 to FE-DS-8**: Storybook Stories (16 days)
   - 8 PRs (one per group, 2 days each)

9. **FE-TEST-1 + FE-TEST-2**: Testing Coverage (18 days)
   - PR 1: E2E setup + auth/chat tests
   - PR 2: E2E projects/files tests
   - PR 3: Unit tests for components
   - PR 4: Unit tests for hooks/utils

10. **FE-CI-1 + FE-CI-2**: CI/CD Automation (4 days)
    - PR 1: Frontend CI workflow
    - PR 2: Lighthouse CI workflow

---

## PR Guidelines & Commit Convention

### Commit Message Format
```
feat(fe): <task-id> - <short description>

<detailed description>

Closes #<issue-number>
```

**Examples**:
```
feat(fe): FE-11b - Implement file preview modal with PDF support

- Add PDFPreview component using react-pdf
- Add ImagePreview with zoom controls
- Add VideoPreview and AudioPreview
- Route FilePreviewModal to correct preview type
- Add keyboard navigation (Esc, arrows)

Closes #145
```

```
fix(fe): FE-18a - Fix notification popover scroll on mobile

- Add touch event handlers for mobile scroll
- Fix z-index conflict with top header
- Improve popover positioning on small screens

Closes #178
```

### PR Template
```markdown
## [Task ID] Title

### Description
Brief description of changes and why they were needed.

### Changes
- List of main changes
- Each change on new line
- Keep it concise

### Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Mobile tested (if UI changes)

### Screenshots/Videos
[Attach relevant screenshots or screen recordings]

### Documentation
- [ ] Updated `/docs/frontend/*.md` (if applicable)
- [ ] Updated `EPop_Status.md` TODO tracker
- [ ] Added Storybook story (if new component)

### Backend Contract Changes
- [ ] No backend changes needed
- [ ] Backend contract request filed (link to issue)
- [ ] Backend changes already deployed

### Checklist
- [ ] Code follows project style guide
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Prettier formatted
- [ ] PR title follows convention
- [ ] Labels added (enhancement/bug/docs)

### Related
- Spec: `/docs/frontend/...`
- Issue: #...
- Backend PR: (if applicable)
```

### PR Size Guidelines
- **Small** (<200 lines): 1 reviewer, 1-day turnaround
- **Medium** (200-500 lines): 2 reviewers, 2-day turnaround
- **Large** (>500 lines): Break into smaller PRs if possible

### Review Process
1. **Self-review**: Author reviews own PR before requesting review
2. **Automated checks**: All CI checks must pass
3. **Code review**: At least 1 approval from senior engineer
4. **QA review**: For P0/P1 features, QA approval required
5. **Merge**: Squash and merge to keep history clean

---

## Risk Mitigation

### Technical Risks

**Risk 1: SVAR Library Licensing Cost**
- **Mitigation**: Use free alternatives (ag-grid-community, frappe-gantt)
- **Impact**: Medium (may need to adjust UI slightly)
- **Decision**: Evaluate free options first, purchase SVAR only if necessary

**Risk 2: Web Push Browser Compatibility**
- **Mitigation**: Graceful degradation to in-app notifications only
- **Impact**: Low (most modern browsers support)
- **Decision**: Implement feature detection and show appropriate UI

**Risk 3: Large Bundle Size with SVAR/Recharts**
- **Mitigation**: Lazy load heavy components, code splitting
- **Impact**: Medium (may affect LCP)
- **Decision**: Monitor bundle size in CI, fail if >350KB

### Schedule Risks

**Risk 1: Backend Contract Gaps**
- **Mitigation**: File contract requests early, provide detailed specs
- **Impact**: Medium (may block frontend work)
- **Decision**: FE can mock responses and implement UI ahead of time

**Risk 2: Resource Availability**
- **Mitigation**: Prioritize P0 tasks, defer P2 to later sprints
- **Impact**: High (team may be pulled to other projects)
- **Decision**: Get commitment for dedicated frontend resources for Wave-2/3

---

## Success Metrics

### Quality Metrics
- **Test Coverage**: >70% (branches, functions, lines, statements)
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >90
- **Bundle Size**: <300KB gzipped
- **Core Web Vitals**: LCP <2.5s, CLS <0.1, FID <100ms

### Delivery Metrics
- **PR Cycle Time**: <2 days (from open to merge)
- **Bug Escape Rate**: <5% (bugs found in production vs staging)
- **Feature Completion Rate**: 100% of planned features by Wave-5 end

### User Metrics (Post-Launch)
- **Time to Interactive**: <3.5s on 3G
- **Error Rate**: <1% of sessions
- **Accessibility Usage**: Support for keyboard/screen reader users
- **Language Distribution**: Track en vs id usage

---

## Documentation Index

All specifications are located in `/docs/frontend/`:

1. **SHELL.md** — App shell, navigation, layout
2. **AUTH.md** — Authentication, session, RBAC
3. **CHAT.md** — Messaging, threads, reactions
4. **COMPOSE.md** — Mail, HTML sanitization, folders
5. **PROJECTS.md** — Board, tasks, drag-drop
6. **FILES.md** — Presigned upload, file browser
7. **SEARCH.md** — Global search, filters, ACL
8. **DIRECTORY.md** — Org tree (existing)
9. **NOTIFICATIONS.md** — Notification center (existing)
10. **FILE_PREVIEW.md** — ✨ NEW: File preview & attachments UI
11. **DIRECTORY_ADMIN.md** — ✨ NEW: Drag-move, audit, bulk import
12. **NOTIFICATION_CENTER.md** — ✨ NEW: Detailed notification spec
13. **PROJECTS_ADVANCED.md** — ✨ NEW: Grid, Gantt, Charts
14. **I18N_A11Y_PERFORMANCE.md** — ✨ NEW: i18n, a11y, perf
15. **DESIGN_SYSTEM.md** — ✨ NEW: Storybook, component library
16. **TESTING_CI.md** — ✨ NEW: Testing strategy, CI/CD

---

## Contact & Ownership

### Stakeholders
- **Product Owner**: [Name]
- **Tech Lead (Frontend)**: [Name]
- **Tech Lead (Backend)**: [Name]
- **QA Lead**: [Name]
- **DevOps Lead**: [Name]

### Communication Channels
- **Daily standup**: 9:00 AM (async via Slack)
- **Weekly demo**: Friday 3:00 PM
- **Sprint planning**: Every 2 weeks
- **Retrospective**: End of each Wave

### Escalation Path
1. **Blocker**: Tag frontend lead in PR/issue
2. **Backend contract gap**: Create issue with `[FE→BE]` prefix
3. **Urgent**: Ping in #epop-urgent Slack channel

---

## Conclusion

Roadmap ini menyediakan jalur yang jelas dari status saat ini (Wave-1 complete, Wave-2 mostly done) menuju produksi-ready dengan semua fitur, accessibility, dan quality assurance. Dengan spesifikasi terperinci yang telah dibuat, tim frontend dapat segera memulai implementasi Wave-2 blockers (file preview, notifications) sambil mempersiapkan Wave-3 advanced features.

**Estimated Total Timeline**: 16 weeks (4 months)  
**Total Tasks**: 40+ tasks across 5 waves  
**Documentation**: 16 comprehensive specification documents

**Next Action**: Review dan approve roadmap ini, lalu assign FE-11b dan FE-18a sebagai sprint pertama.

---

**Prepared by**: Principal Product Designer + Staff Frontend Architect  
**Date**: 5 November 2025  
**Version**: 1.0
