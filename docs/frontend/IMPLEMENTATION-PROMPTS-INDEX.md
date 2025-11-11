# Implementation Prompts Index — Code Generation Guide

**Purpose:** Ready-to-use prompts for Claude Sonnet 4.5 to generate React components, Storybook stories, and accessibility tests based on UI specifications.

**Prerequisites:**
- All 7 UI specifications completed (UI-SPEC-*.md)
- Next.js 14 project with Tailwind + shadcn/ui configured
- Storybook v7+ installed
- Jest + @testing-library/react configured

---

## Prompt Files

### 1. [PROMPT-IMPLEMENT-CHAT-PRESENCE.md](./PROMPT-IMPLEMENT-CHAT-PRESENCE.md)
**Module:** Real-time Chat & Presence  
**Components:** 8 components (ChatList, ThreadView, MessageComposer, etc.)  
**Base Spec:** [UI-SPEC-CHAT-PRESENCE.md](./UI-SPEC-CHAT-PRESENCE.md)

**What Gets Generated:**
- `components/chat/` — 8 React components with TypeScript
- `stories/chat/` — Storybook stories for all states
- `__tests__/chat/` — Accessibility + unit tests

**Key Features:**
- WebSocket state management (connected/disconnected)
- Optimistic updates with loading states
- Typing indicators & presence badges
- Message reactions & read receipts
- Keyboard navigation (↑/↓/R/E)

**Estimated Output:** ~2,500 lines of code

---

### 2. [PROMPT-IMPLEMENT-MAIL-COMPOSE.md](./PROMPT-IMPLEMENT-MAIL-COMPOSE.md)
**Module:** Mail Compose & Folders  
**Components:** 8 components (MailList, MailComposer, etc.)  
**Base Spec:** [UI-SPEC-MAIL-COMPOSE.md](./UI-SPEC-MAIL-COMPOSE.md)

**What Gets Generated:**
- `components/mail/` — Mail UI components
- `stories/mail/` — Stories including rich text editor states
- `__tests__/mail/` — Form validation & keyboard shortcut tests

**Key Features:**
- Rich text editor (Tiptap/Lexical integration)
- Vim-style keyboard shortcuts (J/K/X/R/A)
- Recipient autocomplete with chips
- Draft auto-save (3s debounce)
- Attachment upload with progress

**Estimated Output:** ~2,200 lines of code

---

### 3. [PROMPT-IMPLEMENT-PROJECTS-KANBAN-GANTT.md](./PROMPT-IMPLEMENT-PROJECTS-KANBAN-GANTT.md)
**Module:** Projects (Kanban/Gantt/Table)  
**Components:** 10+ components across 3 views  
**Base Spec:** [UI-SPEC-PROJECTS-KANBAN-GANTT.md](./UI-SPEC-PROJECTS-KANBAN-GANTT.md)

**What Gets Generated:**
- `components/projects/` — Kanban, Gantt, Table components
- `stories/projects/` — Stories for all 3 views + states
- `__tests__/projects/` — DnD, virtualization, a11y tests

**Key Features:**
- **Kanban:** Drag-drop with @hello-pangea/dnd, WIP limits
- **Gantt:** Custom CSS Grid implementation (no external lib), SVG dependencies
- **Table:** TanStack Table + Virtual for 1k+ tasks
- Virtualization for performance
- Keyboard fallback for drag-drop

**Estimated Output:** ~3,500 lines of code

---

### 4. [PROMPT-IMPLEMENT-REMAINING-MODULES.md](./PROMPT-IMPLEMENT-REMAINING-MODULES.md)
**Modules:** Files, Search, Directory, Notifications & PWA  
**Components:** 25+ components across 4 modules  
**Base Specs:** 
- [UI-SPEC-FILES-UPLOAD-PREVIEW.md](./UI-SPEC-FILES-UPLOAD-PREVIEW.md)
- [UI-SPEC-GLOBAL-SEARCH.md](./UI-SPEC-GLOBAL-SEARCH.md)
- [UI-SPEC-DIRECTORY-ADMIN.md](./UI-SPEC-DIRECTORY-ADMIN.md)
- [UI-SPEC-NOTIFICATIONS-PWA.md](./UI-SPEC-NOTIFICATIONS-PWA.md)

**What Gets Generated:**
- `components/files/` — Upload, preview, folder tree
- `components/search/` — Command palette, filters
- `components/directory/` — Org tree, user CRUD, admin
- `components/notifications/` — Toast, banner, PWA prompts
- `public/sw.js` — Service worker for PWA
- `public/manifest.json` — PWA manifest

**Key Features:**
- File upload with progress & preview (8+ file types)
- Global search with ⌘K palette & highlighting
- Organization tree with admin CRUD
- Notification center with toast queue
- PWA install prompts (platform-specific)
- Offline mode with service worker

**Estimated Output:** ~4,000 lines of code

---

## Usage Instructions

### Step 1: Prepare Your Project

Ensure these dependencies are installed:

