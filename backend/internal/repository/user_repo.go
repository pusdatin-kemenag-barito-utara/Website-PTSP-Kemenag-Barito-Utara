package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/utils"

	"github.com/jackc/pgx/v5/pgxpool"
)

// UserRepository menangani operasi DB pengguna dari skema khusus kemenag_ptsp:
// - kemenag_ptsp.profiles_petugas (Petugas Admin PTSP, Kepala Kantor, Kasubag TU, Admin Seksi)
// - kemenag_ptsp.profiles_pegawai (Pegawai Kemenag)
// - kemenag_ptsp.profiles_pemohon (Masyarakat / Pemohon)
type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindAll(ctx context.Context, role, status string, limit int) ([]models.User, error) {
	if limit <= 0 {
		limit = 500
	}

	query := `
		SELECT 
			pt.user_id::text AS id,
			COALESCE(pt.nama, 'Petugas') AS name,
			COALESCE(pt.email, '') AS email,
			COALESCE(pt.no_hp, '') AS phone,
			COALESCE(pt.role, 'admin_ptsp') AS role,
			'internal_admin' AS user_type,
			COALESCE(pt.status, 'active') AS status,
			COALESCE(pt.is_verified, false) AS is_verified,
			COALESCE(pt.avatar_url, '') AS avatar_url,
			COALESCE(pt.created_at, NOW()) AS created_at,
			COALESCE(pt.nip, '') AS nip,
			COALESCE(pt.jabatan, '') AS jabatan,
			'' AS pangkat_golongan,
			COALESCE(pt.unit_kerja, '') AS unit_kerja,
			'' AS address,
			COALESCE(pt.permissions, '[]'::jsonb) AS permissions
		FROM kemenag_ptsp.profiles_petugas pt

		UNION ALL

		SELECT 
			pp.user_id::text AS id,
			COALESCE(pp.nama, 'Pegawai') AS name,
			COALESCE(pp.email, '') AS email,
			COALESCE(pp.no_hp, '') AS phone,
			COALESCE(pp.role, 'pegawai') AS role,
			'internal_pegawai' AS user_type,
			COALESCE(pp.status, 'active') AS status,
			COALESCE(pp.is_verified, true) AS is_verified,
			COALESCE(pp.avatar_url, '') AS avatar_url,
			COALESCE(pp.created_at, NOW()) AS created_at,
			COALESCE(pp.nip, '') AS nip,
			COALESCE(pp.jabatan, '') AS jabatan,
			COALESCE(pp.pangkat_golongan, '') AS pangkat_golongan,
			COALESCE(pp.unit_kerja, '') AS unit_kerja,
			'' AS address,
			COALESCE(pp.permissions, '[]'::jsonb) AS permissions
		FROM kemenag_ptsp.profiles_pegawai pp

		UNION ALL

		SELECT 
			pm.user_id::text AS id,
			COALESCE(pm.nama, 'Pemohon') AS name,
			COALESCE(pm.email, '') AS email,
			COALESCE(pm.no_hp, '') AS phone,
			COALESCE(pm.role, 'user') AS role,
			'eksternal_masyarakat' AS user_type,
			COALESCE(pm.status, 'active') AS status,
			COALESCE(pm.is_verified, false) AS is_verified,
			COALESCE(pm.avatar_url, '') AS avatar_url,
			COALESCE(pm.created_at, NOW()) AS created_at,
			'' AS nip,
			'' AS jabatan,
			'' AS pangkat_golongan,
			'' AS unit_kerja,
			COALESCE(pm.alamat, '') AS address,
			'[]'::jsonb AS permissions
		FROM kemenag_ptsp.profiles_pemohon pm
	`

	whereClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	if role != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("u.role = $%d", argIdx))
		args = append(args, role)
		argIdx++
	}
	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("u.status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	finalQuery := fmt.Sprintf("SELECT * FROM (%s) u%s ORDER BY u.created_at DESC LIMIT $%d", query, whereSQL, argIdx)
	args = append(args, limit)

	rows, err := r.db.Query(ctx, finalQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.User
	for rows.Next() {
		var u models.User
		var permBytes []byte
		if err := rows.Scan(
			&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt,
			&u.Nip, &u.Jabatan, &u.PangkatGolongan, &u.UnitKerja, &u.Address, &permBytes,
		); err == nil {
			if len(permBytes) > 0 {
				var permVal interface{}
				if err := json.Unmarshal(permBytes, &permVal); err == nil {
					u.Permissions = permVal
				}
			}
			result = append(result, u)
		}
	}
	return result, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	var u models.User
	var permBytes []byte

	// 1. Cari di kemenag_ptsp.profiles_petugas (Petugas / Admin)
	err := r.db.QueryRow(ctx, `
		SELECT 
			pt.user_id::text,
			COALESCE(pt.nama, 'Petugas'),
			COALESCE(pt.email, ''),
			COALESCE(pt.no_hp, ''),
			COALESCE(pt.role, 'admin_ptsp'),
			'internal_admin',
			COALESCE(pt.status, 'active'),
			COALESCE(pt.is_verified, true),
			COALESCE(pt.avatar_url, ''),
			COALESCE(pt.created_at, NOW()),
			COALESCE(pt.nip, ''),
			COALESCE(pt.jabatan, ''),
			'',
			COALESCE(pt.unit_kerja, ''),
			'' AS address,
			COALESCE(pt.permissions, '[]'::jsonb)
		FROM kemenag_ptsp.profiles_petugas pt
		WHERE pt.user_id::text = $1 OR pt.id::text = $1
		LIMIT 1
	`, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt,
		&u.Nip, &u.Jabatan, &u.PangkatGolongan, &u.UnitKerja, &u.Address, &permBytes,
	)

	if err == nil {
		if len(permBytes) > 0 {
			var permVal interface{}
			if err := json.Unmarshal(permBytes, &permVal); err == nil {
				u.Permissions = permVal
			}
		}
		return &u, nil
	}

	// 2. Cari di kemenag_ptsp.profiles_pegawai (Pegawai)
	err = r.db.QueryRow(ctx, `
		SELECT 
			pp.user_id::text,
			COALESCE(pp.nama, 'Pegawai'),
			COALESCE(pp.email, ''),
			COALESCE(pp.no_hp, ''),
			COALESCE(pp.role, 'pegawai'),
			'internal_pegawai',
			COALESCE(pp.status, 'active'),
			COALESCE(pp.is_verified, true),
			COALESCE(pp.avatar_url, ''),
			COALESCE(pp.created_at, NOW()),
			COALESCE(pp.nip, ''),
			COALESCE(pp.jabatan, ''),
			COALESCE(pp.pangkat_golongan, ''),
			COALESCE(pp.unit_kerja, ''),
			'' AS address,
			COALESCE(pp.permissions, '[]'::jsonb)
		FROM kemenag_ptsp.profiles_pegawai pp
		WHERE pp.user_id::text = $1 OR pp.id::text = $1
		LIMIT 1
	`, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt,
		&u.Nip, &u.Jabatan, &u.PangkatGolongan, &u.UnitKerja, &u.Address, &permBytes,
	)

	if err == nil {
		if len(permBytes) > 0 {
			var permVal interface{}
			if err := json.Unmarshal(permBytes, &permVal); err == nil {
				u.Permissions = permVal
			}
		}
		return &u, nil
	}

	// 3. Cari di kemenag_ptsp.profiles_pemohon (Masyarakat)
	err = r.db.QueryRow(ctx, `
		SELECT 
			pm.user_id::text,
			COALESCE(pm.nama, 'Pemohon'),
			COALESCE(pm.email, ''),
			COALESCE(pm.no_hp, ''),
			COALESCE(pm.role, 'user'),
			'eksternal_masyarakat',
			COALESCE(pm.status, 'active'),
			COALESCE(pm.is_verified, false),
			COALESCE(pm.avatar_url, ''),
			COALESCE(pm.created_at, NOW()),
			'', '', '', '',
			COALESCE(pm.alamat, '')
		FROM kemenag_ptsp.profiles_pemohon pm
		WHERE pm.user_id::text = $1 OR pm.id::text = $1
		LIMIT 1
	`, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.Phone, &u.Role, &u.UserType, &u.Status, &u.IsVerified, &u.AvatarURL, &u.CreatedAt,
		&u.Nip, &u.Jabatan, &u.PangkatGolongan, &u.UnitKerja, &u.Address,
	)

	if err == nil {
		u.Permissions = []string{}
		return &u, nil
	}

	// 4. Fallback aman untuk user Supabase lama jika belum termigrasi
	var authEmail string
	var metaBytes []byte
	err = r.db.QueryRow(ctx, `
		SELECT email, COALESCE(raw_user_meta_data::text, '{}') 
		FROM auth.users 
		WHERE id::text = $1
	`, id).Scan(&authEmail, &metaBytes)

	if err == nil {
		var meta map[string]interface{}
		_ = json.Unmarshal(metaBytes, &meta)

		fullName := "Pengguna PTSP"
		if name, ok := meta["full_name"].(string); ok && name != "" {
			fullName = name
		} else if name, ok := meta["name"].(string); ok && name != "" {
			fullName = name
		}

		phone := ""
		if p, ok := meta["phone"].(string); ok {
			phone = p
		}
		address := ""
		if a, ok := meta["address"].(string); ok {
			address = a
		}

		avatarUrl := ""
		if av, ok := meta["avatar_url"].(string); ok {
			avatarUrl = av
		} else if av, ok := meta["picture"].(string); ok {
			avatarUrl = av
		}

		superAdminEmail := os.Getenv("SUPER_ADMIN_EMAIL")
		if superAdminEmail == "" {
			superAdminEmail = os.Getenv("PUBLIC_SUPER_ADMIN_EMAIL")
		}
		isSuper := superAdminEmail != "" && strings.EqualFold(authEmail, superAdminEmail)

		if isSuper {
			roleStr := "super_admin"
			userTypeStr := "internal_admin"
			statusStr := "active"
			return &models.User{
				ID:          id,
				Name:        &fullName,
				Email:       &authEmail,
				Role:        roleStr,
				UserType:    userTypeStr,
				Status:      &statusStr,
				IsVerified:  true,
				AvatarURL:   &avatarUrl,
				Permissions: []string{"ringkasan", "pengajuan", "layanan", "dokumen_hasil", "surat_masuk", "surat_keluar", "buku_tamu", "janji_temu", "saran_pengaduan", "pemeliharaan_storage", "mode_pemeliharaan", "manajemen_pegawai", "e_laporan_kinerja", "pengguna"},
				CreatedAt:   time.Now(),
			}, nil
		}

		roleStr := "user"
		userTypeStr := "eksternal_masyarakat"
		statusStr := "active"
		return &models.User{
			ID:         id,
			Name:       &fullName,
			Email:      &authEmail,
			Phone:      &phone,
			Role:       roleStr,
			UserType:   userTypeStr,
			Status:     &statusStr,
			IsVerified: true,
			AvatarURL:  &avatarUrl,
			Address:    &address,
			CreatedAt:  time.Now(),
		}, nil
	}

	return nil, fmt.Errorf("user tidak ditemukan")
}

func (r *UserRepository) Update(ctx context.Context, id string, req models.UpdateUserRequest) error {
	if req.Permissions != nil {
		permJSON, err := json.Marshal(*req.Permissions)
		if err != nil {
			return err
		}
		// Coba update permissions di profiles_petugas
		tag, err := r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_petugas 
			SET permissions = $1, updated_at = NOW() 
			WHERE user_id::text = $2 OR id::text = $2
		`, string(permJSON), id)
		if err == nil && tag.RowsAffected() > 0 {
			return nil
		}

		// Jika bukan petugas, coba di profiles_pegawai
		_, err = r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_pegawai 
			SET permissions = $1, updated_at = NOW() 
			WHERE user_id::text = $2 OR id::text = $2
		`, string(permJSON), id)
		return err
	}

	// 1. Coba update di profiles_petugas
	tag, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_petugas 
		SET role = $1, status = $2, is_verified = $3, updated_at = NOW() 
		WHERE user_id::text = $4 OR id::text = $4
	`, req.Role, req.Status, req.IsVerified, id)

	if err == nil && tag.RowsAffected() > 0 {
		return nil
	}

	// 2. Coba update di profiles_pegawai
	tag, err = r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_pegawai 
		SET role = $1, status = $2, is_verified = $3, updated_at = NOW() 
		WHERE user_id::text = $4 OR id::text = $4
	`, req.Role, req.Status, req.IsVerified, id)

	if err == nil && tag.RowsAffected() > 0 {
		return nil
	}

	// 3. Update di profiles_pemohon
	_, err = r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_pemohon 
		SET role = $1, status = $2, is_verified = $3, updated_at = NOW() 
		WHERE user_id::text = $4 OR id::text = $4
	`, req.Role, req.Status, req.IsVerified, id)

	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, id string, req models.UpdateProfileRequest) error {
	nameInput := req.Name
	if nameInput == "" {
		nameInput = req.FullName
	}

	// 1. Coba update di profiles_petugas
	var countPetugas int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_petugas WHERE user_id::text = $1 OR id::text = $1`, id).Scan(&countPetugas)
	if countPetugas > 0 {
		query := `UPDATE kemenag_ptsp.profiles_petugas SET updated_at = NOW()`
		args := []interface{}{}
		argIdx := 1

		if nameInput != "" {
			query += fmt.Sprintf(", nama = $%d", argIdx)
			args = append(args, nameInput)
			argIdx++
		}
		if req.Phone != "" {
			query += fmt.Sprintf(", no_hp = $%d", argIdx)
			args = append(args, req.Phone)
			argIdx++
		}
		if req.AvatarURL != "" {
			query += fmt.Sprintf(", avatar_url = $%d", argIdx)
			args = append(args, req.AvatarURL)
			argIdx++
		}
		if req.Password != "" {
			if hashed, err := utils.HashPassword(req.Password); err == nil {
				query += fmt.Sprintf(", password_hash = $%d", argIdx)
				args = append(args, hashed)
				argIdx++
			}
		}
		query += fmt.Sprintf(" WHERE user_id::text = $%d OR id::text = $%d", argIdx, argIdx)
		args = append(args, id)

		_, err := r.db.Exec(ctx, query, args...)
		return err
	}

	// 2. Coba update di profiles_pegawai
	var countPegawai int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pegawai WHERE user_id::text = $1 OR id::text = $1`, id).Scan(&countPegawai)
	if countPegawai > 0 {
		query := `UPDATE kemenag_ptsp.profiles_pegawai SET updated_at = NOW()`
		args := []interface{}{}
		argIdx := 1

		if nameInput != "" {
			query += fmt.Sprintf(", nama = $%d", argIdx)
			args = append(args, nameInput)
			argIdx++
		}
		if req.Phone != "" {
			query += fmt.Sprintf(", no_hp = $%d", argIdx)
			args = append(args, req.Phone)
			argIdx++
		}
		if req.AvatarURL != "" {
			query += fmt.Sprintf(", avatar_url = $%d", argIdx)
			args = append(args, req.AvatarURL)
			argIdx++
		}
		if req.Password != "" {
			if hashed, err := utils.HashPassword(req.Password); err == nil {
				query += fmt.Sprintf(", password_hash = $%d", argIdx)
				args = append(args, hashed)
				argIdx++
			}
		}
		query += fmt.Sprintf(" WHERE user_id::text = $%d OR id::text = $%d", argIdx, argIdx)
		args = append(args, id)

		_, err := r.db.Exec(ctx, query, args...)
		return err
	}

	// 3. Coba update di profiles_pemohon
	query := `UPDATE kemenag_ptsp.profiles_pemohon SET updated_at = NOW()`
	args := []interface{}{}
	argIdx := 1

	if nameInput != "" {
		query += fmt.Sprintf(", nama = $%d", argIdx)
		args = append(args, nameInput)
		argIdx++
	}
	if req.Email != "" {
		query += fmt.Sprintf(", email = $%d", argIdx)
		args = append(args, req.Email)
		argIdx++
	}
	if req.Phone != "" {
		query += fmt.Sprintf(", no_hp = $%d", argIdx)
		args = append(args, req.Phone)
		argIdx++
	}
	if req.Address != "" {
		query += fmt.Sprintf(", alamat = $%d", argIdx)
		args = append(args, req.Address)
		argIdx++
	}
	if req.AvatarURL != "" {
		query += fmt.Sprintf(", avatar_url = $%d", argIdx)
		args = append(args, req.AvatarURL)
		argIdx++
	}
	if req.Password != "" {
		if hashed, err := utils.HashPassword(req.Password); err == nil {
			query += fmt.Sprintf(", password_hash = $%d", argIdx)
			args = append(args, hashed)
			argIdx++
		}
	}
	query += fmt.Sprintf(" WHERE user_id::text = $%d OR id::text = $%d", argIdx, argIdx)
	args = append(args, id)

	tag, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return err
	}
	if tag.RowsAffected() > 0 {
		return nil
	}

	// Auto-provisioning: jika data pemohon belum ada (misal pendaftaran ulang fresh pasca akun dihapus),
	// lakukan INSERT baru ke profiles_pemohon.
	var emailVal *string
	if req.Email != "" {
		emailVal = &req.Email
	}
	var passHash *string
	if req.Password != "" {
		if hashed, err := utils.HashPassword(req.Password); err == nil {
			passHash = &hashed
		}
	}
	_, err = r.db.Exec(ctx, `
		INSERT INTO kemenag_ptsp.profiles_pemohon (
			user_id, nama, email, no_hp, alamat, avatar_url, password_hash, metode_login, status, role, is_verified, created_at, updated_at
		) VALUES (
			NULLIF($1, '')::uuid, $2, $3, $4, $5, $6, $7, 'Google Akun', 'active', 'user', true, NOW(), NOW()
		)
		ON CONFLICT (user_id) DO UPDATE SET
			nama = EXCLUDED.nama,
			email = COALESCE(EXCLUDED.email, kemenag_ptsp.profiles_pemohon.email),
			no_hp = EXCLUDED.no_hp,
			alamat = EXCLUDED.alamat,
			avatar_url = EXCLUDED.avatar_url,
			password_hash = COALESCE(EXCLUDED.password_hash, kemenag_ptsp.profiles_pemohon.password_hash),
			updated_at = NOW()
	`, id, nameInput, emailVal, req.Phone, req.Address, req.AvatarURL, passHash)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.profiles_petugas WHERE user_id::text = $1 OR id::text = $1`, id)
	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.profiles_pegawai WHERE user_id::text = $1 OR id::text = $1`, id)
	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.profiles_pemohon WHERE user_id::text = $1 OR id::text = $1`, id)
	return nil
}

