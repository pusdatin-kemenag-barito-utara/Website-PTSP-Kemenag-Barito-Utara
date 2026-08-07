package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"ptsp-kemenag-backend/internal/models"
)

// AppointmentRepository menangani seluruh operasi DB untuk janji temu.
type AppointmentRepository struct {
	db *pgxpool.Pool
}

func NewAppointmentRepository(db *pgxpool.Pool) *AppointmentRepository {
	return &AppointmentRepository{db: db}
}

// FindAll mengambil daftar janji temu dengan filter opsional.
func (r *AppointmentRepository) FindAll(ctx context.Context, statusFilter string, limit int) ([]models.Appointment, error) {
	query := `
		SELECT id, guest_name, whatsapp, institution_type, institution_name,
		       intended_officer, purpose, appointment_date, appointment_time, status, created_at
		FROM kemenag_ptsp.ptsp_appointments WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if statusFilter != "" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, statusFilter)
		argIdx++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(
			&a.ID, &a.GuestName, &a.Whatsapp, &a.InstitutionType,
			&a.InstitutionName, &a.IntendedOfficer, &a.Purpose,
			&a.AppointmentDate, &a.AppointmentTime, &a.Status, &a.CreatedAt,
		); err == nil {
			result = append(result, a)
		}
	}
	return result, nil
}

// Create menyimpan janji temu baru.
func (r *AppointmentRepository) Create(ctx context.Context, req models.CreateAppointmentRequest, appointmentDate time.Time) (*models.Appointment, error) {
	var a models.Appointment
	var institutionName *string
	if req.InstitutionName != "" {
		institutionName = &req.InstitutionName
	}
	err := r.db.QueryRow(ctx, `
		INSERT INTO ptsp.ptsp_appointments
		  (guest_name, whatsapp, institution_type, institution_name, intended_officer,
		   purpose, appointment_date, appointment_time, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
		RETURNING id, guest_name, whatsapp, institution_type, institution_name,
		          intended_officer, purpose, appointment_date, appointment_time, status, created_at
	`, req.GuestName, req.Whatsapp, req.InstitutionType, institutionName,
		req.IntendedOfficer, req.Purpose, appointmentDate, req.AppointmentTime,
	).Scan(
		&a.ID, &a.GuestName, &a.Whatsapp, &a.InstitutionType,
		&a.InstitutionName, &a.IntendedOfficer, &a.Purpose,
		&a.AppointmentDate, &a.AppointmentTime, &a.Status, &a.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// UpdateStatus memperbarui status janji temu.
func (r *AppointmentRepository) UpdateStatus(ctx context.Context, id, status string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE ptsp.ptsp_appointments SET status = $1, updated_at = $2 WHERE id = $3`,
		status, time.Now(), id,
	)
	return err
}

// Delete menghapus janji temu berdasarkan ID.
func (r *AppointmentRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM ptsp.ptsp_appointments WHERE id = $1`, id)
	return err
}
