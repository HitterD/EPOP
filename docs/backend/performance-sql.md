# Backend Performance Guide — SQL (TypeORM + PostgreSQL)

Updated: 5 Nov 2025

## Objective
- Enable dev-only query logging and slow-query profiling.
- Establish a repeatable audit flow to find and fix slow queries.
- Provide guidelines for writing efficient queries with TypeORM QueryBuilder.

## Dev-only Logging & Profiling
TypeORM has been configured to support opt-in logging in development.

- Files:
  - `backend/src/database/typeorm-logger.ts` — custom logger that appends slow queries to `logs/slow-queries.log`.
  - `backend/src/database/typeorm.config.ts` — NestJS TypeOrmModule config (runtime).
  - `backend/src/database/data-source.ts` — TypeORM CLI/migrations config.
  - `backend/src/config/env.validation.ts` — validates new env vars and provides defaults.

- Environment:
```bash
# backend/.env
TYPEORM_LOGGING=true
TYPEORM_SLOW_QUERY_THRESHOLD_MS=200
TYPEORM_SLOW_QUERY_LOG_FILE=logs/slow-queries.log
```

- Behavior:
  - When `TYPEORM_LOGGING=true`, TypeORM logs `error|warn|query` to console.
  - Queries slower than `TYPEORM_SLOW_QUERY_THRESHOLD_MS` are captured in JSON lines to `TYPEORM_SLOW_QUERY_LOG_FILE`.

## How to Run the Audit
1) Start the backend with logging enabled:
```bash
# in backend/
npm run start:dev
```

2) Exercise critical flows (large dataset recommended):
- Chat list → open several chats
- Message list (infinite scroll)
- Mail inbox/folders
- Files browse (mine/recent)
- Search (facets, pagination)
- Projects board/grid

3) Inspect slow queries log:
```bash
# show last 50 slow queries
powershell -Command "Get-Content logs/slow-queries.log -Tail 50"
```

4) For candidate queries, capture `EXPLAIN (ANALYZE, BUFFERS)`:
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
```
Save before/after plans in a ticket/PR comment.

## Refactor Guidelines (TypeORM)
- Avoid `find({ relations: [...] })` for lists. Use `createQueryBuilder`.
- Select only needed columns using `.select([...])`. Avoid `SELECT *`.
- Prevent N+1: prefer joins or batched `IN` queries.
- Use stable ordering + cursor pagination for large lists.
- Keep payloads lean over the wire (DTO/serializer trims fields).

### Examples
Messages by chat (cursor):
```ts
return repo
  .createQueryBuilder('m')
  .select(['m.id','m.chat_id','m.sender_id','m.created_at','m.content_json'])
  .where('m.chat_id = :chatId', { chatId })
  .andWhere(cursor ? 'm.created_at < :cursor' : '1=1', { cursor })
  .orderBy('m.created_at', 'DESC')
  .limit(limit)
  .getMany();
```

Unread counts per user (raw SQL for speed):
```ts
return manager.query(
  `SELECT m.chat_id, COUNT(*) AS unread
   FROM messages m
   JOIN chat_participants p ON p.chat_id = m.chat_id AND p.user_id = $1
   LEFT JOIN message_reads r ON r.message_id = m.id AND r.user_id = $1
   WHERE r.message_id IS NULL AND m.sender_id <> $1
   GROUP BY m.chat_id`,
  [userId],
);
```

## Indexing Strategy (Preview for PR#3)
- Composite indexes for sort/pagination:
  - `messages(chat_id, created_at DESC)`
  - `files(owner_id, created_at)`
  - `tasks(project_id, bucket_id, order_index)`
- Access-pattern indexes:
  - `message_reads(user_id, message_id)`
- JSONB GIN for search/filter:
  - `messages.content_json`
  - `mail_messages.to_users`

## Deliverables — PR#1 (Baseline)
- Dev-only logging and slow-query profiling: ✅
- Initial audit log capture: pending after run.
- Document this guide: ✅ (this file)
- EPop_Status.md tracker updated: ✅

## Next
- PR#2: Refactor slow queries with QueryBuilder and minimal selects.
- PR#3: Migrations to add missing indexes + EXPLAIN ANALYZE before/after.
- PR#4/5: Frontend virtualization for large lists (@tanstack/react-virtual).
