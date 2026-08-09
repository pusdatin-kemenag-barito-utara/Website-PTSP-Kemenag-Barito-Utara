package service

import (
	"context"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type CutiService struct {
	repo *repository.CutiRepository
	cfg  *config.Config
}

func NewCutiService(repo *repository.CutiRepository, cfg *config.Config) *CutiService {
	return &CutiService{repo: repo, cfg: cfg}
}

func (s *CutiService) GetByNip(ctx context.Context, nip string) (map[string]interface{}, error) {
	return s.repo.FindByNip(ctx, nip)
}

func (s *CutiService) GetAll(ctx context.Context, userID string) ([]models.DataCutiPegawai, error) {
	return s.repo.FindAll(ctx, userID)
}

func (s *CutiService) Create(ctx context.Context, req models.CreateCutiRequest) (string, error) {
	return s.repo.Create(ctx, req)
}

func (s *CutiService) UpdateStatus(ctx context.Context, id string, req models.UpdateCutiStatusRequest) error {
	return s.repo.UpdateStatus(ctx, id, req)
}

func (s *CutiService) GetLKH(ctx context.Context, userID string) ([]models.LaporanKinerja, error) {
	return s.repo.GetLKH(ctx, userID)
}

func (s *CutiService) CreateLKH(ctx context.Context, req models.CreateLaporanKinerjaRequest) error {
	return s.repo.CreateLKH(ctx, req)
}

func (s *CutiService) BulkCreateLKH(ctx context.Context, req models.BulkCreateLaporanKinerjaRequest) error {
	for _, item := range req.Items {
		if err := s.repo.CreateLKH(ctx, item); err != nil {
			return err
		}
	}
	return nil
}

func (s *CutiService) DeleteLKH(ctx context.Context, id string) error {
	return s.repo.DeleteLKH(ctx, id)
}


func (s *CutiService) AdminListPegawai(ctx context.Context, search string) ([]models.CutiPegawaiMaster, error) {
	return s.repo.AdminListPegawai(ctx, search)
}

func (s *CutiService) AdminCreatePegawai(ctx context.Context, req models.CreateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	return s.repo.AdminCreatePegawai(ctx, req)
}

func (s *CutiService) AdminUpdatePegawai(ctx context.Context, id string, req models.UpdateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	return s.repo.AdminUpdatePegawai(ctx, id, req)
}

func (s *CutiService) AdminDeletePegawai(ctx context.Context, id string) error {
	return s.repo.AdminDeletePegawai(ctx, id)
}

func (s *CutiService) AdminCreateRekap(ctx context.Context, req models.CreateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	return s.repo.AdminCreateRekap(ctx, req)
}

func (s *CutiService) AdminUpdateRekap(ctx context.Context, id string, req models.UpdateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	return s.repo.AdminUpdateRekap(ctx, id, req)
}

func (s *CutiService) AdminDeleteRekap(ctx context.Context, id string) error {
	return s.repo.AdminDeleteRekap(ctx, id)
}

func (s *CutiService) AdminRolloverTahunan(ctx context.Context, tahunTujuan int) (int, error) {
	return s.repo.AdminRolloverTahunan(ctx, tahunTujuan)
}

func (s *CutiService) AdminSyncPusdatin(ctx context.Context) (int, error) {
	return s.repo.AdminSyncPusdatin(ctx)
}

