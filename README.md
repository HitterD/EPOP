# EPOP - Enterprise Collaboration Platform

A Microsoft Teams-style collaboration platform built with Next.js 14, featuring real-time chat, project management, file sharing, and more.

## Current Status

- MVP production-ready frontend as of November 6, 2025.
- All FE tasks FE-1 → FE-19 implemented (Auth, Chat, Projects, Files, Search, Notifications, Directory).
- Real-time infra, idempotency, ETag/SWR, tracing, PWA, accessibility, and i18n complete.
- See `READY_FOR_DEPLOYMENT.md`, `FINAL_IMPLEMENTATION_SUMMARY.md`, `STATUS_ALL_TASKS_COMPLETE.md`.

## Executive Summary

- **Production-ready frontend (MVP)** with major modules wired and polished UX.
- **Infra & quality**: httpOnly auth, idempotent mutations, ETag/SWR caching, X-Request-Id tracing, PWA SW, WCAG 2.1 AA, i18n (en, id).
- **Features implemented**: Chat (optimistic, reactions, threads), Projects (Kanban DnD + real-time), Files (presigned upload + preview), Search (Cmd/Ctrl+K, filters, highlighting), Notifications (center + preferences + Web Push), Directory (drag-tree, bulk import, audit).
- **Testing & tooling**: Playwright E2E, Jest/RTL, visual tests, Lighthouse CI, bundle analyzer; see `TESTING_GUIDE.md`.
- **Deployment-ready**: Scripts and envs in README; details in `READY_FOR_DEPLOYMENT.md` and `PRODUCTION_READINESS.md`.
- **Backend**: API contracts defined; mock data used where needed. See “Backend Integration & API Contracts (Summary)” below.

## Screenshots

### Chat

![Chat](./public/screenshots/chat.gif)

### Projects

![Projects](./public/screenshots/projects.gif)

_Store assets in `public/screenshots/` (supports .gif/.png/.jpg)._

## Features

- **Real-time Chat** - Optimistic UI, threads, reactions, read receipts, link preview
- **Projects & Planner** - Kanban drag-and-drop, real-time sync, priority and progress
- **Files Management** - Drag-drop presigned uploads, progress, preview modal, grid/list
- **Global Search** - Cmd/Ctrl+K palette, tabs, filters, text highlighting
- **Notifications** - Bell + center, preferences, Do Not Disturb, Web Push
- **Directory Admin** - Drag-drop org tree, bulk import, audit trail
- **Compose/Mail** - Mail-style compose and folder operations; send-as-mail from chat
- **PWA Support** - Offline-ready with service worker
- **Presence & Status** - Real-time user presence with badges
- **Accessibility & i18n** - WCAG 2.1 AA, next-intl (en, id)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.IO
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Calendar**: React Big Calendar
- **Grid/Gantt**: SVAR DataGrid & Gantt (planned)
- **Rich Text**: TipTap
- **Testing**: Playwright + React Testing Library
- **Storybook**: Component documentation

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EPop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and configure:
   - `JWT_SECRET` - Secret key for JWT tokens
   - `NEXT_PUBLIC_ENABLE_REGISTRATION` - Enable/disable user registration

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

For development/testing:
- **Email**: `admin@epop.com`
- **Password**: `password123`

## Project Structure

```
EPop/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (shell)/             # Main app shell
│   │   ├── dashboard/       # Dashboard
│   │   ├── chat/            # Chat feature
│   │   ├── mail/            # Mail/Compose feature
│   │   ├── projects/        # Projects & Planner
│   │   ├── files/           # File management
│   │   └── directory/       # Org directory (admin)
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── chats/           # Chat endpoints
│   │   ├── mail/            # Mail endpoints
│   │   ├── projects/        # Project endpoints
│   │   └── files/           # File endpoints
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── shell/               # App shell components
│   ├── ui/                  # shadcn/ui components
│   └── providers/           # Context providers
├── features/                # Feature modules
│   ├── chat/                # Chat feature
│   ├── compose/             # Compose/Mail feature
│   ├── projects/            # Projects feature
│   ├── files/               # Files feature
│   ├── directory/           # Directory feature
│   └── notifications/       # Notifications feature
├── lib/                     # Utilities and libraries
│   ├── api/                 # API client and hooks
│   ├── stores/              # Zustand stores
│   ├── socket/              # Socket.IO client
│   ├── db/                  # Mock database
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # Constants
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── docs/                    # Documentation
├── e2e/                     # Playwright E2E tests
├── server.js                # Custom server with Socket.IO
└── package.json             # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server with Socket.IO
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:visual` - Visual regression tests (Playwright visual)
- `npm run test:visual:update` - Update visual snapshots
- `npm run test:visual:ui` - Visual tests UI mode
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook
- `npm run analyze` - Analyze production bundle
- `npm run ci:lighthouse` - Run Lighthouse CI

