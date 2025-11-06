# EPOP Observability Stack Setup

**Date**: 5 November 2025  
**Components**: Prometheus, Grafana, Loki, Promtail, Node Exporter

---

## Overview

Complete observability stack for EPOP with:
- **Prometheus**: Metrics collection & alerting
- **Grafana**: Visualization & dashboards
- **Loki**: Log aggregation
- **Promtail**: Log shipping from Docker containers
- **Node Exporter**: Host-level metrics (CPU, memory, disk)

---

## Quick Start

### 1. Create External Network (if not exists)
```bash
docker network create epop-network
```

### 2. Ensure Backend is on the Network
Edit `docker-compose.prod.yml` to add:
```yaml
networks:
  epop-network:
    external: true
```

### 3. Start Monitoring Stack
```bash
docker compose -f docker-compose.monitoring.yml up -d

# Check status
docker compose -f docker-compose.monitoring.yml ps

# View logs
docker compose -f docker-compose.monitoring.yml logs -f
```

### 4. Access Dashboards
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100 (API only, use Grafana to query)

---

## Grafana Setup

### First Login
1. Navigate to http://localhost:3001
2. Login: `admin` / `admin`
3. **Change password immediately!**

### Pre-configured Datasources
- **Prometheus**: http://prometheus:9090 (default)
- **Loki**: http://loki:3100

### Pre-loaded Dashboards
- **EPOP Backend Metrics**: HTTP requests, latency, errors, WebSocket, CPU, memory

### Create Additional Dashboards
1. Click **+** → **Dashboard** → **Add Visualization**
2. Select **Prometheus** datasource
3. Example queries:
   - Request rate: `rate(http_requests_total[5m])`
   - P95 latency: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
   - Error rate: `rate(http_requests_total{status_code=~"5.."}[5m])`
   - Memory: `process_resident_memory_bytes`

---

## Prometheus Queries

### HTTP Metrics
```promql
# Request rate by endpoint
rate(http_requests_total{service="api"}[5m])

# P50/P95/P99 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route, method)

# Top 10 slowest endpoints
topk(10, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### WebSocket Metrics
```promql
# Active connections
websocket_connections{service="api"}

# Events per second
rate(websocket_events_total[5m])
```

### Process Metrics
```promql
# Memory (RSS)
process_resident_memory_bytes{service="api"}

# CPU usage
rate(process_cpu_seconds_total{service="api"}[5m])

# Event loop lag
nodejs_eventloop_lag_seconds{service="api"}
```

### Custom Business Metrics
```promql
# Messages sent per minute
rate(messages_sent_total[1m]) * 60

# Failed file uploads
rate(file_uploads_failed_total[5m])

# Search queries latency
histogram_quantile(0.95, rate(search_query_duration_seconds_bucket[5m]))
```

---

## Loki Log Queries (LogQL)

### Access Logs in Grafana
1. Click **Explore** (compass icon)
2. Select **Loki** datasource
3. Use LogQL queries:

### Example Queries
```logql
# All backend logs
{container=~".*backend.*"}

# Error logs only
{container=~".*backend.*"} |= "level=error"

# Logs with specific trace ID
{container=~".*backend.*"} |= "traceId=abc123"

# Rate of errors per minute
rate({container=~".*backend.*"} |= "level=error" [1m])

# Top error messages
topk(10, sum by (message) (rate({container=~".*backend.*"} |= "level=error" [5m])))

# Logs from specific context
{container=~".*backend.*"} | json | context="ChatService"

# 5xx errors from HTTP logs
{container=~".*backend.*"} | json | status_code=~"5.."
```

### Log Parsing
```logql
# Parse JSON logs
{container=~".*backend.*"} | json

# Extract fields
{container=~".*backend.*"} | json | level="error" | line_format "{{.message}}"

# Filter by field value
{container=~".*backend.*"} | json | userId="user123"
```

---

## Alerting (Optional)

### Prometheus Alert Rules
Create `docker/prometheus/alerts/backend-alerts.yml`:
```yaml
groups:
  - name: backend
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate"
          description: "{{ $value }} errors/sec on {{ $labels.route }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High P95 latency"
          description: "{{ $labels.route }} P95 latency is {{ $value }}s"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 1073741824  # 1GB
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Backend using {{ $value | humanize }}B of memory"
```

Uncomment `rule_files` in `prometheus.yml` and restart Prometheus.

---

## Retention Policies

### Prometheus
- **Metrics retention**: 30 days (configurable via `--storage.tsdb.retention.time`)
- **Storage path**: `prometheus-data` volume
- **Estimated size**: ~100MB/day for typical workload

### Loki
- **Log retention**: 31 days (744h in `loki-config.yml`)
- **Storage path**: `loki-data` volume
- **Estimated size**: ~500MB/day (JSON logs)

### Cleanup
```bash
# Remove old data (will delete everything)
docker compose -f docker-compose.monitoring.yml down -v