func (r *UserRepository) FindAuditLogs(ctx context.Context, limit int) ([]models.AuditLog, error) {
	rows, err := r.db.Query(ctx, `
		SELECT al.id, al.admin_id, al.action, al.entity_type, al.entity_id, al.created_at, 
		       COALESCE(pt.nama, COALESCE(pp.nama, 'Administrator')) AS admin_name
		FROM kemenag_ptsp.ptsp_audit_logs al
		LEFT JOIN kemenag_ptsp.profiles_petugas pt ON pt.user_id::text = al.admin_id OR pt.id::text = al.admin_id
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id::text = al.admin_id OR pp.id::text = al.admin_id
		ORDER BY al.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []models.AuditLog
	for rows.Next() {
		var l models.AuditLog
		if err := rows.Scan(&l.ID, &l.AdminID, &l.Action, &l.EntityType, &l.EntityID, &l.CreatedAt, &l.AdminName); err == nil {
			logs = append(logs, l)
		}
	}
	return logs, nil
}

// GlobalSearch melakukan pencarian lintas entitas (permohonan, profil pengguna dari 3 tabel, dan layanan).
func (r *UserRepository) GlobalSearch(ctx context.Context, q string) (*models.SearchResult, error) {
	searchTerm := strings.TrimSpace(q)
	result := &models.SearchResult{
		Requests: []models.SearchRequestItem{},
		Profiles: []models.SearchProfileItem{},
		Services: []models.SearchServiceItem{},
	}

	pattern := "%" + searchTerm + "%"

	// 1. Cari Permohonan Layanan
	reqRows, err := r.db.Query(ctx, `
		SELECT 
			r.id::text, 
			COALESCE(r.request_number, ''), 
			COALESCE(r.status, ''), 
			COALESCE(s.name, 'Layanan'),
			COALESCE(pm.nama, COALESCE(pp.nama, 'Pemohon')),
			COALESCE(r.created_at::text, '')
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.profiles_pemohon pm ON pm.user_id = r.user_id OR pm.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id = r.user_id OR pp.id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_petugas pt ON pt.user_id = r.user_id OR pt.id = r.user_id
		WHERE r.request_number ILIKE $1 
		   OR pm.nama ILIKE $1 
		   OR pp.nama ILIKE $1
		   OR pt.nama ILIKE $1
		ORDER BY r.created_at DESC
		LIMIT 10
	`, pattern)
	if err == nil {
		defer reqRows.Close()
		for reqRows.Next() {
			var item models.SearchRequestItem
			var sName, aName string
			if err := reqRows.Scan(&item.ID, &item.RequestNumber, &item.Status, &sName, &aName, &item.CreatedAt); err == nil {
				item.ServiceName = &sName
				item.ApplicantName = &aName
				result.Requests = append(result.Requests, item)
			}
		}
	}

	// 2. Cari Profil Pengguna (Petugas, Pegawai, Pemohon)
	profRows, err := r.db.Query(ctx, `
		SELECT user_id::text, nama, email, role, COALESCE(no_hp, '')
		FROM (
			SELECT user_id, nama, email, role, no_hp FROM kemenag_ptsp.profiles_petugas
			UNION ALL
			SELECT user_id, nama, email, role, no_hp FROM kemenag_ptsp.profiles_pegawai
			UNION ALL
			SELECT user_id, nama, email, role, no_hp FROM kemenag_ptsp.profiles_pemohon
		) all_p
		WHERE nama ILIKE $1 
		   OR email ILIKE $1 
		   OR no_hp ILIKE $1
		LIMIT 10
	`, pattern)
	if err == nil {
		defer profRows.Close()
		for profRows.Next() {
			var item models.SearchProfileItem
			var fName, eMail, phone string
			if err := profRows.Scan(&item.ID, &fName, &eMail, &item.Role, &phone); err == nil {
				item.FullName = &fName
				item.Email = &eMail
				item.Phone = &phone
				result.Profiles = append(result.Profiles, item)
			}
		}
	}

	// 3. Cari Layanan
	srvRows, err := r.db.Query(ctx, `
		SELECT id::text, name, slug
		FROM kemenag_ptsp.ptsp_services
		WHERE name ILIKE $1 OR slug ILIKE $1
		LIMIT 10
	`, pattern)
	if err == nil {
		defer srvRows.Close()
		for srvRows.Next() {
			var item models.SearchServiceItem
			if err := srvRows.Scan(&item.ID, &item.Name, &item.Slug); err == nil {
				result.Services = append(result.Services, item)
			}
		}
	}

	return result, nil
}

// ==========================================
// 1. SUB-MENU PETUGAS (kemenag_ptsp.profiles_petugas)
// ==========================================

func (r *UserRepository) FindPetugas(ctx context.Context, search, role, status string, limit, offset int) ([]models.PetugasUser, int, error) {
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(nama ILIKE $%d OR email ILIKE $%d OR COALESCE(nip, '') ILIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if role != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("role = $%d", argIdx))
		args = append(args, role)
		argIdx++
	}
	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM kemenag_ptsp.profiles_petugas WHERE %s", whereSQL)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 50
	}

	dataQuery := fmt.Sprintf(`
		SELECT 
			id::text,
			user_id::text,
			COALESCE(nama, ''),
			COALESCE(email, ''),
			COALESCE(no_hp, ''),
			COALESCE(nip, ''),
			COALESCE(jabatan, ''),
			COALESCE(unit_kerja, ''),
			COALESCE(role, 'admin_ptsp'),
			COALESCE(status, 'active'),
			COALESCE(is_verified, false),
			COALESCE(avatar_url, ''),
			COALESCE(permissions, '[]'::jsonb),
			COALESCE(created_at, NOW()),
			COALESCE(updated_at, NOW())
		FROM kemenag_ptsp.profiles_petugas
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []models.PetugasUser
	for rows.Next() {
		var p models.PetugasUser
		var permBytes []byte
		if err := rows.Scan(
			&p.ID, &p.UserID, &p.Nama, &p.Email, &p.NoHp, &p.Nip,
			&p.Jabatan, &p.UnitKerja, &p.Role, &p.Status, &p.IsVerified,
			&p.AvatarURL, &permBytes, &p.CreatedAt, &p.UpdatedAt,
		); err == nil {
			if len(permBytes) > 0 {
				var permVal interface{}
				if err := json.Unmarshal(permBytes, &permVal); err == nil {
					p.Permissions = permVal
				}
			}
			result = append(result, p)
		}
	}
	return result, total, nil
}

// CreatePetugas menambahkan akun petugas admin baru ke kemenag_ptsp.profiles_petugas.
func (r *UserRepository) CreatePetugas(ctx context.Context, req models.CreatePetugasRequest) (*models.PetugasUser, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}
	role := req.Role
	if role == "" {
		role = "admin_ptsp"
	}

	passHash := ""
	if req.Password != "" {
		h, err := utils.HashPassword(req.Password)
		if err == nil {
			passHash = h
		}
	}

	permsJSON := []byte("[]")
	if req.Permissions != nil {
		if b, err := json.Marshal(*req.Permissions); err == nil {
			permsJSON = b
		}
	}

	query := `
		INSERT INTO kemenag_ptsp.profiles_petugas (
			user_id, nama, email, no_hp, nip, jabatan, unit_kerja, role, status, is_verified, permissions, password_hash, created_at, updated_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, NOW(), NOW()
		)
		RETURNING
			id::text, user_id::text, COALESCE(nama, ''), COALESCE(email, ''), COALESCE(no_hp, ''),
			COALESCE(nip, ''), COALESCE(jabatan, ''), COALESCE(unit_kerja, ''), COALESCE(role, 'admin_ptsp'),
			COALESCE(status, 'active'), COALESCE(is_verified, true), COALESCE(avatar_url, ''),
			COALESCE(permissions, '[]'::jsonb), created_at, updated_at
	`

	var p models.PetugasUser
	var permBytes []byte

	err := r.db.QueryRow(ctx, query,
		req.Nama,
		strings.ToLower(strings.TrimSpace(req.Email)),
		req.NoHp,
		req.Nip,
		req.Jabatan,
		req.UnitKerja,
		role,
		status,
		req.IsVerified,
		string(permsJSON),
		passHash,
	).Scan(
		&p.ID, &p.UserID, &p.Nama, &p.Email, &p.NoHp, &p.Nip,
		&p.Jabatan, &p.UnitKerja, &p.Role, &p.Status, &p.IsVerified,
		&p.AvatarURL, &permBytes, &p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if len(permBytes) > 0 {
		var permVal interface{}
		if err := json.Unmarshal(permBytes, &permVal); err == nil {
			p.Permissions = permVal
		}
	}

	return &p, nil
}

func (r *UserRepository) UpdatePetugas(ctx context.Context, id string, req models.UpdatePetugasRequest) error {
	setParts := []string{"updated_at = NOW()"}
	args := []interface{}{}
	argIdx := 1

	if req.Nama != "" {
		setParts = append(setParts, fmt.Sprintf("nama = $%d", argIdx))
		args = append(args, req.Nama)
		argIdx++
	}
	if req.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIdx))
		args = append(args, req.Role)
		argIdx++
	}
	if req.Status != "" {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, req.Status)
		argIdx++
	}
	if req.IsVerified != nil {
		setParts = append(setParts, fmt.Sprintf("is_verified = $%d", argIdx))
		args = append(args, *req.IsVerified)
		argIdx++
	}
	if req.Nip != "" {
		setParts = append(setParts, fmt.Sprintf("nip = $%d", argIdx))
		args = append(args, req.Nip)
		argIdx++
	}
	if req.Jabatan != "" {
		setParts = append(setParts, fmt.Sprintf("jabatan = $%d", argIdx))
		args = append(args, req.Jabatan)
		argIdx++
	}
	if req.UnitKerja != "" {
		setParts = append(setParts, fmt.Sprintf("unit_kerja = $%d", argIdx))
		args = append(args, req.UnitKerja)
		argIdx++
	}
	if req.NoHp != "" {
		setParts = append(setParts, fmt.Sprintf("no_hp = $%d", argIdx))
		args = append(args, req.NoHp)
		argIdx++
	}
	if req.Permissions != nil {
		permBytes, _ := json.Marshal(*req.Permissions)
		setParts = append(setParts, fmt.Sprintf("permissions = $%d::jsonb", argIdx))
		args = append(args, string(permBytes))
		argIdx++
	}

	query := fmt.Sprintf("UPDATE kemenag_ptsp.profiles_petugas SET %s WHERE id::text = $%d OR user_id::text = $%d",
		strings.Join(setParts, ", "), argIdx, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(ctx, query, args...)
	return err
}

