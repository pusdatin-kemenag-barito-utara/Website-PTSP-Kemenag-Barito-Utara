# ============================================================
# PTSP Kemenag Barito Utara — Backend (Golang Fiber REST API)
# ============================================================

FROM golang:1.24-alpine AS builder

WORKDIR /app

# Dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api-ptsp main.go

# Production Runner Stage
FROM alpine:latest AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/api-ptsp /app/api-ptsp

EXPOSE 8080

CMD ["/app/api-ptsp"]
