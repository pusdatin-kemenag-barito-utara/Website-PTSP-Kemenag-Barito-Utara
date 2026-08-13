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
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
# Gunakan --legacy-peer-deps dan --include=dev agar devDependencies (termasuk Astro) diinstall walau di NODE_ENV=production
RUN npm install --include=dev --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Stage 3: Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata bash curl

# Copy Backend
COPY --from=backend-builder /app/backend/api-ptsp /app/api-ptsp

# Copy Astro Frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

EXPOSE 3000 8080

# Healthcheck untuk memastikan backend dan frontend berjalan (Coolify requirement)
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:8080/api/health && curl -f http://127.0.0.1:3000/ || exit 1

# Jalankan backend Golang di background, lalu jalankan Node.js server Astro
CMD ["sh", "-c", "PORT=8080 /app/api-ptsp & HOST=0.0.0.0 PORT=3000 node /app/frontend/dist/server/entry.mjs"]
