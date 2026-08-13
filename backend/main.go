package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/database"
	"ptsp-kemenag-backend/internal/handler"
	"ptsp-kemenag-backend/internal/middleware"
)

func main() {
	// Load environment variables dari root .env.local atau .env (CWD-independent)
	envFiles := []string{
		".env.local", ".env",
		"../.env.local", "../.env",
		"../../.env.local", "../../.env",
	}
	for _, f := range envFiles {
		if _, err := os.Stat(f); err == nil {
			_ = godotenv.Load(f);
		}
	}

	// Load centralized configuration
	cfg := config.Load()

	// Inisialisasi koneksi database PostgreSQL (Supabase)
	database.ConnectDB()

	// Inisialisasi Fiber App dengan High Performance Settings
	app := fiber.New(fiber.Config{
		AppName:      "PTSP Kemenag Barito Utara API (Clean Architecture v2.0)",
		BodyLimit:    50 * 1024 * 1024, // 50MB
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,  // Keep-Alive connection reuse
		Concurrency:  256 * 1024,        // High concurrent request pool
		ServerHeader: "PTSP-Golang-API",
	})

	// Global Middlewares
	app.Use(etag.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	app.Use(logger.New(logger.Config{
		Next: func(c *fiber.Ctx) bool {
			path := c.Path()
			return path == "/api/health" || path == "/api/v1/admin/system/status"
		},
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	allowOrigins := cfg.FrontendOrigin + ",http://localhost:3000"
	if origins := os.Getenv("CORS_ALLOWED_ORIGINS"); origins != "" {
		allowOrigins = origins
	} else if origins := os.Getenv("CORS_ORIGINS"); origins != "" {
		allowOrigins = origins
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	app.Use(middleware.SetupRateLimiter())

	// Register all modular domain routes
	handler.RegisterRoutes(app, database.DB, cfg)

	log.Printf("✅ Server PTSP Backend (Clean Architecture) berjalan di port %s", cfg.Port)
	log.Printf("✅ Frontend asal: %s", cfg.FrontendOrigin)
	log.Fatal(app.Listen(":" + cfg.Port))
}
