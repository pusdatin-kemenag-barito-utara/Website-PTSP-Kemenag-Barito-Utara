package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"ptsp-kemenag-backend/internal/models"
)

// GuestBookRepository menangani seluruh operasi DB untuk buku tamu.
type GuestBookRepository struct {
	db *pgxpool.Pool
}

// NewGuestBookRepository membuat instance baru.
func NewGuestBookRepository(db *pgxpool.Pool) *GuestBookRepository {
	return &GuestBookRepository{db: db}
}

// FindAll mengambil semua entri buku tamu dengan limit tertentu.
func (r *GuestBookRepository) FindAll(ctx context.Context, limit int) ([]models.GuestBook, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, guest_name, whatsapp, institution_type, institution_name,
		       intended_officer, purpose, visit_date, created_at
		FROM kemenag_ptsp.ptsp_guest_book
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.GuestBook
	for rows.Next() {
		var g models.GuestBook
		if err := rows.Scan(
			&g.ID, &g.GuestName, &g.Whatsapp, &g.InstitutionType,
			&g.InstitutionName, &g.IntendedOfficer, &g.Purpose,
			&g.VisitDate, &g.CreatedAt,
		); err == nil {
			result = append(result, g)
		}
	}
	return result, nil
}

// Create menyimpan entri buku tamu baru dan mengembalikan data yang tersimpan.
func (r *GuestBookRepository) Create(ctx context.Context, req models.CreateGuestBookRequest, visitDate time.Time) (*models.GuestBook, error) {
	var g models.GuestBook
	var institutionName *string
	if req.InstitutionName != "" {
		institutionName = &req.InstitutionName
	}
	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.ptsp_guest_book
		  (guest_name, whatsapp, institution_type, institution_name, intended_officer, purpose, visit_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, guest_name, whatsapp, institution_type, institution_name,
		          intended_officer, purpose, visit_date, created_at
	`, req.GuestName, req.Whatsapp, req.InstitutionType, institutionName,
		req.IntendedOfficer, req.Purpose, visitDate,
	).Scan(
		&g.ID, &g.GuestName, &g.Whatsapp, &g.InstitutionType,
		&g.InstitutionName, &g.IntendedOfficer, &g.Purpose,
		&g.VisitDate, &g.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

// Delete menghapus entri buku tamu berdasarkan ID.
func (r *GuestBookRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM ptsp.ptsp_guest_book WHERE id = $1`, id)
	return err
}
