package service

import (
	"context"
	"sync"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type statsCacheEntry struct {
	stats     *models.DashboardStats
	expiresAt time.Time
}

type RequestService struct {
	repo       *repository.RequestRepository
	cfg        *config.Config
	fileSvc    *FileService
	statsCache *statsCacheEntry
	statsMutex sync.RWMutex
}

func NewRequestService(repo *repository.RequestRepository, cfg *config.Config, fileSvc *FileService) *RequestService {
	return &RequestService{repo: repo, cfg: cfg, fileSvc: fileSvc}
}

func (s *RequestService) GetAll(ctx context.Context, userID, status, category string, limit int) ([]models.ServiceRequest, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAll(ctx, userID, status, category, limit)
}

func (s *RequestService) Track(ctx context.Context, requestNumber string) (*models.TrackRequestResponse, error) {
	req, err := s.repo.FindByNumber(ctx, requestNumber)
	if err != nil {
		return nil, err
	}

	svcName := ""
	if req.ServiceName != nil {
		svcName = *req.ServiceName
	}
	itemName := ""
	if req.ItemName != nil {
		itemName = *req.ItemName
	}

	return &models.TrackRequestResponse{
		ID:              req.ID,
		RequestNumber:   req.RequestNumber,
		Status:          req.Status,
		ServiceName:     svcName,
		ItemName:        itemName,
		SubmittedAt:     req.SubmittedAt,
		CompletedAt:     req.CompletedAt,
		RejectedAt:      req.RejectedAt,
		RevisionNote:    req.RevisionNote,
		RejectionReason: req.RejectionReason,
		CreatedAt:       req.CreatedAt,
	}, nil
}

func (s *RequestService) GetByID(ctx context.Context, id string) (*models.ServiceRequestDetail, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *RequestService) UpdateStatus(ctx context.Context, id string, req models.UpdateRequestStatusRequest) error {
	s.statsMutex.Lock()
	s.statsCache = nil
	s.statsMutex.Unlock()
	return s.repo.UpdateStatus(ctx, id, req)
}

func (s *RequestService) Delete(ctx context.Context, id string) error {
	s.statsMutex.Lock()
	s.statsCache = nil
	s.statsMutex.Unlock()

	// 1. Ambil seluruh berkas yang terhubung dengan permohonan ini dalam 1 query cepat
	var filePaths []string
	if s.fileSvc != nil {
		filePaths, _ = s.repo.GetFilePathsByRequestID(ctx, id)
	}

	// 2. Hapus data permohonan dan seluruh relasinya dari database seketika
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	// 3. Bersihkan berkas Cloudflare R2 secara paralel (asinkron di background) tanpa menahan response HTTP
	if s.fileSvc != nil && len(filePaths) > 0 {
		go func(paths []string) {
			bgCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()
			var wg sync.WaitGroup
			for _, fp := range paths {
				if fp == "" {
					continue
				}
				wg.Add(1)
				go func(p string) {
					defer wg.Done()
					_ = s.fileSvc.DeleteFile(bgCtx, p)
				}(fp)
			}
			wg.Wait()
		}(filePaths)
	}

	return nil
}

// AttachDocument menyimpan record dokumen unggahan (revisi) ke sebuah permohonan.
func (s *RequestService) AttachDocument(ctx context.Context, requestID, requirementID, fileName, filePath, fileType string, fileSize int64) error {
	return s.repo.InsertDocument(ctx, requestID, requirementID, fileName, filePath, fileType, fileSize)
}

// CreateByApplicant membuat permohonan baru oleh pemohon.
func (s *RequestService) CreateByApplicant(ctx context.Context, userID string, serviceID, serviceItemID int64, answers []models.RequestAnswer) (*models.ServiceRequest, error) {
	return s.repo.Create(ctx, userID, serviceID, serviceItemID, answers)
}

// UpdateByApplicant memperbarui permohonan milik pemohon.
func (s *RequestService) UpdateByApplicant(ctx context.Context, id, userID string, answers []models.RequestAnswer) error {
	return s.repo.UpdateByApplicant(ctx, id, userID, answers)
}

// DeleteByApplicant menghapus permohonan milik pemohon beserta berkas R2 secara asinkron.
func (s *RequestService) DeleteByApplicant(ctx context.Context, id, userID string) error {
	s.statsMutex.Lock()
	s.statsCache = nil
	s.statsMutex.Unlock()

	var filePaths []string
	if s.fileSvc != nil {
		filePaths, _ = s.repo.GetFilePathsByRequestID(ctx, id)
	}

	if err := s.repo.DeleteByApplicant(ctx, id, userID); err != nil {
		return err
	}

	if s.fileSvc != nil && len(filePaths) > 0 {
		go func(paths []string) {
			bgCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()
			var wg sync.WaitGroup
			for _, fp := range paths {
				if fp == "" {
					continue
				}
				wg.Add(1)
				go func(p string) {
					defer wg.Done()
					_ = s.fileSvc.DeleteFile(bgCtx, p)
				}(fp)
			}
			wg.Wait()
		}(filePaths)
	}

	return nil
}

func (s *RequestService) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	s.statsMutex.RLock()
	if s.statsCache != nil && time.Now().Before(s.statsCache.expiresAt) {
		stats := s.statsCache.stats
		s.statsMutex.RUnlock()
		return stats, nil
	}
	s.statsMutex.RUnlock()

	stats, err := s.repo.GetDashboardStats(ctx)
	if err != nil {
		return nil, err
	}

	s.statsMutex.Lock()
	s.statsCache = &statsCacheEntry{
		stats:     stats,
		expiresAt: time.Now().Add(30 * time.Second),
	}
	s.statsMutex.Unlock()

	return stats, nil
}
