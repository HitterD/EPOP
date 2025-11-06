# Analytics API (Wave-1)

- Base path: `/api/v1/analytics`
- Auth: Bearer JWT (cookie-based in app)

## Endpoints
- GET `/summary?start=ISO&end=ISO&scope=org|team|project&scopeId=...`
- GET `/timeseries?metric=...&start=ISO&end=ISO&scope=org|team|project&scopeId=...`

## Storage: `analytics_daily`
- Columns: `id, date (DATE), metric (TEXT), scope_type (TEXT), scope_id (BIGINT?), value (BIGINT), created_at`
- Indexes: `date`, `metric`, `(scope_type, scope_id)`
- Suggested metrics: `messages_per_day`, `active_users`, `task_throughput`, `storage_bytes`

## Notes
- Responses aggregate by metric for summary, and by day for timeseries.
- Extendable to materialized views for heavier queries (refresh via background job).
