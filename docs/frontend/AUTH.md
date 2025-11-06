# Authentication

## Overview
Cookie-based authentication with automatic token refresh and session management.

## Implementation Status
- ✅ FE-1: httpOnly cookie authentication with 401→refresh→retry
- ✅ FE-2: Session center with device tracking and revocation
- ✅ FE-3: RBAC with permission-based UI gating

## Authentication Flow

### Login (FE-1)
```typescript
const { mutate: login } = useLogin()
login({ email, password })
// Sets httpOnly cookies, connects Socket.IO, redirects to dashboard
```

#### Post-login Redirect Safety
- The login flow respects a `?from=` query param and redirects to it if it is an internal path (starts with `/` and not `//`).
- External URLs or unsafe targets are ignored; user is redirected to `ROUTES.DASHBOARD`.

### Auto-Refresh on 401
- `ApiClient` detects 401 responses
- Calls `/auth/refresh` automatically
- Retries original request with new token
- Hard logout if refresh fails
- Race condition prevention with `isRefreshing` flag

### Logout
```typescript
const { mutate: logout } = useLogout()
logout() // Clears cookies, disconnects socket, redirects to login
```

## Session Management (FE-2)

### List Sessions
```typescript
const { data: sessions } = useSessions()
// Returns: UserSession[] with device info, IP, lastActiveAt
```

### Revoke Session
```typescript
const { mutate: revokeSession } = useRevokeSession()
revokeSession('session-id')
```

### Revoke All Other Sessions
```typescript
const { mutate: revokeAll } = useRevokeAllSessions()
revokeAll() // Logout from all devices except current
```

## RBAC (FE-3)

### Permission Checks
```typescript
const hasPermission = useAuthStore((s) => s.hasPermission)
const canAdmin = hasPermission('admin:access')
```

### UI Gating with IfCan
```typescript
import { IfCan } from '@/components/auth/if-can'

<IfCan permission="project:create">
  <CreateProjectButton />
</IfCan>

<IfCan role="admin">
  <AdminPanel />
</IfCan>

<IfCan permissions={['user:read', 'user:update']} requireAll>
  <UserManager />
</IfCan>
```

### Available Permissions
- `project:create`, `project:read`, `project:update`, `project:delete`
- `chat:create`, `chat:read`, `chat:moderate`
- `user:read`, `user:update`, `user:delete`
- `directory:read`, `directory:update`
- `file:upload`, `file:read`, `file:delete`
- `admin:access`

## Security Features

### httpOnly Cookies
- Access/refresh tokens stored in httpOnly cookies
- Not accessible via JavaScript
- Automatic inclusion in API requests via `credentials: 'include'`

### CSRF Protection
- Backend validates origin/referer headers
- SameSite cookie attribute

### Token Rotation
- Refresh tokens rotated on each use
- Old tokens invalidated immediately

## Error Handling

### 401 Unauthorized
- Automatic refresh attempt
- Retry original request
- Hard logout on refresh failure
- User redirected to `/login`

### 403 Forbidden
- Shows error message
- Does not attempt refresh
- Logs action for audit

## Hooks Reference

- `useLogin()` - Authenticate user
- `useRegister()` - Create new account
- `useLogout()` - End session
- `useForgotPassword()` - Request password reset
- `useResetPassword()` - Complete password reset
- `useCurrentUser()` - Fetch current user data
- `useSessions()` - List active sessions
- `useRevokeSession()` - Revoke specific session
- `useRevokeAllSessions()` - Logout all devices
