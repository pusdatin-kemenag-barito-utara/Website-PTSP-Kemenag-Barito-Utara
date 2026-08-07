package service

import (
	"context"
	"errors"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/repository"
)

type SystemService struct {
	repo *repository.SystemRepository
	cfg  *config.Config
}

func NewSystemService(repo *repository.SystemRepository, cfg *config.Config) *SystemService {
	return &SystemService{repo: repo, cfg: cfg}
}

func (s *SystemService) CleanupDocuments(ctx context.Context, secret string) (int, int, error) {
	if s.cfg.CronSecret != "" && secret != s.cfg.CronSecret {
		return 0, 0, errors.New("Unauthorized")
	}

	threeDaysAgo := time.Now().AddDate(0, 0, -3)
	return s.repo.CleanupExpiredDocuments(ctx, threeDaysAgo)
}

func (s *SystemService) KeepAlive(ctx context.Context) error {
	return s.repo.PingDB(ctx)
}

func (s *SystemService) ToggleGuestBookMode(ctx context.Context, allowManual bool) error {
	return s.repo.UpdateSystemSettings(ctx, map[string]interface{}{"allowManual": allowManual})
}

func (s *SystemService) UpdateSystemSettings(ctx context.Context, settings map[string]interface{}) error {
	return s.repo.UpdateSystemSettings(ctx, settings)
}

func (s *SystemService) GetSystemStatus(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetSystemStatus(ctx)
}