func (r *UserRepository) VerifyPetugas(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_petugas 
		SET is_verified = true, status = 'active', updated_at = NOW() 
		WHERE id::text = $1 OR user_id::text = $1
	`, id)
	return err
}

func (r *UserRepository) DeletePetugas(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM kemenag_ptsp.profiles_petugas 
		WHERE id::text = $1 OR user_id::text = $1
	`, id)
	return err
}

// ==========================================
// 2. SUB-MENU PEGAWAI (kemenag_ptsp.profiles_pegawai)
// SINKRONISASI OTOMATIS KE kemenag_ptsp.ptsp_data_cuti_pegawai
// ==========================================

func (r *UserRepository) FindPegawai(ctx context.Context, search, unitKerja, status string, limit, offset int) ([]models.PegawaiUser, int, error) {
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(pp.nama ILIKE $%d OR COALESCE(pp.nip, '') ILIKE $%d OR COALESCE(pp.jabatan, '') ILIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if unitKerja != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("pp.unit_kerja = $%d", argIdx))
		args = append(args, unitKerja)
		argIdx++
	}
	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("pp.status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM kemenag_ptsp.profiles_pegawai pp WHERE %s", whereSQL)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 50
	}

	dataQuery := fmt.Sprintf(`
		SELECT 
			pp.id::text,
			pp.user_id::text,
			COALESCE(pp.nama, ''),
			COALESCE(pp.nip, ''),
			COALESCE(pp.jabatan, ''),
			COALESCE(pp.pangkat_golongan, ''),
			COALESCE(pp.unit_kerja, ''),
			COALESCE(pp.no_hp, ''),
			COALESCE(pp.email, ''),
			COALESCE(pp.status, 'active'),
			COALESCE(pp.role, 'pegawai'),
			COALESCE(pp.tipe_pejabat, ''),
			COALESCE(pp.order_index, 0),
			COALESCE(pp.avatar_url, ''),
			COALESCE(pp.is_verified, true),
			(cp.id IS NOT NULL) AS is_in_cuti,
			COALESCE(pp.created_at, NOW()),
			COALESCE(pp.updated_at, NOW())
		FROM kemenag_ptsp.profiles_pegawai pp
		LEFT JOIN kemenag_ptsp.ptsp_data_cuti_pegawai cp 
		       ON cp.nip = pp.nip AND pp.nip IS NOT NULL AND pp.nip != ''
		WHERE %s
		ORDER BY COALESCE(pp.order_index, 999) ASC, pp.nama ASC
		LIMIT $%d OFFSET $%d
	`, whereSQL, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []models.PegawaiUser
	for rows.Next() {
		var p models.PegawaiUser
		var uid *string
		if err := rows.Scan(
			&p.ID, &uid, &p.Nama, &p.Nip, &p.Jabatan, &p.PangkatGolongan,
			&p.UnitKerja, &p.NoHp, &p.Email, &p.Status, &p.Role, &p.TipePejabat,
			&p.OrderIndex, &p.AvatarURL, &p.IsVerified, &p.IsInCuti,
			&p.CreatedAt, &p.UpdatedAt,
		); err == nil {
			p.UserID = uid
			result = append(result, p)
		}
	}
	return result, total, nil
}

