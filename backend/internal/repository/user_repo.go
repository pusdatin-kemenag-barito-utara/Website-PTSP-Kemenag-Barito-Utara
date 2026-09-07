package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// UserRepository menangani operasi DB pengguna dari skema khusus kemenag_ptsp:
// - kemenag_ptsp.profiles_pegawai (Pegawai & Petugas Admin)
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
			pp.user_id::text AS id,
			COALESCE(pp.nama, 'Pegawai') AS name,
			COALESCE(pp.email, '') AS email,
			COALESCE(pp.no_hp, '') AS phone,
			COALESCE(pp.role, 'pegawai') AS role,
			CASE 
				WHEN pp.role IN ('super_admin', 'admin_ptsp', 'kepala_kantor', 'kasubag_tu', 'admin_sub_bagian_tata_usaha', 'admin_pendidikan_madrasah', 'admin_pendidikan_agama_islam', 'admin_pendidikan_diniyah_pondok_pesantren', 'admin_bimbingan_masyarakat_islam', 'admin_bimbingan_masyarakat_kristen_katolik', 'admin_penyelenggara_zakat_wakaf', 'admin_penyelenggara_hindu') THEN 'internal_admin'
				ELSE 'internal_pegawai'
			END AS user_type,
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

	// 1. Cari di kemenag_ptsp.profiles_pegawai (Pegawai & Petugas Admin)
	err := r.db.QueryRow(ctx, `
		SELECT 
			pp.user_id::text,
			COALESCE(pp.nama, 'Pegawai'),
			COALESCE(pp.email, ''),
			COALESCE(pp.no_hp, ''),
			COALESCE(pp.role, 'pegawai'),
			CASE 
				WHEN pp.role IN ('super_admin', 'admin_ptsp', 'kepala_kantor', 'kasubag_tu', 'admin_sub_bagian_tata_usaha', 'admin_pendidikan_madrasah', 'admin_pendidikan_agama_islam', 'admin_pendidikan_diniyah_pondok_pesantren', 'admin_bimbingan_masyarakat_islam', 'admin_bimbingan_masyarakat_kristen_katolik', 'admin_penyelenggara_zakat_wakaf', 'admin_penyelenggara_hindu') THEN 'internal_admin'
				ELSE 'internal_pegawai'
			END,
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

	// 2. Jika tidak ada di profiles_pegawai, cari di kemenag_ptsp.profiles_pemohon (Masyarakat)
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

	// 3. Fallback: Cari di auth.users (misal user baru login via OAuth atau magiclink)
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

		isSuper := strings.EqualFold(authEmail, "baritoutara@kemenag.go.id")
		isPegawai := strings.HasSuffix(strings.ToLower(authEmail), "@kemenag.go.id") || meta["role"] == "pegawai"

		if isSuper {
			// Super admin auto-provision ke profiles_pegawai
			_, _ = r.db.Exec(ctx, `
				INSERT INTO kemenag_ptsp.profiles_pegawai (
					id, user_id, nama, nip, jabatan, pangkat_golongan, unit_kerja, no_hp, email, status, role, avatar_url, is_verified, permissions, created_at, updated_at
				) VALUES (
					$1, $1, $2, '-', 'Super Administrator', '-', 'Kantor Kementerian Agama Kabupaten Barito Utara', '-', $3, 'active', 'super_admin', $4, true, 
					'["ringkasan","pengajuan","layanan","dokumen_hasil","surat_masuk","surat_keluar","buku_tamu","janji_temu","saran_pengaduan","pemeliharaan_storage","mode_pemeliharaan","manajemen_pegawai","e_laporan_kinerja","pengguna"]'::jsonb,
					NOW(), NOW()
				) ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', email = EXCLUDED.email
			`, id, fullName, authEmail, avatarUrl)

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
				Permissions: []string{"ringkasan","pengajuan","layanan","dokumen_hasil","surat_masuk","surat_keluar","buku_tamu","janji_temu","saran_pengaduan","pemeliharaan_storage","mode_pemeliharaan","manajemen_pegawai","e_laporan_kinerja","pengguna"},
				CreatedAt:   time.Now(),
			}, nil
		}

		if isPegawai {
			nipVal := "-"
			if nipMeta, ok := meta["nip"].(string); ok && nipMeta != "" {
				nipVal = nipMeta
			} else if strings.Contains(authEmail, "@") {
				nipVal = strings.Split(authEmail, "@")[0]
			}

			// Pegawai auto-provision ke profiles_pegawai
			_, _ = r.db.Exec(ctx, `
				INSERT INTO kemenag_ptsp.profiles_pegawai (
					id, user_id, nama, nip, jabatan, pangkat_golongan, unit_kerja, no_hp, email, status, role, avatar_url, is_verified, permissions, created_at, updated_at
				) VALUES (
					$1, $1, $2, $3, 'Pegawai', '-', 'Kantor Kementerian Agama Kabupaten Barito Utara', $4, $5, 'active', 'pegawai', $6, true,
					'["e_laporan_kinerja"]'::jsonb,
					NOW(), NOW()
				) ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email
			`, id, fullName, nipVal, phone, authEmail, avatarUrl)

			roleStr := "pegawai"
			userTypeStr := "internal_pegawai"
			statusStr := "active"
			return &models.User{
				ID:          id,
				Name:        &fullName,
				Email:       &authEmail,
				Phone:       &phone,
				Role:        roleStr,
				UserType:    userTypeStr,
				Status:      &statusStr,
				IsVerified:  true,
				AvatarURL:   &avatarUrl,
				Nip:         &nipVal,
				Permissions: []string{"e_laporan_kinerja"},
				CreatedAt:   time.Now(),
			}, nil
		}

		// User masyarakat auto-provision ke profiles_pemohon
		_, _ = r.db.Exec(ctx, `
			INSERT INTO kemenag_ptsp.profiles_pemohon (
				id, user_id, nama, email, no_hp, alamat, metode_login, status, role, avatar_url, is_verified, created_at, updated_at
			) VALUES (
				$1, $1, $2, $3, $4, $5, 'oauth', 'active', 'user', $6, true, NOW(), NOW()
			) ON CONFLICT (user_id) DO UPDATE SET
				nama = EXCLUDED.nama,
				email = EXCLUDED.email
		`, id, fullName, authEmail, phone, address, avatarUrl)

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

	fmt.Printf("[DEBUG] FindByID not found for id %s\n", id)
	return nil, fmt.Errorf("user tidak ditemukan")
}

func (r *UserRepository) Update(ctx context.Context, id string, req models.UpdateUserRequest) error {
	if req.Permissions != nil {
		permJSON, err := json.Marshal(*req.Permissions)
		if err != nil {
			return err
		}
		_, err = r.db.Exec(ctx, `
			UPDATE kemenag_ptsp.profiles_pegawai 
			SET permissions = $1, updated_at = NOW() 
			WHERE user_id::text = $2 OR id::text = $2
		`, string(permJSON), id)
		return err
	}

	// Coba update di profiles_pegawai
	tag, err := r.db.Exec(ctx, `
		UPDATE kemenag_ptsp.profiles_pegawai 
		SET role = $1, status = $2, is_verified = $3, updated_at = NOW() 
		WHERE user_id::text = $4 OR id::text = $4
	`, req.Role, req.Status, req.IsVerified, id)

	if err == nil && tag.RowsAffected() > 0 {
		return nil
	}

	// Jika tidak di profiles_pegawai, update di profiles_pemohon
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

	// 1. Coba update di profiles_pegawai
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
		query += fmt.Sprintf(" WHERE user_id::text = $%d OR id::text = $%d", argIdx, argIdx)
		args = append(args, id)

		_, err := r.db.Exec(ctx, query, args...)
		return err
	}

	// 2. Coba update atau upsert di profiles_pemohon
	var countPemohon int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.profiles_pemohon WHERE user_id::text = $1 OR id::text = $1`, id).Scan(&countPemohon)

	if countPemohon == 0 {
		var emailVal string
		_ = r.db.QueryRow(ctx, `SELECT email FROM auth.users WHERE id::text = $1`, id).Scan(&emailVal)

		if nameInput == "" {
			nameInput = "Pemohon"
		}

		_, err := r.db.Exec(ctx, `
			INSERT INTO kemenag_ptsp.profiles_pemohon (
				id, user_id, nama, email, no_hp, alamat, metode_login, status, role, avatar_url, is_verified, created_at, updated_at
			) VALUES (
				$1, $1, $2, $3, $4, $5, 'general', 'active', 'user', $6, true, NOW(), NOW()
			) ON CONFLICT (user_id) DO UPDATE SET
				nama = EXCLUDED.nama,
				no_hp = EXCLUDED.no_hp,
				alamat = EXCLUDED.alamat,
				avatar_url = EXCLUDED.avatar_url,
				updated_at = NOW()
		`, id, nameInput, emailVal, req.Phone, req.Address, req.AvatarURL)
		return err
	}

	query := `UPDATE kemenag_ptsp.profiles_pemohon SET updated_at = NOW()`
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
	query += fmt.Sprintf(" WHERE user_id::text = $%d OR id::text = $%d", argIdx, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(ctx, query, args...)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.profiles_pegawai WHERE user_id::text = $1 OR id::text = $1`, id)
	_, _ = r.db.Exec(ctx, `DELETE FROM kemenag_ptsp.profiles_pemohon WHERE user_id::text = $1 OR id::text = $1`, id)
	return nil
}

func (r *UserRepository) FindAuditLogs(ctx context.Context, limit int) ([]models.AuditLog, error) {
	rows, err := r.db.Query(ctx, `
		SELECT al.id, al.admin_id, al.action, al.entity_type, al.entity_id, al.created_at, 
		       COALESCE(pp.nama, 'Administrator') AS admin_name
		FROM kemenag_ptsp.ptsp_audit_logs al
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id = al.admin_id
		ORDER BY al.created_at DESC LIMIT $1
	`, limit)
	if err != nil {
		return []models.AuditLog{}, nil
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

	// 1. Cari permohonan layanan
	reqRows, _ := r.db.Query(ctx, `
		SELECT r.id, r.request_number, r.status, r.created_at, s.name AS service_name, 
		       COALESCE(pm.nama, pp.nama, 'Pemohon') AS applicant_name
		FROM kemenag_ptsp.ptsp_service_requests r
		LEFT JOIN kemenag_ptsp.ptsp_services s ON s.id = r.service_id
		LEFT JOIN kemenag_ptsp.profiles_pemohon pm ON pm.user_id = r.user_id
		LEFT JOIN kemenag_ptsp.profiles_pegawai pp ON pp.user_id = r.user_id
		WHERE r.request_number ILIKE $1 OR s.name ILIKE $1 OR pm.nama ILIKE $1 OR pp.nama ILIKE $1
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

	// 2. Cari profil pengguna (Pegawai & Pemohon)
	profRows, _ := r.db.Query(ctx, `
		SELECT user_id::text, COALESCE(nama, 'Pegawai'), COALESCE(email, ''), COALESCE(role, 'pegawai'), COALESCE(no_hp, '') 
		FROM kemenag_ptsp.profiles_pegawai
		WHERE nama ILIKE $1 OR email ILIKE $1 OR nip ILIKE $1 OR no_hp ILIKE $1
		UNION ALL
		SELECT user_id::text, COALESCE(nama, 'Pemohon'), COALESCE(email, ''), COALESCE(role, 'user'), COALESCE(no_hp, '') 
		FROM kemenag_ptsp.profiles_pemohon
		WHERE nama ILIKE $1 OR email ILIKE $1 OR no_hp ILIKE $1
		LIMIT 6
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

	// 3. Cari layanan
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
