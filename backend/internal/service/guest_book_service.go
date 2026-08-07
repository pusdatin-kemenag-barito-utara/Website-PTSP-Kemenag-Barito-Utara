package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/repository"
)

type GuestBookService struct {
	repo *repository.GuestBookRepository
	cfg  *config.Config
}

func NewGuestBookService(repo *repository.GuestBookRepository, cfg *config.Config) *GuestBookService {
	return &GuestBookService{repo: repo, cfg: cfg}
}

func (s *GuestBookService) GetAll(ctx context.Context, limit int) ([]models.GuestBook, error) {
	if limit <= 0 {
		limit = 100
	}
	return s.repo.FindAll(ctx, limit)
}

func (s *GuestBookService) Create(ctx context.Context, req models.CreateGuestBookRequest, clientIP string) (*models.GuestBook, error) {
	if req.GuestName == "" || req.Whatsapp == "" || req.IntendedOfficer == "" || req.Purpose == "" {
		return nil, errors.New("data tidak lengkap")
	}

	if req.TurnstileToken != "" && s.cfg.TurnstileSecret != "" {
		if !verifyTurnstile(req.TurnstileToken, clientIP, s.cfg.TurnstileSecret) {
			return nil, errors.New("verifikasi keamanan (Turnstile) gagal")
		}
	}

	visitDate := time.Now()
	if req.VisitDate != "" {
		if t, err := time.Parse(time.RFC3339, req.VisitDate); err == nil {
			visitDate = t
		} else if t, err := time.Parse("2006-01-02", req.VisitDate); err == nil {
			visitDate = t
		}
	}


	return s.repo.Create(ctx, req, visitDate)
}

func (s *GuestBookService) Delete(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("ID tidak valid")
	}
	return s.repo.Delete(ctx, id)
}

func verifyTurnstile(token, clientIP, secretKey string) bool {
	body := strings.NewReader(fmt.Sprintf("secret=%s&response=%s&remoteip=%s", secretKey, token, clientIP))
	resp, err := http.Post("https://challenges.cloudflare.com/turnstile/v0/siteverify", "application/x-www-form-urlencoded", body)
	if err != nil || resp.StatusCode != 200 {
		return false
	}
	return true
}
