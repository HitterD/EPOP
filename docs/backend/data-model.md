# Data Model (ERD highlights)

- **Conventions**
  - IDs: bigint (string in JSON).
  - Timestamps: `timestamptz` (`created_at`, edited/scan fields) across entities.
  - Soft delete: `messages.deleted_at` enabled; other entities use hard delete unless stated.

- **Core entities** (`backend/src/entities/`)
  - `users` (`user.entity.ts`): email (citext, unique), password_hash, display_name, presence, is_admin, org_unit_id, created_at.
  - `org_units` (`org-unit.entity.ts`): hierarchical (parent), code, name; audited in `directory_audit`.
  - `projects`, `project_members`, `task_buckets`, `tasks`, `task_comments`, `task_assignees`.
  - `chats`, `chat_participants`, `messages`, `message_reactions`, `message_reads`, `message_history`.
  - `files`, `file_links`.
  - `notification_preferences`.

- **Ordering & indexes**
  - Tasks use integer `position` for ordering within bucket.
  - Cursor pagination queries commonly order by `id DESC` with `LessThan(id)`.
  - Composite/GIN indexes are expected in migrations for JSONB/text search (see `backend/src/migrations/`).

- **Time zone**
  - All temporal columns use `TIMESTAMPTZ`; FE should send/receive ISO 8601 (Z) strings.
