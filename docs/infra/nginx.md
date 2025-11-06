# NGINX Configuration (Edge/Ingress)

- **Goals**
  - TLS termination, HTTP/2, gzip/brotli, CSP passthrough, sticky for Socket.IO.

- **Sample upstreams**
```
upstream api_upstream { server api:4000; }
upstream web_upstream { server web:3000; }
```

- **Core server snippet**
```
server {
  listen 443 ssl http2;
  server_name epop.local;
  # ssl_certificate /etc/ssl/certs/fullchain.pem;
  # ssl_certificate_key /etc/ssl/private/privkey.pem;

  gzip on; gzip_types application/json text/plain text/css application/javascript;
  brotli on; brotli_comp_level 5; brotli_types application/json text/plain text/css application/javascript;

  # CSP passthrough; set in API via Helmet, avoid overriding unless necessary
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;

  location /socket.io/ {
    proxy_pass http://api_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_read_timeout 3600s;
  }

  location /api/ { proxy_pass http://api_upstream; }
  location / { proxy_pass http://web_upstream; }
}
```
