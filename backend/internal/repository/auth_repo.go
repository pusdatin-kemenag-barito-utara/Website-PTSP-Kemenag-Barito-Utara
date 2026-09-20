package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"ptsp-kemenag-backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AuthRepository menangani operasi database yang berhubungan dengan kredensial & otentikasi.
type AuthRepository struct {
	db *pgxpool.Pool
}

func NewAuthRepository(db *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{db: db}
}

// FindPetugasByEmail mencari akun admin/petugas di kemenag_ptsp.profiles_petugas berdasarkan email.
func (r *AuthRepository) FindPetugasByEmail(ctx context.Context, email string) (*models.AuthUser, string, error) {
	query := `
		SELECT 
			id::text,
			user_id::text,
			nama,
			email,
			COALESCE(no_hp, ''),
			COALESCE(nip, ''),
			COALESCE(role, 'admin_ptsp'),
			COALESCE(jabatan, ''),
			COALESCE(unit_kerja, ''),
			COALESCE(status, 'active'),
			COALESCE(is_verified, false),
			COALESCE(permissions, '[]'::jsonb),
			COALESCE(avatar_url, ''),
			COALESCE(password_hash, '')
		FROM kemenag_ptsp.profiles_petugas
		WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
		LIMIT 1
	`

	var user models.AuthUser
	var permsBytes []byte
	var passwordHash string

	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Phone,
		&user.NIP,
		&user.Role,
		&user.Jabatan,
		&user.UnitKerja,
		&user.Status,
		&user.IsVerified,
		&permsBytes,
		&user.AvatarURL,
		&passwordHash,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, "", errors.New("akun petugas tidak ditemukan")
		}
		return nil, "", fmt.Errorf("gagal query petugas: %w", err)
	}

	user.UserType = "internal_admin"
	user.Permissions = []string{}
	if len(permsBytes) > 0 {
		_ = json.Unmarshal(permsBytes, &user.Permissions)
	}

	return &user, passwordHash, nil
}

// FindPegawaiByNIPOrEmail mencari data pegawai di kemenag_ptsp.profiles_pegawai.
func (r *AuthRepository) FindPegawaiByNIPOrEmail(ctx context.Context, identifier string) (*models.AuthUser, string, error) {
	cleanID := strings.TrimSpace(identifier)
	query := `
		SELECT 
			id::text,
			user_id::text,
			nama,
			COALESCE(email, ''),
			COALESCE(no_hp, ''),
			COALESCE(nip, ''),
			COALESCE(role, 'pegawai'),
			COALESCE(jabatan, ''),
			COALESCE(unit_kerja, ''),
			COALESCE(status, 'active'),
			COALESCE(is_verified, true),
			COALESCE(permissions, '[]'::jsonb),
			COALESCE(avatar_url, ''),
			COALESCE(password_hash, '')
		FROM kemenag_ptsp.profiles_pegawai
		WHERE nip = $1 OR LOWER(TRIM(email)) = LOWER($1)
		LIMIT 1
	`

	var user models.AuthUser
	var permsBytes []byte
	var passwordHash string

	err := r.db.QueryRow(ctx, query, cleanID).Scan(
		&user.ID,
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Phone,
		&user.NIP,
		&user.Role,
		&user.Jabatan,
		&user.UnitKerja,
		&user.Status,
		&user.IsVerified,
		&permsBytes,
		&user.AvatarURL,
		&passwordHash,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, "", errors.New("data pegawai tidak ditemukan")
		}
		return nil, "", fmt.Errorf("gagal query pegawai: %w", err)
	}

	user.UserType = "internal_pegawai"
	user.Permissions = []string{}
	if len(permsBytes) > 0 {
		_ = json.Unmarshal(permsBytes, &user.Permissions)
	}

	return &user, passwordHash, nil
}

