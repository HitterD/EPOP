# App Shell Architecture

The EPOP application shell provides the core navigation and layout structure, mirroring Microsoft Teams' design patterns.

## Components

### LeftRail (`components/shell/left-rail.tsx`)

**Purpose**: Primary navigation sidebar

**Features**:
- Collapsible/expandable (48px collapsed, 240px expanded)
- Navigation items with icons and badges
- Active route highlighting
- Admin-only items (Directory, Admin)
- Keyboard shortcut hints
- Unread indicators

**Navigation Items**:
1. **Activity** (`/dashboard`) - Dashboard overview
2. **Chat** (`/chat`) - Real-time messaging
3. **Projects** (`/projects`) - Project management
4. **Files** (`/files`) - File browser
5. **Directory** (`/directory`) - Org tree (admin only)
6. **Admin** (`/admin`) - Admin settings (admin only)

**State Management**:
- `useUIStore` - Sidebar collapsed state
- `useAuthStore` - User role and permissions for RBAC

**RBAC Integration** (FE-3):
- Uses `<IfCan>` wrapper to conditionally show/hide menu items
- Checks `admin:access` permission for admin-only routes
- Dynamically adjusts UI based on user permissions

### TopHeader (`components/shell/top-header.tsx`)

**Purpose**: Global header with navigation and user controls

**Features**:
- Back/forward navigation buttons
- Global search bar (Ctrl+K)
- Notifications bell with badge
- User profile dropdown with:
  - User info (name, email, title)
  - Settings link
  - Theme toggle
  - Logout

**Search**:
- Redirects to `/search?q=<query>`
- Placeholder: "Search messages, projects, files... (Ctrl+K)"

### ShellLayout (`app/(shell)/layout.tsx`)

**Purpose**: Main layout wrapper for authenticated pages

**Features**:
- Authentication check
- Socket.IO connection initialization
- Loading state
- Flex layout: LeftRail + (TopHeader + Content)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  LeftRail  │  TopHeader             │
│            ├────────────────────────┤
│            │                        │
│            │  Main Content Area     │
│            │                        │
│            │                        │
└─────────────────────────────────────┘
```

## Styling

### Theme Colors
- **Primary**: Teams Purple (#6264A7)
- **Primary Dark**: #464775
- **Presence Colors**:
  - Available: #92C353
  - Busy: #E74856
  - Away: #F7630C
  - Offline: #8A8886

### Spacing
- Rail width: 48px (collapsed), 240px (expanded)
- Header height: 56px (14 * 4px)
- Border: 1px solid border color

## Keyboard Shortcuts

Implemented in `lib/hooks/use-keyboard-shortcuts.ts`:
- `Ctrl+1-6` - Navigate to respective sections
- `Ctrl+K` - Open search
- `Ctrl+N` - New chat

## Responsive Behavior

- **Desktop** (>1024px): Full layout with expanded rail
- **Tablet** (768-1024px): Collapsed rail by default
- **Mobile** (<768px): Overlay rail, hidden by default

## Accessibility (FE-19)

### Core Features
- Semantic HTML (`<nav>`, `<header>`, `<main>`)
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Arrow keys)
- Focus management and trap for modals
- Screen reader announcements for dynamic content
- Skip-to-content link (visible on focus)

### Keyboard Shortcuts
- Registered via `KeyboardShortcuts` utility
- Visual hints displayed on navigation items
- Announced to screen readers on activation

### Internationalization
- Supports English (en) and Bahasa Indonesia (id)
- Uses `next-intl` for translations
- Language switcher in user profile dropdown
- RTL support ready

### WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Focus indicators with 2px outline
- Touch targets ≥ 44x44px
- Reduced motion support via `prefers-reduced-motion`

## Usage Example

```tsx
// app/(shell)/some-page/page.tsx
export default function SomePage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Page content */}
    </div>
  )
}
```

The shell layout is automatically applied to all routes under `app/(shell)/`.
