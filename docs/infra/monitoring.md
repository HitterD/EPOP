# Monitoring (Prometheus / Grafana / Loki)

- **Prometheus**
  - Scrape API metrics at `http://api:4000/metrics`.
  - Example scrape config:
```
scrape_configs:
  - job_name: epop-api
    metrics_path: /metrics
    static_configs:
      - targets: ["api:4000"]
```

- **Grafana**
  - Dashboards for:
    - `http_requests_total{method,route,status_code}`
    - `http_request_duration_seconds_*{method,route,status_code}`
    - `http_requests_in_flight`

- **Loki / Promtail**
  - Collect container logs; API logs are JSON-structured via `LoggingInterceptor`.
  - Configure promtail to label `app=epop-api` and push to Loki.