// CreatePegawai menambahkan data pegawai baru ke profiles_pegawai
// dan OTOMATIS melakukan sinkronisasi entri ke tabel kemenag_ptsp.ptsp_data_cuti_pegawai.
func (r *UserRepository) CreatePegawai(ctx context.Context, req models.CreatePegawaiRequest) (*models.PegawaiUser, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}

	var p models.PegawaiUser
	var uid *string

	err := r.db.QueryRow(ctx, `
		INSERT INTO kemenag_ptsp.profiles_pegawai (
			nama, nip, jabatan, pangkat_golongan, unit_kerja, no_hp, email, status, role, tipe_pejabat, is_verified, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, 'pegawai', $9, true, NOW(), NOW()
		)
		RETURNING 
			id::text, user_id::text, nama, COALESCE(nip, ''), COALESCE(jabatan, ''),
			COALESCE(pangkat_golongan, ''), COALESCE(unit_kerja, ''), COALESCE(no_hp, ''),
			COALESCE(email, ''), COALESCE(status, 'active'), COALESCE(role, 'pegawai'),
			COALESCE(tipe_pejabat, ''), COALESCE(order_index, 0), COALESCE(avatar_url, ''),
			COALESCE(is_verified, true), created_at, updated_at
	`, req.Nama, req.Nip, req.Jabatan, req.PangkatGolongan, req.UnitKerja, req.NoHp, req.Email, status, req.TipePejabat).
		Scan(
			&p.ID, &uid, &p.Nama, &p.Nip, &p.Jabatan, &p.PangkatGolongan,
			&p.UnitKerja, &p.NoHp, &p.Email, &p.Status, &p.Role, &p.TipePejabat,
			&p.OrderIndex, &p.AvatarURL, &p.IsVerified, &p.CreatedAt, &p.UpdatedAt,
		)

	if err != nil {
		return nil, err
	}
	p.UserID = uid

	// --- OTOMATIS SINKRONISASI KE TABEL MANAJEMEN CUTI ---
	if req.Nip != "" {
		_, _ = r.db.Exec(ctx, `
			INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (
				id, nama, nip, jabatan, unit_kerja, created_at, updated_at
			) VALUES (
				gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()
			)
			ON CONFLICT (nip) DO UPDATE SET
				nama = EXCLUDED.nama,
				jabatan = EXCLUDED.jabatan,
				unit_kerja = EXCLUDED.unit_kerja,
				updated_at = NOW()
		`, req.Nama, req.Nip, req.Jabatan, req.UnitKerja)
		p.IsInCuti = true
	}

	return &p, nil
}