## Architecture

### Authentication Flow

1. User submits credentials via login form
2. API validates credentials and generates JWT tokens
3. Tokens stored in httpOnly cookies
4. Middleware validates tokens on protected routes
5. Socket.IO connection authenticated with JWT

### Real-time Communication

- Socket.IO server runs alongside Next.js
- Clients join rooms per chat/project
- Events broadcast to room members
- Optimistic UI updates with server reconciliation

### State Management

- **Zustand** for global state (auth, chat, projects, UI)
- **TanStack Query** for server state and caching
- **Immer** middleware for immutable updates

### File Upload Flow (Presigned MinIO/S3)

1. Client requests pre-signed upload URL
2. Client uploads directly to S3-compatible storage (e.g., MinIO)
3. Client confirms upload with file metadata
4. File appears in Files area with context

## Features Documentation

Detailed documentation for each feature:

- [Shell Architecture](docs/frontend/SHELL.md)
- [Auth Feature](docs/frontend/AUTH.md)
- [Chat Feature](docs/frontend/CHAT.md)
- [Compose/Mail Feature](docs/frontend/COMPOSE.md)
- [Projects & Planner](docs/frontend/PROJECTS.md)
- [File Management](docs/frontend/FILES.md)
- [Global Search](docs/frontend/SEARCH.md)
- [Directory Management](docs/frontend/DIRECTORY.md)
- [Notifications](docs/frontend/NOTIFICATIONS.md)

## Project Docs

- [Component Index](COMPONENT_INDEX.md)
- [Frontend Implementation Summary](FRONTEND_IMPLEMENTATION_SUMMARY.md)
- [Ready for Deployment](READY_FOR_DEPLOYMENT.md)
- [Production Readiness](PRODUCTION_READINESS.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Backend Docs](docs/backend/)

## Backend Integration & API Contracts (Summary)

- **Status**: Backend integration pending in some areas; API contracts are defined. Frontend uses mock data where needed and is ready for live endpoints.
- **Required Endpoints**:
  - Auth: `/auth/refresh`, `/auth/sessions`, `/auth/sessions/:id`
  - Files: `/files/presign`, `/files/:id/confirm`
  - Directory: `/directory/import/dry-run`, `/directory/import/commit`, `/directory/audit`
  - Search: `/search`
  - Notifications: `/notifications/preferences`, `/notifications/web-push/subscribe`, `/notifications/web-push/unsubscribe`
  - Errors: `/errors/report`
- **Real-time Events**: Socket.IO events follow `domain:entity_action` (e.g., `chat:message_created`, `project:task_moved`).
- **Headers & Caching**: `X-Request-Id` tracing, `Idempotency-Key` on mutations, `ETag`/`If-None-Match` for GET caching.
- **More Details**: See feature docs in `docs/frontend/` and backend guides in `docs/backend/`.

## Keyboard Shortcuts

- `Ctrl+K` - Open global search
- `Ctrl+N` - New chat
- `Ctrl+1` - Navigate to Activity/Dashboard
- `Ctrl+2` - Navigate to Chat
- `Ctrl+3` - Navigate to Projects
- `Ctrl+4` - Navigate to Files
- `Ctrl+5` - Navigate to Directory (admin)
- `Ctrl+6` - Navigate to Admin (admin)

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

See `TESTING_GUIDE.md` for strategy, setup, and examples.

### Test Coverage
- Authentication flow
- Real-time chat messaging
- Task drag-and-drop
- File upload
- Search functionality

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Required for production:
- `JWT_SECRET` - Strong secret key
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NEXT_PUBLIC_APP_URL` - Production URL
- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_WS_URL` - Socket base URL
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Web Push public key
- Database connection (PostgreSQL)
- Object storage credentials (MinIO/S3)
- SMTP settings (for email notifications)

## Future Enhancements

- [ ] PostgreSQL/Prisma integration
- [ ] MinIO/S3 file storage (presigned flows)
- [ ] ZincSearch/OpenSearch full-text search
- [ ] SVAR DataGrid and Gantt views
- [ ] E2E and unit test coverage
- [ ] Calendar integration
- [ ] Video/audio calls
- [ ] Analytics dashboard
- [ ] Monitoring, alerting, CI/CD

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email bagastyo6@gmail.com or open an issue in the repository.

---

Built with ❤️ by the EPOP Team
