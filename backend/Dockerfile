# syntax=docker/dockerfile:1

# ====== Builder ======
FROM node:20-alpine AS builder
WORKDIR /app

# Build dependencies for native modules (e.g., argon2)
RUN apk add --no-cache python3 make g++

# Install deps and build
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Produce production node_modules (no dev deps)
RUN npm ci --omit=dev && npm cache clean --force

# ====== Runner ======
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Minimal runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./

# Use non-root user for security
RUN addgroup -g 1000 -S nodejs && adduser -S node -u 1000 -G nodejs \
  && chown -R node:node /app
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:4000/api/health/live').then(r=>{if(r.ok)process.exit(0);process.exit(1)}).catch(()=>process.exit(1))" || exit 1

CMD ["node", "dist/main"]
