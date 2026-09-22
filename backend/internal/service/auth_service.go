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
		identifier = strings.TrimSpace(req.Email)
	}
	if identifier == "" {
		identifier = strings.TrimSpace(req.NIP)
	}
	if identifier == "" {
		identifier = strings.TrimSpace(req.Phone)
	}
	if identifier == "" {
		return nil, errors.New("identitas login (email / NIP / nomor WhatsApp) wajib diisi")
	}
	if req.Password == "" {
		return nil, errors.New("password wajib diisi")
	}

	mode := strings.ToLower(strings.TrimSpace(req.Mode))

	var user *models.AuthUser
	var passwordHash string
	var err error

	// Helper closures untuk mencari di masing-masing tabel
	tryPetugas := func() bool {
		u, h, e := s.repo.FindPetugasByEmail(ctx, identifier)
		if e == nil && u != nil {
			user, passwordHash, err = u, h, nil
			return true
		}
		return false
	}

	tryPegawai := func() bool {
		u, h, e := s.repo.FindPegawaiByNIPOrEmail(ctx, identifier)
		if e == nil && u != nil {
			user, passwordHash, err = u, h, nil
			return true
		}
		return false
	}

	tryPemohon := func() bool {
		u, h, e := s.repo.FindPemohonByPhoneOrEmail(ctx, identifier)
		if e == nil && u != nil {
			user, passwordHash, err = u, h, nil
			return true
		}
		return false
	}

	isGoogleOAuth := (req.Password == "google_oauth_verified" || strings.Contains(strings.ToLower(req.MetodeLogin), "google") || mode == "google") && strings.Contains(identifier, "@")

	// 1. Coba cari sesuai mode yang ditentukan pemohon
	matched := false
	switch mode {
	case "petugas":
		matched = tryPetugas()
	case "pegawai":
		matched = tryPegawai()
	case "pemohon", "google":
		matched = tryPemohon()
	}

	// 2. Smart fallback jika belum ketemu di mode yang dipilih
	if !matched {
		if tryPetugas() {
			matched = true
		} else if tryPegawai() {
			matched = true
		} else if tryPemohon() {
			matched = true
		}
	}

	// 3. Auto-provision jika login via Google OAuth dan belum terdaftar
	if (!matched || user == nil) && isGoogleOAuth {
		displayName := strings.TrimSpace(req.Nama)
		if displayName == "" {
			nameParts := strings.Split(identifier, "@")
			displayName = nameParts[0]
			if len(displayName) > 0 {
				displayName = strings.ToUpper(string(displayName[0])) + displayName[1:]
			}
		}
		dummyHash, _ := utils.HashPassword("google_oauth_verified_" + identifier)
		regReq := &models.RegisterRequest{
			Nama:        displayName,
			Email:       identifier,
			Mode:        "pemohon",
			MetodeLogin: "Google Akun",
		}
		var errReg error
		user, errReg = s.repo.CreatePemohon(ctx, regReq, dummyHash)
		if errReg != nil {
			return nil, errors.New("gagal memproses akun Google: " + errReg.Error())
		}
		matched = true
	}

	if !matched || user == nil {
		return nil, errors.New("kredensial login tidak ditemukan")
	}

	if user.Status != "active" {
		return nil, errors.New("akun Anda sedang dinonaktifkan. Silakan hubungi Super Admin")
	}

	if user.UserType == "internal_admin" && !user.IsVerified && user.Role != "super_admin" {
		return nil, errors.New("akun Anda masih menunggu verifikasi dari Super Admin")
	}

	// Verifikasi hash password (kecuali Google OAuth terverifikasi)
	if !isGoogleOAuth {
		if passwordHash == "" || !utils.CheckPassword(req.Password, passwordHash) {
			return nil, errors.New("kredensial login atau password salah")
		}
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

