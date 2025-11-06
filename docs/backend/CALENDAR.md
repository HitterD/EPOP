# Calendar API (Wave-1)

- Base path: `/api/v1/calendar`
- Auth: Bearer JWT (cookie-based in app), except ICS feed which uses a token query param.

## Endpoints
- GET `/events?start=ISO&end=ISO`
- POST `/events`
- PATCH `/events/:id`
- DELETE `/events/:id`
- GET `/ics/feed?token=...&start=ISO&end=ISO` (text/calendar)
- POST `/ics/import`

## Entity: `calendar_events`
- Columns: `id, owner_id, title, start_ts, end_ts, location, source, project_id, task_id, all_day, reminders jsonb, created_at`
- Indexes: `(owner_id, start_ts)`

## DTOs
- CreateEventDto: `title, startTs, endTs, location?, source?, projectId?, taskId?, allDay?, reminders?`
- UpdateEventDto: all optional
- IcsImportDto: `ics` string

## ICS Feed
- Token format: `userId.signature` where `signature = HMAC_SHA256(userId|"ics", ICS_FEED_SECRET)` (base64url)
- Configure `ICS_FEED_SECRET` in `.env`

## Notes
- Times stored as TIMESTAMPTZ. Overlap query used for ranged lists.
- ICS import is basic (SUMMARY, DTSTART, DTEND, LOCATION); duplicates prevented by (ownerId,title,startTs).

## Reminders (Wave-3)
- Events may include `reminders` (JSON array), e.g. `[{ "minutes": 10 }, { "minutes": 30 }]`.
- Background worker scans every 30s and dispatches reminders scheduled within the next 2 minutes.
- Channels: Web Push (if subscription + `pushEnabled`), Email (if `emailEnabled`).
- Dedup: per-event per-offset with Redis key `reminder:ev:{id}:min:{minutes}` (TTL 3h).
