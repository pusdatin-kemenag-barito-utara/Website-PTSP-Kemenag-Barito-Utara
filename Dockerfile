# Multi-stage Dockerfile for PTSP Kemenag (Golang Fiber Backend + Astro Frontend)

# Stage 1: Build Golang Backend
FROM golang:alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o api-ptsp main.go

# Stage 2: Build Astro Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Install Infisical CLI untuk inject env vars secara dinamis dari Infisical saat build
RUN apk add --no-cache bash curl wget && \
    wget -qO- 'https://artifacts-cli.infisical.com/setup.apk.sh' | sh && \
    apk add --no-cache infisical

COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
# Gunakan --legacy-peer-deps dan --include=dev agar devDependencies (termasuk Astro) diinstall walau di NODE_ENV=production
RUN npm install --include=dev --legacy-peer-deps

COPY frontend/ ./

# Build arguments dari Coolify (is_buildtime=true)
ARG INFISICAL_API_URL
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_UNIVERSAL_AUTH_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID
ARG INFISICAL_SECRET_PATH=/ptsp-kemenag
ARG INFISICAL_ENV=prod
ARG INFISICAL_TOKEN

# Inject env vars langsung dari Infisical ke build process Astro tanpa hardcode secret
RUN sh -c '\
    API_DOMAIN="${INFISICAL_API_URL:-https://app.infisical.com/api}"; \
    case "$API_DOMAIN" in */api) ;; *) API_DOMAIN="${API_DOMAIN%/}/api" ;; esac; \
    CLIENT_ID="${INFISICAL_CLIENT_ID:-$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}"; \
    CLIENT_SECRET="${INFISICAL_CLIENT_SECRET:-$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}"; \
    TOKEN="$INFISICAL_TOKEN"; \
    if [ -z "$TOKEN" ] && [ -n "$CLIENT_ID" ] && [ -n "$CLIENT_SECRET" ]; then \
        echo "🔑 [Infisical] Logging in with Universal Auth..."; \
        TOKEN=$(infisical login --method=universal-auth --client-id="$CLIENT_ID" --client-secret="$CLIENT_SECRET" --domain="$API_DOMAIN" --plain --silent) || true; \
    fi; \
    if [ -n "$TOKEN" ]; then \
        PROJECT_ARG=""; \
        if [ -n "$INFISICAL_PROJECT_ID" ]; then PROJECT_ARG="--projectId=$INFISICAL_PROJECT_ID"; fi; \
        echo "🔐 [Infisical] Injecting secrets for frontend build from project $INFISICAL_PROJECT_ID ($INFISICAL_ENV:$INFISICAL_SECRET_PATH)..."; \
        infisical run --token="$TOKEN" --domain="$API_DOMAIN" --env="$INFISICAL_ENV" $PROJECT_ARG --path="$INFISICAL_SECRET_PATH" --silent -- npm run build; \
    else \
        echo "⚠️ [Infisical] No token found, running npm run build directly..."; \
        npm run build; \
    fi'

# Stage 3: Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata bash curl wget && \
    wget -qO- 'https://artifacts-cli.infisical.com/setup.apk.sh' | sh && \
    apk add --no-cache infisical

# Copy Backend
COPY --from=backend-builder /app/backend/api-ptsp /app/api-ptsp

# Copy Astro Frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Copy docker-entrypoint.sh untuk dynamic Infisical runtime injection
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000 8080

# Healthcheck untuk memastikan backend dan frontend berjalan (Coolify requirement)
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:8080/api/health && curl -f http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]

# Jalankan backend Golang di background, lalu jalankan Node.js server Astro
CMD ["sh", "-c", "PORT=8080 /app/api-ptsp & HOST=0.0.0.0 PORT=3000 node /app/frontend/dist/server/entry.mjs"]
