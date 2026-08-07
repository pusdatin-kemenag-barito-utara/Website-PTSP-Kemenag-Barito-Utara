package config

import "os"

// Config menyimpan seluruh konfigurasi aplikasi dari environment variables.
type Config struct {
	// Server
	Port string

	// Database
	DatabaseURL string
	DirectURL   string

	// CORS
	FrontendOrigin string

	// Security
	CronSecret       string
	TurnstileSecret  string
	JWTSecret        string
	SupabaseJWTSecret string

	// External Services
	WaBotURL   string
	WaBotAPIKey string
}

// Load membaca environment variables dan mengembalikan Config.
func Load() *Config {
	port := os.Getenv("GO_PORT")
	if port == "" {
		port = os.Getenv("PORT")
	}
	if port == "" {
		port = "8080"
	}

	frontendOrigin := os.Getenv("NEXT_PUBLIC_APP_URL")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:3000"
	}

	return &Config{
		Port:              port,
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		DirectURL:         os.Getenv("DIRECT_URL"),
		FrontendOrigin:    frontendOrigin,
		CronSecret:        os.Getenv("CRON_SECRET"),
		TurnstileSecret:   os.Getenv("TURNSTILE_SECRET_KEY"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		SupabaseJWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),
		WaBotURL:          os.Getenv("WA_BOT_URL"),
		WaBotAPIKey:       os.Getenv("WA_BOT_API_KEY"),
	}
}
