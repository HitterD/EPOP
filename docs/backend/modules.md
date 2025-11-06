# Backend Modules & Endpoints

- **Auth** (`backend/src/auth/`)
  - `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
  - Sessions: `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/sessions/revoke-all`
  - Password reset: `POST /auth/password/forgot`, `POST /auth/password/reset`
  - Push: `POST /auth/push/subscribe`

- **Users** (`backend/src/users/`)
  - User CRUD/read (see Swagger)

- **Directory** (`backend/src/directory/`)
  - `GET /directory/tree`
  - `POST /directory` (admin)
  - `PATCH /directory/:id` (admin)
  - `DELETE /directory/:id` (admin)
  - `POST /directory/:id/move` (admin)
  - `GET /directory/:id/users`
  - Import: `POST /directory/import/dry-run`, `POST /directory/import/commit` (admin, CSV multipart)

- **Chat** (`backend/src/chat/`)
  - `GET /chats`, `POST /chats`
  - Messages: `GET /chats/:chatId/messages`, `GET /chats/:chatId/messages/cursor`, `POST /chats/:chatId/messages`
  - Threads: `GET /chats/:chatId/threads?rootMessageId=`
  - Reactions: `POST/DELETE /chats/:chatId/reactions`
  - Reads: `POST /chats/:chatId/reads`
  - Edit/Delete: `POST /chats/:chatId/messages/:messageId/edit`, `DELETE /chats/:chatId/messages/:messageId`
  - Unread: `GET /chats/unread`

- **Files** (`backend/src/files/`)
  - `POST /files/presign`
  - `POST /files/attach`
  - `GET /files/mine/cursor`
  - `GET /files/:id`
  - `PATCH /files/:id/status` (admin)

- **Compose/Mail** (`backend/src/compose/`)
  - Send/move/list; server-side HTML sanitize: `sanitizeHtml()` utility.

- **Projects** (`backend/src/projects/`)
  - `GET /projects/mine`, `POST /projects`
  - Members: `POST /projects/:projectId/members`
  - Buckets: `POST /projects/:projectId/buckets`
  - Tasks: `POST /projects/:projectId/tasks`
  - Task cursor: `GET /projects/:projectId/tasks/cursor`
  - Move/comment: `POST /projects/:projectId/tasks/:taskId/move`, `POST /projects/:projectId/tasks/:taskId/comments`

- **Search** (`backend/src/search/`)
  - Query all: `GET /search?q=`
  - Cursor per entity: `GET /search/:entity/cursor?q=`
  - Admin reindex: `PUT /search/index/:entity` (admin)

- **Notifications** (`backend/src/notifications/`)
  - Prefs: `GET /notifications/prefs`, `PUT /notifications/prefs`

- **Admin** (`backend/src/admin/`)
  - `POST /admin/users/bulk-import` (CSV multipart, 5MB)
  - `GET /admin/analytics`

- **Observability**
  - Health: `GET /health/live|ready|/`
  - Metrics: `GET /metrics` (Prometheus)
  - Swagger: `GET /docs`, `GET /docs-json`
