# Development Compose Stack

- **Current services** (`docker-compose.yml`)
  - `postgres:16` (5432) with healthcheck
  - `redis:7` (6379) with healthcheck
  - `minio` (9000, 9001) with healthcheck
  - `zinc` (4080) with healthcheck
  - `mailhog` (1025, 8025) with healthcheck

- **API & Web**
  - Start API locally after `npm run build`:
```bash
npm --prefix backend run start:dev
```
  - Start Web locally:
```bash
npm run dev
```

- **Production Compose** (`docker-compose.prod.yml`)
  - Services: `backend`, `frontend`, `postgres`, `redis`, `minio`, `zinc` (no dev volumes, uses GHCR images).
  - Images: `ghcr.io/<owner>/<repo>/backend:latest`, `ghcr.io/<owner>/<repo>/frontend:latest`.
  - Backend exposes 4000, Frontend exposes 3000; environment configured via compose.
  - Usage:
    ```bash
    export GITHUB_REPOSITORY=yourorg/yourrepo
    docker compose -f docker-compose.prod.yml up -d
    ```
  - Migrations: exec into backend container and run `npm run migrate:run`.
  - Seeding: exec into backend container and run `npm run seed:dev`.

- **Planned extensions (Wave‑2)**
  - Add services: `nginx`, `prometheus`, `grafana`, `loki`, `promtail` with healthchecks and dependency wiring.
  - NGINX: TLS termination, gzip/brotli, sticky for `/socket.io/`.
  - Prometheus: scrape `backend:4000/metrics`.
  - Grafana: dashboards for HTTP, process, and custom metrics.
  - Loki+Promtail: aggregate JSON logs from backend containers.

- See also `docs/infra/monitoring.md` and `docs/infra/nginx.md` for configuration snippets.
