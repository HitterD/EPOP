# ✅ Manual Testing Checklist - EPOP Frontend

**Comprehensive testing guide untuk semua implemented components**

---

## 🎯 Testing Strategy

### Priorities
1. **P0 (Critical)**: Core functionality yang harus work
2. **P1 (Important)**: User experience features
3. **P2 (Nice-to-have)**: Edge cases dan polish

### Test Environments
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: iOS Safari, Android Chrome
- **Dark Mode**: Test semua features dalam dark mode
- **Network**: Test dengan slow 3G untuk loading states

---

## 1. Chat Module Testing

### A. Optimistic UI (P0)

**Test Steps**:
1. Open chat page
2. Type message "Test message 1"
3. Click send

**Expected**:
- [x] Message appears instantly in UI
- [x] Shows "Sending..." status atau spinner
- [x] After API response, status changes to "✓ Sent"
- [x] Message persists after page reload

**Edge Cases**:
- [ ] Test with slow network (throttle to Slow 3G)
- [ ] Test with network offline (should show error + retry)
- [ ] Send multiple messages quickly (queue should work)

### B. Read Receipts (P0)

**Test Steps**:
1. Send message from User A
2. Open chat as User B
3. Scroll to view message

**Expected**:
- [x] Message shows "✓" (sent) initially
- [x] After User B reads, shows "✓✓" (read)
- [x] Read count updates (e.g., "Read by 2")

**Edge Cases**:
- [ ] Multiple users read at same time
- [ ] User goes offline before read receipt sent

### C. Reactions (P1)

**Test Steps**:
1. Hover over message
2. Click reaction button
3. Select emoji (e.g., 👍)

**Expected**:
- [x] Reaction appears instantly
- [x] Counter increments
- [x] Clicking same emoji removes it
- [x] Other users see reaction in real-time

**Edge Cases**:
- [ ] Multiple reactions on same message
- [ ] Reactions from multiple users aggregate correctly

### D. Typing Indicator (P1)

**Test Steps**:
1. User A starts typing in chat
2. User B should see typing indicator

**Expected**:
- [x] "User A is typing..." appears within 1s
- [x] Shows animated dots
- [x] Disappears after 3s of inactivity
- [x] Multiple users typing shows "User A, User B are typing..."

### E. Scroll Behavior (P1)

**Test Steps**:
1. Open chat with many messages
2. Scroll to top
3. New message arrives

**Expected**:
- [x] Does NOT auto-scroll (user is reading old messages)
- [x] Shows floating "Scroll to bottom" button
- [x] Button shows unread count badge
- [x] Clicking button scrolls to bottom smoothly

**Test at bottom**:
1. Scroll to bottom
2. New message arrives

**Expected**:
- [x] Auto-scrolls to show new message
- [x] No "Scroll to bottom" button

### F. Attachments (P0)

**Test Steps**:
1. Click attachment button
2. Select image file
3. Send message with attachment

**Expected**:
- [x] Image appears as thumbnail in message
- [x] Clicking thumbnail opens preview modal
- [x] Preview modal shows full-size image
- [x] Zoom controls work (25%, 50%, 100%, 200%)
- [x] Can navigate between multiple images (prev/next)

**Edge Cases**:
- [ ] Multiple images (should show grid, max 4)
- [ ] Non-image files (PDF, video) show icons
- [ ] Large files show upload progress

---

## 2. Projects Board Testing

### A. Drag-and-Drop (P0)

**Test Steps**:
1. Open project board
2. Drag task from "To Do" column
3. Drop in "In Progress" column

**Expected**:
- [x] Task moves immediately (optimistic)
- [x] Ghost card shows during drag
- [x] Drop zone highlights on hover
- [x] API call completes successfully
- [x] Other users see update in real-time (<1s)

**Edge Cases**:
- [ ] Drag to same column (no-op)
- [ ] Drag fails (should rollback with toast error)
- [ ] Multiple users drag same task (last write wins)

### B. Task Card Display (P1)

**Test Steps**:
1. View task card

**Expected**:
- [x] Priority badge shows (low/medium/high/critical)
- [x] Priority colors: gray/blue/yellow/red
- [x] Assignee avatars show (max 3, then "+N")
- [x] Labels/tags display
- [x] Due date shows (with overdue indicator if past)
- [x] Progress bar shows completion %
- [x] Attachment count badge
- [x] Comment count badge

### C. Board Columns (P1)

**Test Steps**:
1. View board with multiple columns

**Expected**:
- [x] Each column has header with name
- [x] Task count badge shows
- [x] Progress bar shows % of tasks done in column
- [x] Color-coded headers (gray/blue/green/purple)
- [x] Empty columns show "No tasks" with "Add task" CTA

### D. Real-time Sync (P0)

**Test Steps**:
1. Open board in two browsers (User A, User B)
2. User A moves task
3. Watch User B's screen

**Expected**:
- [x] Task moves on User B's screen within 1s
- [x] No page reload required
- [x] Smooth animation

**Edge Cases**:
- [ ] Concurrent edits (should not cause conflicts)
- [ ] Network disconnection (should queue updates)

