package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/database"
	"ptsp-kemenag-backend/internal/handler"
	"ptsp-kemenag-backend/internal/middleware"
)

func main() {
	// Load environment variables dari root .env.local atau .env
	_ = godotenv.Load("../.env.local")
	_ = godotenv.Load("../.env")

	// Load centralized configuration
	cfg := config.Load()

	// Inisialisasi koneksi database PostgreSQL (Supabase)
	database.ConnectDB()

	// Inisialisasi Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "PTSP Kemenag Barito Utara API (Clean Architecture v2.0)",
		BodyLimit:    50 * 1024 * 1024, // 50MB
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	// Global Middlewares
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	app.Use(logger.New(logger.Config{
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
	log.Printf("   Frontend asal: %s", cfg.FrontendOrigin)
	log.Fatal(app.Listen(":" + cfg.Port))
}
