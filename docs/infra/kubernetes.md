# Kubernetes (Production)

- **Deployments**
  - API and Web with `replicas > 1`; use `@socket.io/redis-adapter` (already configured) for horizontal scale.
  - Configure liveness/readiness probes (`/health/live`, `/health/ready`).

- **Ingress (NGINX Ingress Controller)**
  - HTTP/2, TLS, gzip/brotli enabled.
  - Sticky for Socket.IO (`/socket.io/`) via cookie or IP-hash. Example annotation:
```
nginx.ingress.kubernetes.io/affinity: cookie
nginx.ingress.kubernetes.io/session-cookie-name: io
nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
```

- **Persistent Volumes**
  - MinIO, ZincSearch, Postgres with PV/PVC sizing per retention and capacity planning.

- **Monitoring & Alerts**
  - Prometheus Operator with ServiceMonitor scraping `/metrics`.
  - Grafana dashboards for API latency, error rate, in-flight requests.

- **Backups**
  - Nightly Postgres dump and MinIO lifecycle policies (see `docs/runbooks/backup-restore.md`).
