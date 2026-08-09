package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func ConnectDB() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DIRECT_URL")
	}

	if dbURL == "" {
		log.Println("WARNING: DATABASE_URL / DIRECT_URL tidak ditemukan di .env")
		return
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Printf("Gagal parse config database: %v\n", err)
		return
	}

	// Nonaktifkan prepared statement caching untuk Supabase Transaction Pooler (PgBouncer)
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Optimasi koneksi pool Supabase
	config.MaxConns = 25
	config.MinConns = 3
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Printf("Gagal mengkoneksikan pgxpool: %v\n", err)
		return
	}

	err = pool.Ping(context.Background())
	if err != nil {
		log.Printf("Gagal ping database PostgreSQL: %v\n", err)
		return
	}

	DB = pool
	log.Println("Berhasil terhubung ke Database PostgreSQL (Supabase/Direct Pool)")
}