```bash
# Core dependencies (should already exist)
pnpm add next@14 react react-dom
pnpm add tailwindcss @tailwindcss/typography
pnpm add lucide-react
pnpm add @radix-ui/react-* # shadcn/ui peer deps

# Additional for specific modules
pnpm add @tanstack/react-table @tanstack/react-virtual
pnpm add @hello-pangea/dnd
pnpm add @tiptap/react @tiptap/starter-kit
pnpm add workbox-webpack-plugin next-pwa

# Dev dependencies
pnpm add -D @storybook/react @storybook/nextjs
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @axe-core/react
```

### Step 2: Copy Prompt to Claude

1. Open the relevant prompt file (e.g., `PROMPT-IMPLEMENT-CHAT-PRESENCE.md`)
2. Copy the **entire content**
3. Paste into Claude Sonnet 4.5 conversation
4. Add: "Please implement all components, stories, and tests as specified."

### Step 3: Review & Integrate Generated Code

Claude will provide:
- Full component files with TypeScript
- Storybook stories with all variants
- Test files with accessibility checks
- Brief implementation summary

**Review Checklist:**
- [ ] TypeScript compiles without errors
- [ ] Components use shadcn/ui primitives
- [ ] Dark/light mode classes present (`dark:`)
- [ ] Keyboard navigation implemented
- [ ] ARIA attributes present
- [ ] Tests reference correct imports

### Step 4: Run Verification

```bash
# Start Storybook to visually verify
pnpm storybook

# Run tests
pnpm test

# Run accessibility audit
pnpm test:a11y

# Type check
pnpm tsc --noEmit
```

### Step 5: Iterate if Needed

If issues found:
- Reference the UI-SPEC-*.md for clarification
- Ask Claude to fix specific issues
- Example: "The MessageComposer keyboard shortcut Cmd+Enter isn't working. Please fix."

---

## Implementation Order Recommendation

### Phase 1: Foundation (Week 1)
**Goal:** Core infrastructure + 1 complete module

1. **Setup base components** — Create shared utilities, hooks, types
2. **Implement Chat module** — Use PROMPT-IMPLEMENT-CHAT-PRESENCE.md
3. **Verify in Storybook** — All stories render, dark/light mode works
4. **Run tests** — Fix any accessibility issues

**Deliverable:** Working chat with all states

---

### Phase 2: Content Management (Week 2-3)
**Goal:** Mail and Files modules

1. **Implement Mail module** — Use PROMPT-IMPLEMENT-MAIL-COMPOSE.md
2. **Configure rich text editor** — Tiptap setup with toolbar
3. **Implement Files module** — Upload, preview, folder tree
4. **Preview integration** — Test all file types render

**Deliverable:** Mail compose + file management working

---

### Phase 3: Advanced Features (Week 4-5)
**Goal:** Projects module (most complex)

1. **Implement Kanban** — Board, lanes, cards, DnD
2. **Implement Table** — TanStack Table setup
3. **Implement Gantt** — Custom CSS Grid implementation
4. **Virtualization** — Add react-virtual for 1k+ tasks

**Deliverable:** All 3 project views functional

---

### Phase 4: Search & Directory (Week 6)
**Goal:** Search and admin features

1. **Implement Search** — Command palette with ⌘K
2. **Implement Directory** — Org tree, user cards
3. **Admin CRUD** — User forms, bulk import
4. **Test search ranking** — Verify relevance algorithm

**Deliverable:** Search + directory + admin panels

---

### Phase 5: PWA & Polish (Week 7)
**Goal:** Notifications and PWA features

1. **Implement Notifications** — Center, toasts, badges
2. **Setup Service Worker** — Caching strategies
3. **PWA manifest** — Icons, theme colors
4. **Offline mode** — Test offline functionality
5. **Push notifications** — Permission flow

**Deliverable:** Full PWA with offline support

---

### Phase 6: Integration & Testing (Week 8)
**Goal:** Connect to real backend + E2E tests

1. **API integration** — Replace mock data with real endpoints
2. **E2E tests** — Playwright scenarios
3. **Performance audit** — Lighthouse CI
4. **Accessibility audit** — axe-core, manual testing
5. **Cross-browser testing** — Chrome, Firefox, Safari

**Deliverable:** Production-ready application

---

## File Structure After Implementation