# Or manually prune volumes
docker volume rm epop-prometheus-data epop-grafana-data epop-loki-data
```

---

## Performance Impact

### Resource Usage (Typical)
- **Prometheus**: 200MB RAM, 0.1 CPU
- **Grafana**: 150MB RAM, 0.05 CPU
- **Loki**: 250MB RAM, 0.1 CPU
- **Promtail**: 50MB RAM, 0.05 CPU
- **Node Exporter**: 20MB RAM, 0.02 CPU

**Total overhead**: ~670MB RAM, ~0.32 CPU

### Network Traffic
- **Prometheus scrape**: ~10KB/15s = 60KB/min
- **Promtail shipping**: ~100KB/min (depends on log volume)

---

## Troubleshooting

### Prometheus Not Scraping Backend
1. Check backend is exposing `/metrics`:
   ```bash
   curl http://localhost:4000/metrics
   ```
2. Verify network connectivity:
   ```bash
   docker exec epop-prometheus wget -O- http://backend:4000/metrics
   ```
3. Check Prometheus targets: http://localhost:9090/targets

### Loki Not Receiving Logs
1. Check Promtail is running:
   ```bash
   docker compose -f docker-compose.monitoring.yml logs promtail
   ```
2. Verify Docker socket access:
   ```bash
   docker exec epop-promtail ls /var/run/docker.sock
   ```
3. Check Loki API:
   ```bash
   curl http://localhost:3100/ready
   ```

### Grafana Datasource Connection Failed
1. Check datasource config: **Configuration** → **Datasources**
2. Test connection: Click datasource → **Save & Test**
3. Verify Prometheus/Loki are healthy:
   ```bash
   docker compose -f docker-compose.monitoring.yml ps
   ```

---

## Production Recommendations

### Security
1. **Change Grafana password** immediately
2. Enable HTTPS for Grafana (via NGINX reverse proxy)
3. Restrict Prometheus/Loki ports (use NGINX for auth)
4. Use Grafana RBAC for multi-user access

### High Availability
- Run Prometheus with **remote write** to long-term storage (e.g., Thanos, Cortex)
- Use **Loki distributed mode** for high log volume
- Add **Alertmanager** for alert routing (Slack, PagerDuty, email)

### Scaling
- **Prometheus federation** for multi-cluster setups
- **Loki multi-tenant mode** for isolating log streams
- **Grafana Enterprise** for advanced features (SSO, reporting)

---

## Integration with Backend

### Backend Already Exports
✅ `/metrics` endpoint (Prometheus format)  
✅ JSON structured logs (stdout)  
✅ Trace IDs in logs and errors  
✅ Custom metrics: `messages_sent_total`, `websocket_connections`, etc.

### No Code Changes Required
The backend already:
- Uses `@nestjs/prometheus` for metrics middleware
- Logs JSON with `LoggingInterceptor`
- Includes `traceId` and `requestId` in all logs
- Exposes `/metrics` endpoint

---

## Next Steps

1. **Run the stack**: `docker compose -f docker-compose.monitoring.yml up -d`
2. **Access Grafana**: http://localhost:3001 (change password!)
3. **View dashboard**: Navigate to **Dashboards** → **EPOP Backend Metrics**
4. **Explore logs**: Click **Explore** → Select **Loki** → Query logs
5. **Set up alerts**: Create alert rules in Prometheus or Grafana

---

## Example Grafana Dashboard Queries

### HTTP Request Rate Panel
- **Query**: `rate(http_requests_total{service="api"}[5m])`
- **Legend**: `{{method}} {{route}}`
- **Panel type**: Time series graph

### Error Rate Panel
- **Query**: `sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route)`
- **Legend**: `{{route}}`
- **Panel type**: Time series graph
- **Threshold**: Add alert at > 0.05 (5%)

### Active WebSocket Connections Panel
- **Query**: `websocket_connections{service="api"}`
- **Panel type**: Stat
- **Unit**: Connections

### Memory Usage Panel
- **Query**: `process_resident_memory_bytes{service="api"}`
- **Panel type**: Time series graph
- **Unit**: Bytes (IEC)

---

**Status**: ✅ **READY TO DEPLOY** - All configuration files created, just run `docker compose up`!
