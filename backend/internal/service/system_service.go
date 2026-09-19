package service

import (
	"context"
	"errors"
	"sync"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/repository"
)

type systemCacheEntry struct {
	data      any
	expiresAt time.Time
}

type youTubeCacheData struct {
	videos []repository.YouTubeVideo
	total  int
}

type SystemService struct {
	repo       *repository.SystemRepository
	cfg        *config.Config
	cache      map[string]systemCacheEntry
	cacheMutex sync.RWMutex
}

func NewSystemService(repo *repository.SystemRepository, cfg *config.Config) *SystemService {
	return &SystemService{
		repo:  repo,
		cfg:   cfg,
		cache: make(map[string]systemCacheEntry),
	}
}

func (s *SystemService) clearCache() {
	s.cacheMutex.Lock()
	s.cache = make(map[string]systemCacheEntry)
	s.cacheMutex.Unlock()
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
	s.clearCache()
	return s.repo.UpdateSystemSettings(ctx, map[string]interface{}{"allowManual": allowManual})
}

func (s *SystemService) UpdateSystemSettings(ctx context.Context, settings map[string]interface{}) error {
	s.clearCache()
	return s.repo.UpdateSystemSettings(ctx, settings)
}

func (s *SystemService) GetStorageOverview(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetSystemStorageOverview(ctx)
}

func (s *SystemService) GetSystemStatus(ctx context.Context) (map[string]interface{}, error) {
	cacheKey := "system_status"
	s.cacheMutex.RLock()
	entry, exists := s.cache[cacheKey]
	s.cacheMutex.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		if res, ok := entry.data.(map[string]interface{}); ok {
			return res, nil
		}
	}

	res, err := s.repo.GetSystemStatus(ctx)
	if err != nil {
		return nil, err
	}

	s.cacheMutex.Lock()
	s.cache[cacheKey] = systemCacheEntry{
		data:      res,
		expiresAt: time.Now().Add(1 * time.Minute),
	}
	s.cacheMutex.Unlock()

	return res, nil
}

func (s *SystemService) GetYouTubeVideos(ctx context.Context) ([]repository.YouTubeVideo, int, error) {
	cacheKey := "youtube_videos"
	s.cacheMutex.RLock()
	entry, exists := s.cache[cacheKey]
	s.cacheMutex.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		if res, ok := entry.data.(youTubeCacheData); ok {
			return res.videos, res.total, nil
		}
	}

	videos, total, err := s.repo.GetYouTubeVideos(ctx)
	if err != nil {
		return nil, 0, err
	}

	s.cacheMutex.Lock()
	s.cache[cacheKey] = systemCacheEntry{
		data: youTubeCacheData{
			videos: videos,
			total:  total,
		},
		expiresAt: time.Now().Add(10 * time.Minute),
	}
	s.cacheMutex.Unlock()

	return videos, total, nil
}