```
c:\EPop\
├── app/                          # Next.js App Router
│   └── (shell)/
│       ├── chat/                 # Chat pages
│       ├── mail/                 # Mail pages
│       ├── projects/             # Projects pages
│       ├── files/                # Files pages
│       ├── search/               # Search page
│       ├── directory/            # Directory pages
│       └── notifications/        # Notification settings
│
├── components/                   # React components
│   ├── chat/                     # ✅ 8 components
│   ├── mail/                     # ✅ 8 components
│   ├── projects/                 # ✅ 10+ components
│   ├── files/                    # ✅ 6 components
│   ├── search/                   # ✅ 6 components
│   ├── directory/                # ✅ 7 components
│   ├── notifications/            # ✅ 10 components
│   └── ui/                       # shadcn/ui base components
│
├── stories/                      # Storybook stories
│   ├── chat/                     # ✅ 8 .stories.tsx
│   ├── mail/                     # ✅ 8 .stories.tsx
│   ├── projects/                 # ✅ 10 .stories.tsx
│   ├── files/                    # ✅ 6 .stories.tsx
│   ├── search/                   # ✅ 6 .stories.tsx
│   ├── directory/                # ✅ 7 .stories.tsx
│   └── notifications/            # ✅ 10 .stories.tsx
│
├── __tests__/                    # Test files
│   ├── chat/                     # ✅ 8 .test.tsx
│   ├── mail/                     # ✅ 8 .test.tsx
│   ├── projects/                 # ✅ 10 .test.tsx
│   ├── files/                    # ✅ 6 .test.tsx
│   ├── search/                   # ✅ 6 .test.tsx
│   ├── directory/                # ✅ 7 .test.tsx
│   └── notifications/            # ✅ 10 .test.tsx
│
├── lib/                          # Utilities
│   ├── api/                      # API client
│   ├── hooks/                    # Custom hooks
│   └── utils/                    # Helper functions
│
├── public/                       # Static assets
│   ├── sw.js                     # ✅ Service worker
│   ├── manifest.json             # ✅ PWA manifest
│   └── icons/                    # PWA icons
│
└── docs/frontend/                # Documentation
    ├── UI-SPEC-*.md              # ✅ 7 specifications
    └── PROMPT-IMPLEMENT-*.md     # ✅ 4 prompts
```

**Total Components:** 55+ React components  
**Total Stories:** 55+ Storybook stories  
**Total Tests:** 55+ test suites  
**Estimated Total Lines:** ~12,000 lines of production code

---

## Quality Assurance Checklist

### Visual Quality
- [ ] All components render correctly in Storybook
- [ ] Dark mode and light mode both work
- [ ] Responsive on mobile, tablet, desktop
- [ ] Matches designs in UI-SPEC files
- [ ] No visual glitches or layout issues

### Functionality
- [ ] All interactive elements work (buttons, inputs, dropdowns)
- [ ] Forms validate correctly
- [ ] Loading states display appropriately
- [ ] Error states show helpful messages
- [ ] Empty states guide user actions
- [ ] Optimistic updates work smoothly

### Accessibility (WCAG 2.1 AA)
- [ ] All tests pass (100% pass rate)
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces changes (test with NVDA/VoiceOver)
- [ ] Focus indicators visible
- [ ] Color contrast meets 4.5:1 (text) and 3:1 (UI)
- [ ] ARIA roles and labels correct
- [ ] No axe-core violations

### Performance
- [ ] Large lists virtualized (1k+ items)
- [ ] Images lazy loaded
- [ ] Code split by route
- [ ] Lighthouse score >90
- [ ] Time to Interactive <3s
- [ ] No memory leaks

### Code Quality
- [ ] TypeScript with no errors
- [ ] ESLint with no warnings
- [ ] Prettier formatted
- [ ] Components follow React best practices
- [ ] Proper prop types defined
- [ ] Memoization where needed (React.memo, useMemo)

---

## Troubleshooting Common Issues

### Issue: TypeScript errors in generated code
**Solution:** Check import paths, ensure shadcn/ui components installed, verify tsconfig.json paths

### Issue: Storybook not rendering components
**Solution:** Check .storybook/main.ts includes correct glob patterns, restart Storybook dev server

### Issue: Tests failing with "Cannot find module"
**Solution:** Check jest.config.js moduleNameMapper, ensure test files have correct imports

### Issue: Dark mode not working
**Solution:** Verify `dark:` classes present, check Tailwind config has darkMode: 'class'

### Issue: Keyboard shortcuts not working
**Solution:** Check event.preventDefault() called, verify key combinations (Cmd vs Ctrl)

### Issue: Accessibility tests failing
**Solution:** Read specific violation, add missing ARIA attributes, test with screen reader

---

## Getting Help

If you encounter issues during implementation:

1. **Check the UI Spec** — Review the detailed spec for that module
2. **Ask Claude for clarification** — Paste the specific section that's unclear
3. **Test incrementally** — Implement one component at a time, verify in Storybook
4. **Use browser DevTools** — Inspect elements, check console for errors
5. **Run accessibility audit** — Use axe DevTools browser extension

---

## Success Metrics

**Phase 1-2 Complete (Weeks 1-3):**
- ✅ 16 components implemented
- ✅ Chat + Mail + Files modules functional
- ✅ All stories render
- ✅ Basic tests passing

**Phase 3-4 Complete (Weeks 4-6):**
- ✅ 35+ components implemented
- ✅ Projects (Kanban/Gantt/Table) working
- ✅ Search + Directory functional
- ✅ Advanced features complete

**Phase 5-6 Complete (Weeks 7-8):**
- ✅ 55+ components implemented
- ✅ PWA installable
- ✅ Offline mode functional
- ✅ All accessibility tests pass
- ✅ Production-ready codebase

---

**Final Deliverable:** Fully functional, accessible, performant collaboration platform matching all UI specifications, ready for backend integration and deployment.