---

## 3. Files Management Testing

### A. File Upload (P0)

**Test Steps**:
1. Drag file into upload zone
2. Watch progress

**Expected**:
- [x] File appears in queue immediately
- [x] Progress bar animates 0% → 100%
- [x] Status changes: pending → uploading → scanning → ready
- [x] Success message appears
- [x] File appears in files list

**Edge Cases**:
- [ ] Multiple files upload (should show all in queue)
- [ ] Large file (10MB) shows progress smoothly
- [ ] Failed upload shows error + retry button
- [ ] Infected file shows warning badge

### B. File Preview (P0)

**Test Steps**:
1. Click on file thumbnail
2. Preview modal opens

**Expected Images**:
- [x] Image displays at fit-width
- [x] Zoom buttons work (-, 100%, +)
- [x] Zoom range: 25% - 200%
- [x] Can pan image when zoomed

**Expected PDF**:
- [x] PDF displays (if react-pdf installed)
- [x] Page navigation works
- [x] Can scroll through pages

**Expected Video/Audio**:
- [x] HTML5 player shows
- [x] Play/pause works
- [x] Volume control works

**Edge Cases**:
- [ ] Unsupported file type shows download button
- [ ] Large files load progressively

### C. File Navigation (P1)

**Test Steps**:
1. Open preview with multiple files
2. Click "Next" arrow

**Expected**:
- [x] Switches to next file
- [x] Updates preview immediately
- [x] URL updates (if using routing)
- [x] "Previous" arrow becomes enabled
- [x] At last file, "Next" is disabled

---

## 4. Search Testing

### A. Global Search (P0)

**Test Steps**:
1. Press Cmd/Ctrl+K
2. Search dialog opens
3. Type "test query"

**Expected**:
- [x] Dialog opens immediately
- [x] Focus on search input
- [x] After 300ms, API call fires (debounced)
- [x] Results appear within 500ms
- [x] 5 tabs show: All, Messages, Projects, Users, Files
- [x] Result counts show per tab

**Edge Cases**:
- [ ] Empty query (no results, shows tips)
- [ ] No results found (shows empty state)
- [ ] API error (shows error message + retry)

### B. Text Highlighting (P1)

**Test Steps**:
1. Search for "meeting"
2. View results

**Expected**:
- [x] "meeting" is highlighted in results
- [x] Highlight color: yellow background
- [x] Case-insensitive matching
- [x] Multiple matches in same result all highlighted

### C. Filters (P1)

**Test Steps**:
1. Open Files tab
2. Click "Add filter" → Select "Date range"
3. Choose last 7 days

**Expected**:
- [x] Filter chip appears
- [x] Results update immediately
- [x] Only files from last 7 days show
- [x] Can remove filter by clicking X on chip

**Edge Cases**:
- [ ] Multiple filters (should combine with AND logic)
- [ ] Clear all filters button works

### D. Keyboard Navigation (P1)

**Test Steps**:
1. Open search
2. Type query
3. Press ↓ arrow key

**Expected**:
- [x] First result highlights
- [x] ↑/↓ navigate through results
- [x] Enter opens selected result
- [x] ESC closes dialog
- [x] Tab switches between tabs

---

## 5. Notifications Testing

### A. Notification Bell (P0)

**Test Steps**:
1. View top header
2. Send notification to current user

**Expected**:
- [x] Bell icon shows
- [x] Unread badge appears with count
- [x] Badge updates in real-time
- [x] If count > 9, shows "9+"
- [x] Clicking bell opens popover

### B. Notification List (P0)

**Test Steps**:
1. Click bell
2. View notifications

**Expected**:
- [x] Popover opens below bell
- [x] Shows last 10 notifications
- [x] Unread notifications have blue dot
- [x] Scrolling loads more (infinite scroll)
- [x] "Mark all as read" button shows if unread exist
- [x] Clicking notification navigates to action URL
- [x] Clicked notification marks as read

**Edge Cases**:
- [ ] No notifications (shows empty state)
- [ ] Very long notification text (truncates with ellipsis)

### C. Notification Types (P1)

**Test Steps**:
1. View notifications of different types

**Expected Icons**:
- [x] chat_message: Blue 💬
- [x] chat_mention: Orange @
- [x] task_assigned: Purple ✓
- [x] project_update: Green 📁
- [x] system_announcement: Red 🔔
- [x] mail_received: Indigo 📧

### D. Notification Settings (P1)

**Test Steps**:
1. Go to Settings → Notifications
2. Toggle "Sound" off
3. Save

**Expected**:
- [x] Setting saves immediately (auto-save)
- [x] Success toast appears
- [x] Setting persists after reload
- [x] Do Not Disturb schedule works
- [x] During DND hours, no notifications sound/display

### E. Web Push (P0)

**Test Steps**:
1. Go to Settings → Web Push
2. Click "Subscribe"
3. Allow permission

**Expected**:
- [x] Browser asks for permission
- [x] After allow, status shows "Subscribed"
- [x] "Test notification" button appears
- [x] Clicking test sends notification
- [x] Notification appears even when tab closed