// FindPemohonByPhoneOrEmail mencari akun pemohon di kemenag_ptsp.profiles_pemohon.
func (r *AuthRepository) FindPemohonByPhoneOrEmail(ctx context.Context, identifier string) (*models.AuthUser, string, error) {
	cleanID := strings.TrimSpace(identifier)

	// Normalisasi nomor telepon ke variasi 08xxx dan 62xxx
	digits := ""
	for _, ch := range cleanID {
		if ch >= '0' && ch <= '9' {
			digits += string(ch)
		}
	}
	phone0 := cleanID
	phone62 := cleanID
	if strings.HasPrefix(digits, "62") {
		phone62 = digits
		phone0 = "0" + digits[2:]
	} else if strings.HasPrefix(digits, "0") {
		phone0 = digits
		phone62 = "62" + digits[1:]
	} else if digits != "" {
		phone0 = "0" + digits
		phone62 = "62" + digits
	}

	query := `
		SELECT 
			id::text,
			user_id::text,
			nama,
			COALESCE(email, ''),
			COALESCE(no_hp, ''),
			COALESCE(role, 'user'),
			COALESCE(status, 'active'),
			COALESCE(is_verified, true),
			COALESCE(avatar_url, ''),
			COALESCE(password_hash, '')
		FROM kemenag_ptsp.profiles_pemohon
		WHERE no_hp = $1 OR no_hp = $2 OR no_hp = $3 OR LOWER(TRIM(email)) = LOWER($1)
		LIMIT 1
	`

	var user models.AuthUser
	var passwordHash string

	err := r.db.QueryRow(ctx, query, cleanID, phone0, phone62).Scan(
		&user.ID,
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.IsVerified,
		&user.AvatarURL,
		&passwordHash,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, "", errors.New("akun pemohon tidak ditemukan")
		}
		return nil, "", fmt.Errorf("gagal query pemohon: %w", err)
	}

	user.UserType = "eksternal_masyarakat"
	user.Permissions = []string{}

	return &user, passwordHash, nil
}

// FindUserByID mencari identitas pengguna dari 3 tabel (petugas -> pegawai -> pemohon).
func (r *AuthRepository) FindUserByID(ctx context.Context, id string) (*models.AuthUser, error) {
	// 1. Cek profiles_petugas
	pQuery := `
		SELECT 
			id::text, user_id::text, nama, email, COALESCE(no_hp, ''), COALESCE(nip, ''),
			role, COALESCE(jabatan, ''), COALESCE(unit_kerja, ''), status, is_verified,
			COALESCE(permissions, '[]'::jsonb), COALESCE(avatar_url, '')
		FROM kemenag_ptsp.profiles_petugas
		WHERE id::text = $1 OR user_id::text = $1
		LIMIT 1
	`
	var user models.AuthUser
	var permsBytes []byte
	err := r.db.QueryRow(ctx, pQuery, id).Scan(
		&user.ID, &user.UserID, &user.Nama, &user.Email, &user.Phone, &user.NIP,
		&user.Role, &user.Jabatan, &user.UnitKerja, &user.Status, &user.IsVerified,
		&permsBytes, &user.AvatarURL,
	)
	if err == nil {
		user.UserType = "internal_admin"
		_ = json.Unmarshal(permsBytes, &user.Permissions)
		return &user, nil
	}

	// 2. Cek profiles_pegawai
	pegQuery := `
		SELECT 
			id::text, user_id::text, nama, COALESCE(email, ''), COALESCE(no_hp, ''), COALESCE(nip, ''),
			role, COALESCE(jabatan, ''), COALESCE(unit_kerja, ''), status, is_verified,
			COALESCE(permissions, '[]'::jsonb), COALESCE(avatar_url, '')
		FROM kemenag_ptsp.profiles_pegawai
		WHERE id::text = $1 OR user_id::text = $1
		LIMIT 1
	`
	err = r.db.QueryRow(ctx, pegQuery, id).Scan(
		&user.ID, &user.UserID, &user.Nama, &user.Email, &user.Phone, &user.NIP,
		&user.Role, &user.Jabatan, &user.UnitKerja, &user.Status, &user.IsVerified,
		&permsBytes, &user.AvatarURL,
	)
	if err == nil {
		user.UserType = "internal_pegawai"
		_ = json.Unmarshal(permsBytes, &user.Permissions)
		return &user, nil
	}

	// 3. Cek profiles_pemohon
	pemQuery := `
		SELECT 
			id::text, user_id::text, nama, COALESCE(email, ''), COALESCE(no_hp, ''),
			role, status, is_verified, COALESCE(avatar_url, '')
		FROM kemenag_ptsp.profiles_pemohon
		WHERE id::text = $1 OR user_id::text = $1
		LIMIT 1
	`
	err = r.db.QueryRow(ctx, pemQuery, id).Scan(
		&user.ID, &user.UserID, &user.Nama, &user.Email, &user.Phone,
		&user.Role, &user.Status, &user.IsVerified, &user.AvatarURL,
	)
	if err == nil {
		user.UserType = "eksternal_masyarakat"
		user.Permissions = []string{}
		return &user, nil
	}

	return nil, errors.New("pengguna tidak ditemukan")
}

