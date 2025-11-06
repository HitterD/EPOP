# EPOP Quick Start Guide

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

## Default Login

- Email: `admin@epop.com`
- Password: `password123`

## What's Included

✅ **Complete Foundation**
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Socket.IO real-time server
- Authentication system
- App shell (left rail + header)
- Dashboard with cards
- Mock database
- Full documentation

## Next Steps

Implement these features:
1. Chat (real-time messaging)
2. Projects (Kanban + Gantt)
3. Files (upload/preview)
4. Search (global)
5. Notifications (push)

See `IMPLEMENTATION_STATUS.md` for details.

## Key Files

- `server.js` - Socket.IO server
- `app/(shell)/layout.tsx` - Main app shell
- `lib/stores/` - Zustand state
- `lib/api/` - API client
- `lib/db/mock-data.ts` - Mock database
- `docs/frontend/` - Feature docs

## Commands

```bash
npm run dev          # Development
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

## Architecture

- **Auth**: httpOnly cookies + JWT
- **State**: Zustand + TanStack Query
- **Real-time**: Socket.IO
- **UI**: shadcn/ui + Tailwind
- **Forms**: React Hook Form + Zod

Ready to build! 🚀