// UpdatePegawai memperbarui data pegawai di profiles_pegawai
// dan OTOMATIS memperbarui data di tabel kemenag_ptsp.ptsp_data_cuti_pegawai.
func (r *UserRepository) UpdatePegawai(ctx context.Context, id string, req models.UpdatePegawaiRequest) error {
	// Ambil data NIP lama terlebih dahulu untuk memastikan sinkronisasi perubahan NIP
	var oldNip string
	_ = r.db.QueryRow(ctx, `
		SELECT COALESCE(nip, '') FROM kemenag_ptsp.profiles_pegawai 
		WHERE id::text = $1 OR user_id::text = $1
	`, id).Scan(&oldNip)

	_, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_pegawai
		SET nama = $1, nip = $2, jabatan = $3, pangkat_golongan = $4, unit_kerja = $5,
		    no_hp = $6, email = $7, status = $8, tipe_pejabat = $9, updated_at = NOW()
		WHERE id::text = $10 OR user_id::text = $10
	`, req.Nama, req.Nip, req.Jabatan, req.PangkatGolongan, req.UnitKerja, req.NoHp, req.Email, req.Status, req.TipePejabat, id)

	if err != nil {
		return err
	}

	// --- OTOMATIS SINKRONISASI KE TABEL MANAJEMEN CUTI ---
	targetNip := strings.TrimSpace(req.Nip)
	cleanOldNip := strings.TrimSpace(oldNip)

	if targetNip != "" {
		// Jika NIP berubah dan NIP lama ada, update entri yang mengacu pada oldNip
		if cleanOldNip != "" && cleanOldNip != targetNip {
			_, _ = r.db.Exec(ctx, `
				UPDATE kemenag_ptsp.ptsp_data_cuti_pegawai
				SET nama = $1, nip = $2, jabatan = $3, unit_kerja = $4, updated_at = NOW()
				WHERE TRIM(nip) = TRIM($5)
			`, req.Nama, targetNip, req.Jabatan, req.UnitKerja, cleanOldNip)
		} else {
			// Upsert ke data cuti
			_, _ = r.db.Exec(ctx, `
				INSERT INTO kemenag_ptsp.ptsp_data_cuti_pegawai (
					id, nama, nip, jabatan, unit_kerja, created_at, updated_at
				) VALUES (
					gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()
				)
				ON CONFLICT (nip) DO UPDATE SET
					nama = EXCLUDED.nama,
					jabatan = EXCLUDED.jabatan,
					unit_kerja = EXCLUDED.unit_kerja,
					updated_at = NOW()
			`, req.Nama, targetNip, req.Jabatan, req.UnitKerja)
		}
	}

	return nil
}

// DeletePegawai menghapus pegawai dari profiles_pegawai
// dan OTOMATIS membersihkan / menyinkronkan data di ptsp_data_cuti_pegawai jika tidak ada riwayat cuti.
func (r *UserRepository) DeletePegawai(ctx context.Context, id string) error {
	var nip string
	_ = r.db.QueryRow(ctx, `
		SELECT COALESCE(nip, '') FROM kemenag_ptsp.profiles_pegawai 
		WHERE id::text = $1 OR user_id::text = $1
	`, id).Scan(&nip)

	_, err := r.db.Exec(ctx, `
		DELETE FROM kemenag_ptsp.profiles_pegawai 
		WHERE id::text = $1 OR user_id::text = $1
	`, id)

	if err != nil {
		return err
	}

	// Sinkronisasi otomatis penghapusan di ptsp_data_cuti_pegawai (aman: hanya hapus jika belum memiliki relasi rekap cuti tahunan)
	if nip != "" {
		_, _ = r.db.Exec(ctx, `
			DELETE FROM kemenag_ptsp.ptsp_data_cuti_pegawai 
			WHERE nip = $1 
			  AND NOT EXISTS (
				SELECT 1 FROM kemenag_ptsp.ptsp_rekap_cuti_tahunan 
				WHERE pegawai_id = ptsp_data_cuti_pegawai.id
			  )
		`, nip)
	}

	return nil
}

// ==========================================
// 3. SUB-MENU PEMOHON (kemenag_ptsp.profiles_pemohon)
// ==========================================

func (r *UserRepository) FindPemohon(ctx context.Context, search, metodeLogin, status string, limit, offset int) ([]models.PemohonUser, int, error) {
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(nama ILIKE $%d OR COALESCE(email, '') ILIKE $%d OR COALESCE(no_hp, '') ILIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if metodeLogin != "" {
		if strings.EqualFold(metodeLogin, "google") {
			whereClauses = append(whereClauses, fmt.Sprintf("metode_login ILIKE $%d", argIdx))
			args = append(args, "%google%")
			argIdx++
		} else if strings.EqualFold(metodeLogin, "whatsapp") || strings.EqualFold(metodeLogin, "phone") {
			whereClauses = append(whereClauses, fmt.Sprintf("(metode_login ILIKE $%d OR metode_login ILIKE $%d)", argIdx, argIdx+1))
			args = append(args, "%whatsapp%", "%ptsp%")
			argIdx += 2
		} else {
			whereClauses = append(whereClauses, fmt.Sprintf("metode_login = $%d", argIdx))
			args = append(args, metodeLogin)
			argIdx++
		}
	}
	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon WHERE %s", whereSQL)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 50
	}

	dataQuery := fmt.Sprintf(`
		SELECT 
			id::text,
			user_id::text,
			COALESCE(nama, ''),
			COALESCE(email, ''),
			COALESCE(no_hp, ''),
			COALESCE(alamat, ''),
			COALESCE(metode_login, 'Google Akun'),
			COALESCE(status, 'active'),
			COALESCE(role, 'user'),
			COALESCE(avatar_url, ''),
			COALESCE(is_verified, false),
			COALESCE(created_at, NOW()),
			COALESCE(updated_at, NOW())
		FROM kemenag_ptsp.profiles_pemohon
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []models.PemohonUser
	for rows.Next() {
		var p models.PemohonUser
		var uid *string
		if err := rows.Scan(
			&p.ID, &uid, &p.Nama, &p.Email, &p.NoHp, &p.Alamat,
			&p.MetodeLogin, &p.Status, &p.Role, &p.AvatarURL,
			&p.IsVerified, &p.CreatedAt, &p.UpdatedAt,
		); err == nil {
			p.UserID = uid
			result = append(result, p)
		}
	}
	return result, total, nil
}

