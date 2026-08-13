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
		log.Fatal("FATAL: DATABASE_URL / DIRECT_URL tidak ditemukan di environment variables")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("FATAL: Gagal parse config database: %v\n", err)
	}

	// Nonaktifkan prepared statement caching untuk Supabase Transaction Pooler (PgBouncer)
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Optimasi koneksi pool Supabase
	config.MaxConns = 25
	config.MinConns = 3
	config.MaxConnIdleTime = 5 * time.Minute

	var pool *pgxpool.Pool

	for i := 1; i <= 5; i++ {
		pool, err = pgxpool.NewWithConfig(context.Background(), config)
		if err == nil {
			err = pool.Ping(context.Background())
			if err == nil {
				break
			}
		}
		log.Printf("Percobaan koneksi database ke-%d gagal: %v. Retrying in 3 seconds...\n", i, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("FATAL: Gagal mengkoneksikan ke database PostgreSQL setelah 5 percobaan: %v\n", err)
	}

	DB = pool
	log.Println("Berhasil terhubung ke Database PostgreSQL (Supabase/Direct Pool)")
}