**Edge Cases**:
- [ ] Permission denied (shows instructions to enable)
- [ ] Browser not supported (shows warning)
- [ ] Unsubscribe works correctly

---

## 6. Directory Admin Testing

### A. Drag-and-Drop Users (P0)

**Test Steps**:
1. Open directory page
2. Drag user from Unit A
3. Drop on Unit B

**Expected**:
- [x] User moves immediately (optimistic)
- [x] Drop zone highlights on hover
- [x] Success toast appears
- [x] User persists in new unit after reload

**Edge Cases**:
- [ ] Drop on same unit (no-op)
- [ ] Drop fails (reverts + error toast)
- [ ] User without permission (shows error)

### B. Org Tree Display (P1)

**Test Steps**:
1. View org tree

**Expected**:
- [x] Units expand/collapse on click
- [x] Division icon: Building
- [x] Team icon: Users
- [x] Member count shows per unit
- [x] User avatars show
- [x] Presence indicators (green/yellow/red/gray)

---

## 7. Responsive Design Testing

### Desktop (1920x1080)
- [ ] All components fit within viewport
- [ ] No horizontal scroll
- [ ] Sidebars/panels have proper widths
- [ ] Font sizes readable

### Tablet (768x1024)
- [ ] Layout adapts (e.g., sidebar collapses)
- [ ] Touch targets >= 44x44px
- [ ] Modals fit within viewport
- [ ] Forms are usable

### Mobile (375x667)
- [ ] Single column layout
- [ ] Bottom navigation (if applicable)
- [ ] Modals are full-screen or bottom-sheet
- [ ] Text inputs zoom-friendly (font-size >= 16px)

---

## 8. Dark Mode Testing

### Test All Components:
- [ ] Chat messages readable
- [ ] Board cards have proper contrast
- [ ] Search results visible
- [ ] Notifications list readable
- [ ] Modals have dark background
- [ ] Buttons have proper hover states
- [ ] Form inputs styled correctly

### Contrast Ratios:
- [ ] Text: >= 4.5:1 (WCAG AA)
- [ ] Large text: >= 3:1
- [ ] Interactive elements: >= 3:1

---

## 9. Accessibility Testing

### Keyboard Navigation:
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Modals trap focus
- [ ] ESC closes dialogs/modals
- [ ] Enter activates buttons

### Screen Reader:
- [ ] Images have alt text
- [ ] Buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Loading states announced

### ARIA:
- [ ] aria-live regions for dynamic content
- [ ] aria-expanded for collapsibles
- [ ] aria-selected for tabs
- [ ] role attributes correct

---

## 10. Performance Testing

### Load Times:
- [ ] Initial page load < 3s
- [ ] Component hydration < 1s
- [ ] Search results < 500ms
- [ ] Real-time updates < 1s

### Bundle Size:
- [ ] Total JS < 300KB gzipped
- [ ] Main bundle < 200KB
- [ ] Lazy-loaded chunks < 50KB each

### Lighthouse Scores:
- [ ] Performance >= 90
- [ ] Accessibility >= 95
- [ ] Best Practices >= 90
- [ ] SEO >= 90

---

## 11. Error Handling Testing

### Network Errors:
- [ ] Offline mode shows banner
- [ ] Failed API calls show error toast
- [ ] Retry buttons work
- [ ] Queue updates when back online

### Validation Errors:
- [ ] Form validation errors show inline
- [ ] Error messages are clear
- [ ] Can correct error and resubmit

### 404 Pages:
- [ ] Show friendly error page
- [ ] "Go home" button works
- [ ] Logged in /app routes vs public routes

---

## 12. Integration Testing

### Cross-Feature:
- [ ] Send file in chat (Chat + Files)
- [ ] Search for task (Search + Projects)
- [ ] Mention user in chat (Chat + Directory)
- [ ] Upload file, attach to task (Files + Projects)

### Real-time Multi-User:
- [ ] Two users chat simultaneously
- [ ] Two users edit project board
- [ ] User A sends, User B receives notification
- [ ] Presence updates across clients

---

## 📋 Testing Report Template

```markdown
## Test Session Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Browser, OS, Network]

### Passed Tests
- [x] Chat optimistic UI
- [x] Projects drag-drop
- [x] File upload

### Failed Tests
- [ ] Search highlighting (not working on Safari)
- [ ] Dark mode contrast (fails WCAG)

### Bugs Found
1. **Search**: Typing too fast causes multiple API calls
   - **Severity**: Medium
   - **Steps**: Type very quickly in search
   - **Expected**: Debounced to 300ms
   - **Actual**: Fires multiple times

### Recommendations
- Increase debounce to 500ms
- Add request cancellation

**Overall Status**: ✅ PASS / ⚠️ PASS WITH ISSUES / ❌ FAIL
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All P0 tests pass
- [ ] All P1 tests pass
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Error handling robust
- [ ] Loading states present
- [ ] Empty states helpful

---

**Last Updated**: 5 November 2025  
**Status**: Ready for Testing
