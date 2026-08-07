package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// UserRepository menangani operasi DB pengguna (kemenag_pusdatin.profiles), audit logs, dan search.
type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindAll(ctx context.Context, role, status string, limit int) ([]models.User, error) {
	query := `
		SELECT id, name, email, phone, role, user_type, status, is_verified, avatar_url, created_at
		FROM kemenag_pusdatin.profiles WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if role != "" {
		query += fmt.Sprintf(" AND role = $%d", argIdx)
		args = append(args, role)
		argIdx++
	}
	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt); err == nil {
			result = append(result, u)
		}
	}
	return result, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	var u models.User
	err := r.db.QueryRow(ctx, `
		SELECT id, name, email, phone, role, user_type, status, is_verified, avatar_url, created_at
		FROM kemenag_pusdatin.profiles WHERE id = $1
	`, id).Scan(&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt)

	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Update(ctx context.Context, id string, req models.UpdateUserRequest) error {
	if req.Permissions != nil {
		// Update permissions only (JSONB field)
		permJSON, err := json.Marshal(*req.Permissions)
		if err != nil {
			return err
		}
		_, err = r.db.Exec(ctx,
			`UPDATE kemenag_pusdatin.profiles SET permissions=$1, updated_at=$2 WHERE id=$3`,
			string(permJSON), time.Now(), id,
		)
		return err
	}
	// Update role/status/verified
	_, err := r.db.Exec(ctx,
		`UPDATE kemenag_pusdatin.profiles SET role=$1, status=$2, is_verified=$3, updated_at=$4 WHERE id=$5`,
		req.Role, req.Status, req.IsVerified, time.Now(), id,
	)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, id string, req models.UpdateProfileRequest) error {
	if req.FullName != "" && req.AvatarURL != "" {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_pusdatin.profiles SET name=$1, avatar_url=$2, updated_at=$3 WHERE id=$4`,
			req.FullName, req.AvatarURL, time.Now(), id,
		)
		return err
	} else if req.FullName != "" {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_pusdatin.profiles SET name=$1, updated_at=$2 WHERE id=$3`,
			req.FullName, time.Now(), id,
		)
		return err
	} else if req.AvatarURL != "" {
		_, err := r.db.Exec(ctx,
			`UPDATE kemenag_pusdatin.profiles SET avatar_url=$1, updated_at=$2 WHERE id=$3`,
			req.AvatarURL, time.Now(), id,
		)
		return err
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM kemenag_pusdatin.profiles WHERE id = $1`, id)
	return err
}

func (r *UserRepository) FindAuditLogs(ctx context.Context, limit int) ([]models.AuditLog, error) {
	rows, err := r.db.Query(ctx, `
		SELECT al.id, al.admin_id, al.action, al.entity_type, al.entity_id, al.created_at, p.name AS admin_name
		FROM kemenag_ptsp.ptsp_audit_logs al
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = al.admin_id
		ORDER BY al.created_at DESC LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.AuditLog
	for rows.Next() {
		var al models.AuditLog
		var createdAt interface{}
		if err := rows.Scan(&al.ID, &al.AdminID, &al.Action, &al.EntityType, &al.EntityID, &createdAt, &al.AdminName); err == nil {
			if t, ok := createdAt.(time.Time); ok {
				al.CreatedAt = t.Format(time.RFC3339)
			}
			result = append(result, al)
		}
	}
	return result, nil
}

func (r *UserRepository) GlobalSearch(ctx context.Context, q string) (*models.SearchResult, error) {
	searchStr := "%" + q + "%"
	res := &models.SearchResult{
		Requests: []models.SearchRequestItem{},
		Profiles: []models.SearchProfileItem{},
		Services: []models.SearchServiceItem{},
	}

	reqRows, _ := r.db.Query(ctx, `
		SELECT r.id, r.request_number, r.status, r.created_at, s.name AS service_name, p.name AS applicant_name
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = r.user_id
		WHERE r.request_number ILIKE $1 OR s.name ILIKE $1 OR p.name ILIKE $1
		ORDER BY r.created_at DESC LIMIT 6
	`, searchStr)
	if reqRows != nil {
		defer reqRows.Close()
		for reqRows.Next() {
			var item models.SearchRequestItem
			var createdAt interface{}
			if err := reqRows.Scan(&item.ID, &item.RequestNumber, &item.Status, &createdAt, &item.ServiceName, &item.ApplicantName); err == nil {
				if t, ok := createdAt.(time.Time); ok {
					item.CreatedAt = t.Format(time.RFC3339)
				}
				res.Requests = append(res.Requests, item)
			}
		}
	}

	profRows, _ := r.db.Query(ctx, `
		SELECT id, name, email, role, phone FROM kemenag_pusdatin.profiles
		WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 LIMIT 5
	`, searchStr)
	if profRows != nil {
		defer profRows.Close()
		for profRows.Next() {
			var item models.SearchProfileItem
			if err := profRows.Scan(&item.ID, &item.FullName, &item.Email, &item.Role, &item.Phone); err == nil {
				res.Profiles = append(res.Profiles, item)
			}
		}
	}

	svcRows, _ := r.db.Query(ctx, `
		SELECT id, name, slug FROM kemenag_ptsp.ptsp_services
		WHERE name ILIKE $1 OR slug ILIKE $1 LIMIT 5
	`, searchStr)
	if svcRows != nil {
		defer svcRows.Close()
		for svcRows.Next() {
			var id int64
			var item models.SearchServiceItem
			if err := svcRows.Scan(&id, &item.Name, &item.Slug); err == nil {
				item.ID = fmt.Sprintf("%d", id)
				res.Services = append(res.Services, item)
			}
		}
	}

	return res, nil
}