// UpdatePassword memperbarui hash password di tabel target.
func (r *AuthRepository) UpdatePassword(ctx context.Context, table, id, passwordHash string) error {
	var validTable string
	switch table {
	case "profiles_petugas":
		validTable = "kemenag_ptsp.profiles_petugas"
	case "profiles_pegawai":
		validTable = "kemenag_ptsp.profiles_pegawai"
	case "profiles_pemohon":
		validTable = "kemenag_ptsp.profiles_pemohon"
	default:
		return errors.New("tabel target password tidak valid")
	}

	query := fmt.Sprintf(`
		UPDATE %s
		SET password_hash = $1, updated_at = NOW()
		WHERE id::text = $2 OR user_id::text = $2
	`, validTable)

	tag, err := r.db.Exec(ctx, query, passwordHash, id)
	if err != nil {
		return fmt.Errorf("gagal update password: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("data user tidak ditemukan untuk pembaruan password")
	}

	return nil
}

// CreatePetugas mendaftarkan akun petugas baru.
func (r *AuthRepository) CreatePetugas(ctx context.Context, req *models.RegisterRequest, passwordHash string) (*models.AuthUser, error) {
	query := `
		INSERT INTO kemenag_ptsp.profiles_petugas (
			user_id, nama, email, no_hp, nip, jabatan, unit_kerja, role, status, is_verified, permissions, password_hash
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'active', false, '[]'::jsonb, $8
		)
		RETURNING id::text, user_id::text, nama, email, no_hp, nip, role, jabatan, unit_kerja, status, is_verified, permissions
	`

	role := req.Role
	if role == "" {
		role = "admin_ptsp"
	}

	var user models.AuthUser
	var permsBytes []byte

	err := r.db.QueryRow(ctx, query,
		req.Nama,
		strings.ToLower(strings.TrimSpace(req.Email)),
		req.Phone,
		req.NIP,
		req.Jabatan,
		req.UnitKerja,
		role,
		passwordHash,
	).Scan(
		&user.ID,
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Phone,
		&user.NIP,
		&user.Role,
		&user.Jabatan,
		&user.UnitKerja,
		&user.Status,
		&user.IsVerified,
		&permsBytes,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, errors.New("email sudah terdaftar di sistem")
		}
		return nil, fmt.Errorf("gagal mendaftarkan petugas: %w", err)
	}

	user.UserType = "internal_admin"
	user.Permissions = []string{}
	_ = json.Unmarshal(permsBytes, &user.Permissions)

	return &user, nil
}

// CreatePemohon mendaftarkan akun pemohon baru.
func (r *AuthRepository) CreatePemohon(ctx context.Context, req *models.RegisterRequest, passwordHash string) (*models.AuthUser, error) {
	metodeLogin := "WhatsApp (PTSP)"
	if strings.TrimSpace(req.MetodeLogin) != "" {
		metodeLogin = strings.TrimSpace(req.MetodeLogin)
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	cleanPhone := strings.TrimSpace(req.Phone)
	if email == "" && cleanPhone != "" {
		email = "p" + cleanPhone + "@ptsp.id"
	}

	query := `
		INSERT INTO kemenag_ptsp.profiles_pemohon (
			user_id, nama, email, no_hp, alamat, status, is_verified, role, password_hash, metode_login
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, 'active', true, 'user', $5, $6
		)
		RETURNING id::text, user_id::text, nama, email, no_hp, alamat, status, is_verified, role
	`

	var user models.AuthUser
	var alamat string

	err := r.db.QueryRow(ctx, query,
		req.Nama,
		email,
		cleanPhone,
		req.Alamat,
		passwordHash,
		metodeLogin,
	).Scan(
		&user.ID,
		&user.UserID,
		&user.Nama,
		&user.Email,
		&user.Phone,
		&alamat,
		&user.Status,
		&user.IsVerified,
		&user.Role,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, errors.New("nomor HP / WhatsApp atau Email sudah terdaftar")
		}
		return nil, fmt.Errorf("gagal mendaftarkan pemohon: %w", err)
	}

	user.UserType = "eksternal_masyarakat"
	user.Permissions = []string{}

	return &user, nil
}
