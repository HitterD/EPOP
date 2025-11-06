# Cursor Pagination

- **Encoding**
  - Cursor encodes either `{ id: string }` (ID-based) or `{ off: number }` (offset-based) in Base64URL.
  - Helper: `backend/src/common/pagination/cursor.ts`

- **Response Shape**
```json
{
  "items": [ ... ],
  "nextCursor": "base64url",
  "hasMore": true
}
```

- **Chat Messages**
  - Endpoint: `GET /api/v1/chats/:chatId/messages/cursor?cursor=&limit=`
  - Service: `ChatService.listMessagesCursor()`
  - Ordering: newest-first internally, returns ascending page for UX; cursor uses `id`.

- **Project Tasks**
  - Endpoint: `GET /api/v1/projects/:projectId/tasks/cursor?cursor=&limit=`
  - Service: `ProjectsService.listProjectTasksCursor()`
  - Cursor uses `id`.

- **Files (Mine)**
  - Endpoint: `GET /api/v1/files/mine/cursor?cursor=&limit=`
  - Service: `FilesService.listMineCursor()`
  - Cursor uses `id`.

- **Search**
  - Endpoint: `GET /api/v1/search/:entity/cursor?q=&cursor=&limit=` where `entity` ∈ `messages|mail_messages|files|tasks`
  - Service: `SearchService.searchCursor()` (permission filtered)
  - Cursor uses `off` (offset) against ZincSearch.

- **Notes**
  - Limits: 1..100; server requests `limit+1` to detect `hasMore`.
  - Auth required; membership enforced where applicable (chat/project).
