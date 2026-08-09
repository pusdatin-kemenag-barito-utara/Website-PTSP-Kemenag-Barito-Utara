package service

import (
	"context"
	"sync"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type cacheEntry struct {
	data      any
	expiresAt time.Time
}

type ServiceService struct {
	repo       *repository.ServiceRepository
	cfg        *config.Config
	cache      map[string]cacheEntry
	cacheMutex sync.RWMutex
}

func NewServiceService(repo *repository.ServiceRepository, cfg *config.Config) *ServiceService {
	return &ServiceService{
		repo:  repo,
		cfg:   cfg,
		cache: make(map[string]cacheEntry),
	}
}

func (s *ServiceService) GetServicesWithItems(ctx context.Context) ([]models.Service, error) {
	cacheKey := "all_services_with_items"
	s.cacheMutex.RLock()
	entry, exists := s.cache[cacheKey]
	s.cacheMutex.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		if res, ok := entry.data.([]models.Service); ok {
			return res, nil
		}
	}

	data, err := s.repo.FindAllWithItems(ctx)
	if err != nil {
		return nil, err
	}

	s.cacheMutex.Lock()
	s.cache[cacheKey] = cacheEntry{
		data:      data,
		expiresAt: time.Now().Add(10 * time.Minute),
	}
	s.cacheMutex.Unlock()

	return data, nil
}

func (s *ServiceService) GetServiceBySlug(ctx context.Context, slug string) (*models.Service, error) {
	cacheKey := "service_slug:" + slug
	s.cacheMutex.RLock()
	entry, exists := s.cache[cacheKey]
	s.cacheMutex.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		if res, ok := entry.data.(*models.Service); ok {
			return res, nil
		}
	}

	res, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	s.cacheMutex.Lock()
	s.cache[cacheKey] = cacheEntry{
		data:      res,
		expiresAt: time.Now().Add(10 * time.Minute),
	}
	s.cacheMutex.Unlock()

	return res, nil
}

func (s *ServiceService) clearCache() {
	s.cacheMutex.Lock()
	s.cache = make(map[string]cacheEntry)
	s.cacheMutex.Unlock()
}

func (s *ServiceService) GetMasterOptions(ctx context.Context) ([]models.MasterOption, error) {
	cacheKey := "master_options"
	s.cacheMutex.RLock()
	entry, exists := s.cache[cacheKey]
	s.cacheMutex.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		if res, ok := entry.data.([]models.MasterOption); ok {
			return res, nil
		}
	}

	res, err := s.repo.FindMasterOptions(ctx)
	if err != nil {
		return nil, err
	}

	s.cacheMutex.Lock()
	s.cache[cacheKey] = cacheEntry{
		data:      res,
		expiresAt: time.Now().Add(15 * time.Minute),
	}
	s.cacheMutex.Unlock()

	return res, nil
}

func (s *ServiceService) UpsertMasterOption(ctx context.Context, req models.UpsertMasterOptionRequest) (*models.MasterOption, error) {
	s.clearCache()
	return s.repo.UpsertMasterOption(ctx, req)
}

func (s *ServiceService) DeleteMasterOption(ctx context.Context, id string) error {
	s.clearCache()
	return s.repo.DeleteMasterOption(ctx, id)
}


func (s *ServiceService) GetRequirements(ctx context.Context, itemID string) ([]models.ServiceRequirement, error) {
	return s.repo.FindRequirementsByServiceItemID(ctx, itemID)
}

func (s *ServiceService) GetFormFields(ctx context.Context, itemID string) ([]models.ServiceFormField, error) {
	return s.repo.FindFormFieldsByServiceItemID(ctx, itemID)
}

// --- Admin: CRUD Services ---

func (s *ServiceService) CreateService(ctx context.Context, req models.CreateServiceRequest) (*models.Service, error) {
	s.clearCache()
	return s.repo.CreateService(ctx, req)
}

func (s *ServiceService) UpdateService(ctx context.Context, id int64, req models.UpdateServiceRequest) (*models.Service, error) {
	s.clearCache()
	return s.repo.UpdateService(ctx, id, req)
}

func (s *ServiceService) DeleteService(ctx context.Context, id int64) error {
	s.clearCache()
	return s.repo.DeleteService(ctx, id)
}

func (s *ServiceService) ReorderServices(ctx context.Context, ids []int64) error {
	s.clearCache()
	return s.repo.ReorderServices(ctx, ids)
}

// --- Admin: CRUD Service Items ---

func (s *ServiceService) CreateServiceItem(ctx context.Context, serviceID int64, req models.CreateServiceItemRequest) (*models.ServiceItem, error) {
	s.clearCache()
	return s.repo.CreateServiceItem(ctx, serviceID, req)
}

func (s *ServiceService) UpdateServiceItem(ctx context.Context, id int64, req models.UpdateServiceItemRequest) (*models.ServiceItem, error) {
	s.clearCache()
	return s.repo.UpdateServiceItem(ctx, id, req)
}

func (s *ServiceService) DeleteServiceItem(ctx context.Context, id int64) error {
	s.clearCache()
	return s.repo.DeleteServiceItem(ctx, id)
}

func (s *ServiceService) ReorderServiceItems(ctx context.Context, ids []int64) error {
	s.clearCache()
	return s.repo.ReorderServiceItems(ctx, ids)
}

// --- Admin: CRUD Requirements ---

func (s *ServiceService) CreateRequirement(ctx context.Context, serviceItemID int64, req models.CreateRequirementRequest) (*models.ServiceRequirement, error) {
	return s.repo.CreateRequirement(ctx, serviceItemID, req)
}

func (s *ServiceService) UpdateRequirement(ctx context.Context, id int64, req models.UpdateRequirementRequest) (*models.ServiceRequirement, error) {
	return s.repo.UpdateRequirement(ctx, id, req)
}

func (s *ServiceService) DeleteRequirement(ctx context.Context, id int64) error {
	return s.repo.DeleteRequirement(ctx, id)
}

func (s *ServiceService) ReorderRequirements(ctx context.Context, ids []int64) error {
	return s.repo.ReorderRequirements(ctx, ids)
}

// --- Admin: CRUD Form Fields ---


func (s *ServiceService) CreateFormField(ctx context.Context, serviceItemID int64, req models.CreateFormFieldRequest) (*models.ServiceFormField, error) {
	return s.repo.CreateFormField(ctx, serviceItemID, req)
}

func (s *ServiceService) UpdateFormField(ctx context.Context, id int64, req models.UpdateFormFieldRequest) (*models.ServiceFormField, error) {
	return s.repo.UpdateFormField(ctx, id, req)
}

func (s *ServiceService) DeleteFormField(ctx context.Context, id int64) error {
	return s.repo.DeleteFormField(ctx, id)
}

func (s *ServiceService) ReorderFormFields(ctx context.Context, ids []int64) error {
	return s.repo.ReorderFormFields(ctx, ids)
}
