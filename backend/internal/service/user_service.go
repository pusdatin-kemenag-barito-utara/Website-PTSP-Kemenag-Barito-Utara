package service

import (
	"context"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type UserService struct {
	repo    *repository.UserRepository
	cfg     *config.Config
	cutiSvc *CutiService
}

func NewUserService(repo *repository.UserRepository, cfg *config.Config) *UserService {
	return &UserService{repo: repo, cfg: cfg}
}

func (s *UserService) SetCutiService(cutiSvc *CutiService) {
	s.cutiSvc = cutiSvc
}

func (s *UserService) GetAll(ctx context.Context, role, status string, limit int) ([]models.User, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAll(ctx, role, status, limit)
}

func (s *UserService) GetByID(ctx context.Context, id string) (*models.User, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *UserService) Update(ctx context.Context, id string, req models.UpdateUserRequest) error {
	return s.repo.Update(ctx, id, req)
}

func (s *UserService) UpdateProfile(ctx context.Context, id string, req models.UpdateProfileRequest) error {
	return s.repo.UpdateProfile(ctx, id, req)
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *UserService) GetAuditLogs(ctx context.Context, limit int) ([]models.AuditLog, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAuditLogs(ctx, limit)
}

func (s *UserService) Search(ctx context.Context, q string) (*models.SearchResult, error) {
	if len(q) < 2 {
		return &models.SearchResult{
			Requests: []models.SearchRequestItem{},
			Profiles: []models.SearchProfileItem{},
			Services: []models.SearchServiceItem{},
		}, nil
	}
	return s.repo.GlobalSearch(ctx, q)
}

// --- Petugas Service ---

func (s *UserService) GetPetugas(ctx context.Context, search, role, status string, limit, offset int) ([]models.PetugasUser, int, error) {
	return s.repo.FindPetugas(ctx, search, role, status, limit, offset)
}

func (s *UserService) CreatePetugas(ctx context.Context, req models.CreatePetugasRequest) (*models.PetugasUser, error) {
	return s.repo.CreatePetugas(ctx, req)
}

func (s *UserService) UpdatePetugas(ctx context.Context, id string, req models.UpdatePetugasRequest) error {
	return s.repo.UpdatePetugas(ctx, id, req)
}

func (s *UserService) VerifyPetugas(ctx context.Context, id string) error {
	return s.repo.VerifyPetugas(ctx, id)
}

func (s *UserService) DeletePetugas(ctx context.Context, id string) error {
	return s.repo.DeletePetugas(ctx, id)
}

// --- Pegawai Service (Sync Otomatis ke Manajemen Cuti) ---

func (s *UserService) GetPegawai(ctx context.Context, search, unitKerja, status string, limit, offset int) ([]models.PegawaiUser, int, error) {
	return s.repo.FindPegawai(ctx, search, unitKerja, status, limit, offset)
}

func (s *UserService) CreatePegawai(ctx context.Context, req models.CreatePegawaiRequest) (*models.PegawaiUser, error) {
	pegawai, err := s.repo.CreatePegawai(ctx, req)
	if err == nil && s.cutiSvc != nil {
		s.cutiSvc.ClearPegawaiMasterCache()
	}
	return pegawai, err
}

func (s *UserService) UpdatePegawai(ctx context.Context, id string, req models.UpdatePegawaiRequest) error {
	err := s.repo.UpdatePegawai(ctx, id, req)
	if err == nil && s.cutiSvc != nil {
		s.cutiSvc.ClearPegawaiMasterCache()
	}
	return err
}

func (s *UserService) DeletePegawai(ctx context.Context, id string) error {
	err := s.repo.DeletePegawai(ctx, id)
	if err == nil && s.cutiSvc != nil {
		s.cutiSvc.ClearPegawaiMasterCache()
	}
	return err
}

// --- Pemohon Service ---

func (s *UserService) GetPemohon(ctx context.Context, search, metodeLogin, status string, limit, offset int) ([]models.PemohonUser, int, error) {
	return s.repo.FindPemohon(ctx, search, metodeLogin, status, limit, offset)
}

func (s *UserService) UpdatePemohon(ctx context.Context, id string, req models.UpdatePemohonRequest) error {
	return s.repo.UpdatePemohon(ctx, id, req)
}

func (s *UserService) DeletePemohon(ctx context.Context, id string) error {
	return s.repo.DeletePemohon(ctx, id)
}

// --- Stats Service ---

func (s *UserService) GetUserStats(ctx context.Context) (*models.UserStats, error) {
	return s.repo.GetUserStats(ctx)
}

