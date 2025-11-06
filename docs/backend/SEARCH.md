# Search (ZincSearch) — Wave-2

## Summary
- Real-time indexers on domain events (create/update/delete)
- Admin reindex endpoint per entity
- ACL filtering server-side
- Prometheus metrics: QPS, duration, index lag (p95 derivable in Prometheus)

## Endpoints
- GET `/api/v1/search?q=&tab=all|messages|files|projects&limit=&offset=`
- GET `/api/v1/search/:entity/cursor?q=&limit=&cursor=` — cursor pagination
- PUT `/api/v1/search/index/:entity` — admin backfill/reindex

Entities supported: `messages`, `mail_messages`, `files`, `tasks`.

## Indexers
- Subscriber: `backend/src/search/search.subscriber.ts`
  - Subscribes to:
    - `epop.chat.message.created|updated|deleted`
    - `epop.project.task.created|updated|moved|rescheduled`
    - `epop.mail.message.created`
  - Enqueues BullMQ jobs: `index_doc`, `delete_doc` (queue `search`)
- Worker: `backend/src/workers/search.worker.ts`
  - Processes `index_doc` (load from DB, shape, `SearchService.indexDoc`)
  - Processes `delete_doc` (`SearchService.deleteDoc`)

## ACL
- Server filters hits with SQL checks per entity (`filterAccessible()` in `SearchService`).

## Metrics
- `search_requests_total{method}` — total
- `search_duration_seconds{method}` — histogram (derive p95)
- `search_index_lag_seconds` — histogram (entity createdAt → index write)

## Notes
- Configure Zinc credentials in `.env` (`ZINC_*`).
- See controller: `backend/src/search/search.controller.ts` and service: `backend/src/search/search.service.ts`.
