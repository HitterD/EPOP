# EPOP Setup Guide

Complete setup instructions for the EPOP Microsoft Teams-style SPA.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** (for version control)
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14 and React 18
- TypeScript and type definitions
- Tailwind CSS and shadcn/ui components
- Zustand for state management
- TanStack Query for data fetching
- Socket.IO for real-time features
- And many more...

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure:

```env
# Required
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Optional (defaults shown)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REGISTRATION=false
```

**Important**: Change the JWT secrets in production!

### 3. Start Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 4. Login

Use the default credentials:
- **Email**: `admin@epop.com`
- **Password**: `password123`

## Project Structure Overview

```
EPop/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register, etc.)
│   ├── (shell)/           # Main app (dashboard, chat, projects, etc.)
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── shell/            # App shell (left rail, header)
│   ├── ui/               # shadcn/ui components
│   └── providers/        # React context providers
├── features/             # Feature modules (to be implemented)
├── lib/                  # Utilities and libraries
│   ├── api/             # API client and hooks
│   ├── stores/          # Zustand stores
│   ├── socket/          # Socket.IO client
│   └── db/              # Mock database
├── types/               # TypeScript definitions
├── public/              # Static assets
└── docs/                # Documentation
```

## Development Workflow

### Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Style

The project uses:
- **ESLint** for code quality
- **Prettier** for formatting
- **TypeScript** for type safety

Format code before committing:
```bash
npx prettier --write .
```

### Git Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push and create PR:
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

### Unit Tests (Future)
```bash
npm test
```

### E2E Tests (Future)
```bash
npm run test:e2e
```

### Storybook (Future)
```bash
npm run storybook
```

## Common Issues

### Port 3000 Already in Use

Change the port:
```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Run type check:
```bash
npm run type-check
```

### Socket.IO Connection Issues

Ensure the custom server is running (not just `next dev`):
```bash
npm run dev  # This runs server.js, not next dev
```

## Next Steps

### Implementing Features

The foundation is complete. Next steps:

1. **Chat Feature** - Implement real-time messaging
   - Create chat routes and components
   - Add Socket.IO event handlers
   - Build message composer with TipTap

2. **Projects Feature** - Add project management
   - Implement Kanban board with dnd-kit
   - Integrate SVAR DataGrid and Gantt
   - Add task modal and editing

3. **Files Feature** - File management
   - Build file browser
   - Implement upload with progress
   - Add preview functionality

4. **Search Feature** - Global search
   - Create command palette
   - Implement search API
   - Add result filtering

5. **Notifications** - Push notifications
   - Set up service worker
   - Implement VAPID
   - Add notification center

### Database Integration

Currently using in-memory mock data. To integrate PostgreSQL:

1. Install Prisma:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Define schema in `prisma/schema.prisma`

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

### File Storage Integration

To integrate MinIO or Synology:

1. Install MinIO client:
   ```bash
   npm install minio
   ```

2. Configure in `.env.local`:
   ```env
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET=epop-files
   ```

3. Implement pre-signed URL generation in API routes

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set in production:
- `NODE_ENV=production`
- `JWT_SECRET` (strong secret)
- `JWT_REFRESH_SECRET` (strong secret)
- `NEXT_PUBLIC_APP_URL` (production URL)
- Database credentials
- MinIO/S3 credentials
- SMTP settings
- VAPID keys

### Deployment Platforms

**Vercel** (recommended for Next.js):
```bash
npm install -g vercel
vercel
```

**Docker**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**PM2** (for VPS):
```bash
npm install -g pm2
pm2 start npm --name "epop" -- start
```

## Support

- **Documentation**: See `/docs` folder
- **Issues**: Create an issue in the repository
- **Email**: support@epop.com

## License

Proprietary and confidential.
