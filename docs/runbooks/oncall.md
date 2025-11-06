# Runbook: On-call Checklist

- **First look**
  - Check `GET /health/live` and `/health/ready`.
  - Check metrics `/metrics` for spikes in `http_request_duration_seconds` and error statuses.

- **Logs**
  - Inspect API logs (JSON) via Loki or container logs.
  - Filter by `traceId` from FE to follow a request end-to-end.

- **Queues & RT**
  - Ensure Redis is healthy; outbox publisher running and `epop.*` events flowing.
  - Validate Socket.IO connections and rooms.

- **Storage**
  - MinIO console reachable; bucket `epop` healthy.

- **Search**
  - Zinc health endpoint; sample query via `/search?q=test`.

- **Escalation**
  - Page platform/oncall if DB unavailable > 5m or error rate > 5% sustained.
