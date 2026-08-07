package service

import (
	"context"
	"errors"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type AppointmentService struct {
	repo *repository.AppointmentRepository
	cfg  *config.Config
}

func NewAppointmentService(repo *repository.AppointmentRepository, cfg *config.Config) *AppointmentService {
	return &AppointmentService{repo: repo, cfg: cfg}
}

func (s *AppointmentService) GetAll(ctx context.Context, statusFilter string, limit int) ([]models.Appointment, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAll(ctx, statusFilter, limit)
}

func (s *AppointmentService) Create(ctx context.Context, req models.CreateAppointmentRequest, clientIP string) (*models.Appointment, error) {
	if req.GuestName == "" || req.Whatsapp == "" || req.AppointmentDate == "" || req.AppointmentTime == "" {
		return nil, errors.New("data tidak lengkap")
	}

	if req.TurnstileToken != "" && s.cfg.TurnstileSecret != "" {
		if !verifyTurnstile(req.TurnstileToken, clientIP, s.cfg.TurnstileSecret) {
			return nil, errors.New("verifikasi keamanan (Turnstile) gagal")
		}
	}

	appointmentDate, err := time.Parse("2006-01-02", req.AppointmentDate)
	if err != nil {
		appointmentDate = time.Now()
	}

	return s.repo.Create(ctx, req, appointmentDate)
}

func (s *AppointmentService) UpdateStatus(ctx context.Context, id, status string) error {
	if id == "" || status == "" {
		return errors.New("parameter tidak lengkap")
	}
	return s.repo.UpdateStatus(ctx, id, status)
}

func (s *AppointmentService) Delete(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("ID tidak valid")
	}
	return s.repo.Delete(ctx, id)
}
