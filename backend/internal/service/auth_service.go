package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
	"ptsp-kemenag-backend/internal/utils"
)

type AuthService struct {
	repo *repository.AuthRepository
	cfg  *config.Config
}

func NewAuthService(repo *repository.AuthRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *AuthService) getJWTSecret() string {
	if s.cfg.JWTSecret != "" {
		return s.cfg.JWTSecret
	}
	if s.cfg.SupabaseJWTSecret != "" {
		return s.cfg.SupabaseJWTSecret
	}
	return "ptsp-kemenag-barito-utara-secret-jwt-key-2026"
}

// Login memproses autentikasi berdasarkan mode login pengguna.
func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	identifier := strings.TrimSpace(req.Identifier)
	if identifier == "" {
		return nil, errors.New("identitas login (email / NIP / nomor WhatsApp) wajib diisi")
	}
	if req.Password == "" {
		return nil, errors.New("password wajib diisi")
	}

	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	if mode == "" {
		mode = "petugas"
	}

	var user *models.AuthUser
	var passwordHash string
	var err error

	switch mode {
	case "petugas":
		user, passwordHash, err = s.repo.FindPetugasByEmail(ctx, identifier)
		if err != nil {
			return nil, errors.New("email atau password salah")
		}
		if user.Status != "active" {
			return nil, errors.New("akun Anda sedang dinonaktifkan. Silakan hubungi Super Admin")
		}
		if !user.IsVerified && user.Role != "super_admin" {
			return nil, errors.New("akun Anda masih menunggu verifikasi dari Super Admin")
		}

	case "pegawai":
		user, passwordHash, err = s.repo.FindPegawaiByNIPOrEmail(ctx, identifier)
		if err != nil {
			return nil, errors.New("NIP atau password salah")
		}
		if user.Status != "active" {
			return nil, errors.New("akun pegawai ini dinonaktifkan")
		}

	case "pemohon":
		user, passwordHash, err = s.repo.FindPemohonByPhoneOrEmail(ctx, identifier)
		if err != nil {
			return nil, errors.New("nomor WhatsApp atau password salah")
		}
		if user.Status != "active" {
			return nil, errors.New("akun pemohon dinonaktifkan")
		}

	default:
		return nil, errors.New("mode login tidak valid")
	}

	// Verifikasi hash password
	if passwordHash == "" || !utils.CheckPassword(req.Password, passwordHash) {
		return nil, errors.New("kredensial login atau password salah")
	}

	// Durasi masa aktif token: 30 hari jika RememberMe, 7 hari jika biasa
	duration := 7 * 24 * time.Hour
	if req.RememberMe {
		duration = 30 * 24 * time.Hour
	}

	now := time.Now()
	claims := utils.JWTClaims{
		UserID:      user.UserID,
		Email:       user.Email,
		Nama:        user.Nama,
		Role:        user.Role,
		UserType:    user.UserType,
		NIP:         user.NIP,
		Phone:       user.Phone,
		Permissions: user.Permissions,
		IsVerified:  user.IsVerified,
		Iat:         now.Unix(),
		Exp:         now.Add(duration).Unix(),
	}

	token, err := utils.GenerateJWT(&claims, s.getJWTSecret())
	if err != nil {
		return nil, errors.New("gagal menerbitkan token sesi login")
	}

	return &models.AuthResponse{
		Success: true,
		Message: "Login berhasil",
		Token:   token,
		User:    user,
	}, nil
}

// Register menangani registrasi akun baru.
func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	if strings.TrimSpace(req.Nama) == "" {
		return nil, errors.New("nama lengkap wajib diisi")
	}
	if strings.TrimSpace(req.Password) == "" || len(req.Password) < 6 {
		return nil, errors.New("password minimal 6 karakter")
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("gagal mengamankan password")
	}

	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	var user *models.AuthUser

	if mode == "petugas" {
		if strings.TrimSpace(req.Email) == "" {
			return nil, errors.New("email dinas wajib diisi untuk pendaftaran petugas")
		}
		user, err = s.repo.CreatePetugas(ctx, req, hash)
		if err != nil {
			return nil, err
		}
	} else {
		if strings.TrimSpace(req.Phone) == "" {
			return nil, errors.New("nomor WhatsApp wajib diisi")
		}
		user, err = s.repo.CreatePemohon(ctx, req, hash)
		if err != nil {
			return nil, err
		}
	}

	now := time.Now()
	claims := utils.JWTClaims{
		UserID:      user.UserID,
		Email:       user.Email,
		Nama:        user.Nama,
		Role:        user.Role,
		UserType:    user.UserType,
		NIP:         user.NIP,
		Phone:       user.Phone,
		Permissions: user.Permissions,
		IsVerified:  user.IsVerified,
		Iat:         now.Unix(),
		Exp:         now.Add(7 * 24 * time.Hour).Unix(),
	}

	token, _ := utils.GenerateJWT(&claims, s.getJWTSecret())

	return &models.AuthResponse{
		Success: true,
		Message: "Pendaftaran berhasil",
		Token:   token,
		User:    user,
	}, nil
}

// GetMe mengambil identitas pengguna saat ini.
func (s *AuthService) GetMe(ctx context.Context, userID string) (*models.AuthUser, error) {
	return s.repo.FindUserByID(ctx, userID)
}

// ChangePassword memproses perubahan password.
func (s *AuthService) ChangePassword(ctx context.Context, userID, userType, oldPassword, newPassword string) error {
	if len(newPassword) < 6 {
		return errors.New("password baru minimal 6 karakter")
	}

	user, err := s.repo.FindUserByID(ctx, userID)
	if err != nil {
		return err
	}

	// Tentukan tabel target
	var table string
	switch user.UserType {
	case "internal_admin":
		table = "profiles_petugas"
	case "internal_pegawai":
		table = "profiles_pegawai"
	default:
		table = "profiles_pemohon"
	}

	newHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return errors.New("gagal mengenkripsi password baru")
	}

	return s.repo.UpdatePassword(ctx, table, user.UserID, newHash)
}

// ResetPassword mereset password pengguna oleh admin tanpa perlu password lama.
func (s *AuthService) ResetPassword(ctx context.Context, userID, userType, newPassword string) error {
	if len(newPassword) < 6 {
		return errors.New("password baru minimal 6 karakter")
	}
	newHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return errors.New("gagal mengenkripsi password baru")
	}

	user, err := s.repo.FindUserByID(ctx, userID)
	table := "profiles_pemohon"
	if err == nil {
		switch user.UserType {
		case "internal_admin":
			table = "profiles_petugas"
		case "internal_pegawai":
			table = "profiles_pegawai"
		default:
			table = "profiles_pemohon"
		}
	} else if userType == "petugas" || userType == "internal_admin" {
		table = "profiles_petugas"
	} else if userType == "pegawai" || userType == "internal_pegawai" {
		table = "profiles_pegawai"
	}

	return s.repo.UpdatePassword(ctx, table, userID, newHash)
}

