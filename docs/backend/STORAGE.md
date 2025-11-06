# Storage (MinIO/S3) — Wave-2

## Summary
- Adds file versioning/retention fields and lifecycle jobs.
- Optional secondary S3 profile (e.g., Synology S3) for replication.

## DB
- Table `files` extended with:
  - `s3_version_id TEXT NULL`
  - `retention_policy TEXT NULL` (e.g., 30d, 90d, 1y, 7y, permanent)
  - `retention_expires_at TIMESTAMPTZ NULL`
- Migration: `backend/src/migrations/1731100000001-files-versioning-retention.ts`

## API
- POST `/api/v1/files/presign` → same as before
- POST `/api/v1/files/attach` → now finalizes and enqueues search index
- POST `/api/v1/files/:id/confirm` → finalizes move + optional replicate to secondary + index
- GET `/api/v1/files/:id/versions` → lists S3 object versions (requires bucket versioning enabled)
- PATCH `/api/v1/files/:id/retention` → `{ policy: '30d'|'90d'|'1y'|'7y'|'permanent'|null }`
- POST `/api/v1/files/purge-temp` (admin) → removes unlinked temp uploads
- POST `/api/v1/files/purge-retention` (admin) → deletes files past `retention_expires_at`

## Secondary S3 Profile (Optional)
Set in `.env` (see `backend/.env.example`):
- `S3_SECONDARY_ENABLED=true`
- `S3_SECONDARY_ENDPOINT=...`
- `S3_SECONDARY_PORT=9000`
- `S3_SECONDARY_ACCESS_KEY=...`
- `S3_SECONDARY_SECRET_KEY=...`
- `S3_SECONDARY_BUCKET=epop`
- `S3_SECONDARY_USE_SSL=false`

Replication happens on file `confirm()`; the primary object is streamed and written to the secondary bucket.

## Lifecycle Jobs
- Worker `FilesLifecycleWorker` (loaded in `workers/worker.module.ts`)
  - Purge temp uploads older than 24h (every 15m)
  - Purge expired retention files (every hour)

## Notes
- MinIO bucket versioning must be enabled to see entries in `GET /files/:id/versions`.
- Retention expiration removes DB row and S3 object; adjust schedule in `FilesLifecycleWorker` if needed.
