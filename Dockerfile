# Multi-stage Dockerfile for PTSP Kemenag (Golang Fiber Backend + Next.js Frontend)

# Stage 1: Build Golang Backend
FROM golang:alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o api-ptsp main.go

# Stage 2: Build Next.js Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
RUN npm install --include=dev

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata bash curl

COPY --from=backend-builder /app/backend/api-ptsp /app/api-ptsp
COPY --from=frontend-builder /app/frontend/public /app/public
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/.next/standalone /app/
COPY --from=frontend-builder /app/frontend/.next/static /app/frontend/.next/static

EXPOSE 3000 8080

CMD ["sh", "-c", "PORT=8080 /app/api-ptsp & HOSTNAME=0.0.0.0 PORT=3000 node /app/frontend/server.js"]


