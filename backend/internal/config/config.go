package config

import (
	"os"
	"strings"
)

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

	// Cloudflare R2
	R2AccountId       string
	R2AccessKeyId     string
	R2SecretAccessKey string
	R2BucketName      string
	R2PublicDomain    string
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

	r2AccountId := os.Getenv("R2_ACCOUNT_ID")
	r2Endpoint := os.Getenv("R2_ENDPOINT_URL")
	if r2AccountId == "" && r2Endpoint != "" {
		// Extract account ID from R2_ENDPOINT_URL https://<account_id>.r2.cloudflarestorage.com
		trimmed := strings.TrimPrefix(r2Endpoint, "https://")
		parts := strings.Split(trimmed, ".")
		if len(parts) > 0 {
			r2AccountId = parts[0]
		}
	}

	r2Bucket := os.Getenv("R2_BUCKET_PTSP")
	if r2Bucket == "" {
		r2Bucket = os.Getenv("R2_BUCKET_NAME")
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
		R2AccountId:       r2AccountId,
		R2AccessKeyId:     os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:      r2Bucket,
		R2PublicDomain:    os.Getenv("R2_PUBLIC_DOMAIN"),
	}
}
