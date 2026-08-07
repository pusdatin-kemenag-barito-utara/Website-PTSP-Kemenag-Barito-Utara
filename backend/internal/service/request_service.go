package service

import (
	"context"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type RequestService struct {
	repo *repository.RequestRepository
	cfg  *config.Config
}

func NewRequestService(repo *repository.RequestRepository, cfg *config.Config) *RequestService {
	return &RequestService{repo: repo, cfg: cfg}
}

func (s *RequestService) GetAll(ctx context.Context, userID, status string, limit int) ([]models.ServiceRequest, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAll(ctx, userID, status, limit)
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
	return s.repo.UpdateStatus(ctx, id, req)
}

func (s *RequestService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *RequestService) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	return s.repo.GetDashboardStats(ctx)
}