func (r *UserRepository) UpdatePemohon(ctx context.Context, id string, req models.UpdatePemohonRequest) error {
	setParts := []string{"updated_at = NOW()"}
	args := []interface{}{}
	argIdx := 1

	if req.Nama != "" {
		setParts = append(setParts, fmt.Sprintf("nama = $%d", argIdx))
		args = append(args, req.Nama)
		argIdx++
	}
	if req.NoHp != "" {
		setParts = append(setParts, fmt.Sprintf("no_hp = $%d", argIdx))
		args = append(args, req.NoHp)
		argIdx++
	}
	if req.Alamat != "" {
		setParts = append(setParts, fmt.Sprintf("alamat = $%d", argIdx))
		args = append(args, req.Alamat)
		argIdx++
	}
	if req.Status != "" {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, req.Status)
		argIdx++
	}

	query := fmt.Sprintf("UPDATE kemenag_ptsp.profiles_pemohon SET %s WHERE id::text = $%d OR user_id::text = $%d",
		strings.Join(setParts, ", "), argIdx, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(ctx, query, args...)
	return err
}

func (r *UserRepository) DeletePemohon(ctx context.Context, id string) error {
	// 1. Bersihkan notifikasi terkait pemohon ini
	_, _ = r.db.Exec(ctx, `
		DELETE FROM kemenag_ptsp.ptsp_notifications 
		WHERE user_id::text = $1
	`, id)

	// 2. Hapus data profil pemohon
	_, err := r.db.Exec(ctx, `
		DELETE FROM kemenag_ptsp.profiles_pemohon 
		WHERE id::text = $1 OR user_id::text = $1
	`, id)
	return err
}

// ==========================================
// 4. STATISTIK PENGGUNA (DASHBOARD)
// ==========================================

func (r *UserRepository) GetUserStats(ctx context.Context) (*models.UserStats, error) {
	stats := &models.UserStats{}

	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_petugas`).Scan(&stats.TotalPetugas)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_petugas WHERE is_verified = false`).Scan(&stats.PendingPetugas)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pegawai`).Scan(&stats.TotalPegawai)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon`).Scan(&stats.TotalPemohon)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon WHERE metode_login ILIKE '%google%'`).Scan(&stats.PemohonGoogle)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon WHERE metode_login ILIKE '%whatsapp%' OR metode_login ILIKE '%ptsp%'`).Scan(&stats.PemohonWhatsApp)

	return stats, nil
}


