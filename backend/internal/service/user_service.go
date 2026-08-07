package service

import (
	"context"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type UserService struct {
	repo *repository.UserRepository
	cfg  *config.Config
}

func NewUserService(repo *repository.UserRepository, cfg *config.Config) *UserService {
	return &UserService{repo: repo, cfg: cfg}
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
