package service

import (
	"context"
	"sync"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type CutiService struct {
	repo                   *repository.CutiRepository
	cfg                    *config.Config
	pejabatCache           []string
	pejabatExpiresAt       time.Time
	pejabatMutex           sync.RWMutex
	pegawaiMasterCache     []models.CutiPegawaiMaster
	pegawaiMasterExpiresAt time.Time
	pegawaiMasterMutex     sync.RWMutex
}

func NewCutiService(repo *repository.CutiRepository, cfg *config.Config) *CutiService {
	return &CutiService{repo: repo, cfg: cfg}
}

func (s *CutiService) clearPejabatCache() {
	s.pejabatMutex.Lock()
	s.pejabatCache = nil
	s.pejabatExpiresAt = time.Time{}
	s.pejabatMutex.Unlock()
}

func (s *CutiService) clearPegawaiMasterCache() {
	s.pegawaiMasterMutex.Lock()
	s.pegawaiMasterCache = nil
	s.pegawaiMasterExpiresAt = time.Time{}
	s.pegawaiMasterMutex.Unlock()
}

// ClearPegawaiMasterCache membersihkan cache master pegawai & pejabat dari luar package/service
func (s *CutiService) ClearPegawaiMasterCache() {
	s.clearPegawaiMasterCache()
	s.clearPejabatCache()
}

func (s *CutiService) GetPejabatNIPs(ctx context.Context) ([]string, error) {
	s.pejabatMutex.RLock()
	if s.pejabatCache != nil && time.Now().Before(s.pejabatExpiresAt) {
		res := s.pejabatCache
		s.pejabatMutex.RUnlock()
		return res, nil
	}
	s.pejabatMutex.RUnlock()

	nips, err := s.repo.GetPejabatNIPs(ctx)
	if err != nil {
		return nil, err
	}

	s.pejabatMutex.Lock()
	s.pejabatCache = nips
	s.pejabatExpiresAt = time.Now().Add(15 * time.Minute)
	s.pejabatMutex.Unlock()

	return nips, nil
}

func (s *CutiService) GetByNip(ctx context.Context, nip string) (map[string]interface{}, error) {
	return s.repo.FindByNip(ctx, nip)
}

func (s *CutiService) GetByRequestID(ctx context.Context, requestID string) (map[string]interface{}, error) {
	return s.repo.FindByRequestID(ctx, requestID)
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

func (s *CutiService) GetLKH(ctx context.Context, userID string, month, year int) ([]models.LaporanKinerja, error) {
	return s.repo.GetLKH(ctx, userID, month, year)
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

func (s *CutiService) AdminGetLKH(ctx context.Context, search, unitKerja, status, date string, month, year int) ([]models.AdminLaporanKinerjaItem, error) {
	return s.repo.AdminGetLKH(ctx, search, unitKerja, status, date, month, year)
}

func (s *CutiService) AdminUpdateLKHStatus(ctx context.Context, id, status string, komentar *string) error {
	return s.repo.AdminUpdateLKHStatus(ctx, id, status, komentar)
}

func (s *CutiService) AdminListPegawai(ctx context.Context, search string) ([]models.CutiPegawaiMaster, error) {
	if search == "" {
		s.pegawaiMasterMutex.RLock()
		if s.pegawaiMasterCache != nil && time.Now().Before(s.pegawaiMasterExpiresAt) {
			res := s.pegawaiMasterCache
			s.pegawaiMasterMutex.RUnlock()
			return res, nil
		}
		s.pegawaiMasterMutex.RUnlock()
	}

	data, err := s.repo.AdminListPegawai(ctx, search)
	if err != nil {
		return nil, err
	}

	if search == "" {
		s.pegawaiMasterMutex.Lock()
		s.pegawaiMasterCache = data
		s.pegawaiMasterExpiresAt = time.Now().Add(10 * time.Minute)
		s.pegawaiMasterMutex.Unlock()
	}

	return data, nil
}

func (s *CutiService) AdminCreatePegawai(ctx context.Context, req models.CreateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	s.clearPejabatCache()
	s.clearPegawaiMasterCache()
	return s.repo.AdminCreatePegawai(ctx, req)
}

func (s *CutiService) AdminUpdatePegawai(ctx context.Context, id string, req models.UpdateCutiPegawaiRequest) (*models.CutiPegawaiMaster, error) {
	s.clearPejabatCache()
	s.clearPegawaiMasterCache()
	return s.repo.AdminUpdatePegawai(ctx, id, req)
}

func (s *CutiService) AdminDeletePegawai(ctx context.Context, id string) error {
	s.clearPejabatCache()
	s.clearPegawaiMasterCache()
	return s.repo.AdminDeletePegawai(ctx, id)
}

func (s *CutiService) AdminCreateRekap(ctx context.Context, req models.CreateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	s.clearPegawaiMasterCache()
	return s.repo.AdminCreateRekap(ctx, req)
}

func (s *CutiService) AdminUpdateRekap(ctx context.Context, id string, req models.UpdateRekapCutiRequest) (*models.RekapCutiTahunan, error) {
	s.clearPegawaiMasterCache()
	return s.repo.AdminUpdateRekap(ctx, id, req)
}

func (s *CutiService) AdminDeleteRekap(ctx context.Context, id string) error {
	s.clearPegawaiMasterCache()
	return s.repo.AdminDeleteRekap(ctx, id)
}

func (s *CutiService) AdminRolloverTahunan(ctx context.Context, tahunTujuan int) (int, error) {
	s.clearPegawaiMasterCache()
	return s.repo.AdminRolloverTahunan(ctx, tahunTujuan)
}

func (s *CutiService) AdminSyncPusdatin(ctx context.Context) (int, error) {
	s.clearPejabatCache()
	s.clearPegawaiMasterCache()
	return s.repo.AdminSyncPusdatin(ctx)
}

func (s *CutiService) GetPejabatList(ctx context.Context) ([]models.PejabatItem, error) {
	return s.repo.GetPejabatList(ctx)
}

func (s *CutiService) UpsertPejabat(ctx context.Context, req models.UpsertPejabatRequest) error {
	s.clearPejabatCache()
	return s.repo.UpsertPejabat(ctx, req)
}

func (s *CutiService) DeletePejabat(ctx context.Context, id string) error {
	s.clearPejabatCache()
	return s.repo.DeletePejabat(ctx, id)
}

func (s *CutiService) ReorderPejabat(ctx context.Context, items []models.ReorderPejabatItem) error {
	s.clearPejabatCache()
	return s.repo.ReorderPejabat(ctx, items)
}

