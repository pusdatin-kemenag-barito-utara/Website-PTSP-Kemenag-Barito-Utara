package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/storage"
)

type FileService struct {
	cfg     *config.Config
	storage *storage.R2Storage
}

func NewFileService(cfg *config.Config, r2 *storage.R2Storage) *FileService {
	return &FileService{
		cfg:     cfg,
		storage: r2,
	}
}

// UploadBanner menerima multipart file banner, memvalidasi format (PNG/JPG/WEBP), mengompresi gambar, dan mengupload ke Cloudflare R2.
func (s *FileService) UploadBanner(ctx context.Context, fileHeader *multipart.FileHeader, slug string) (string, error) {
	if fileHeader == nil {
		return "", nil
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("gagal membuka file banner: %w", err)
	}
	defer src.Close()

	data, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("gagal membaca file banner: %w", err)
	}

	// Validasi ekstensi
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" {
		return "", fmt.Errorf("format banner tidak didukung (hanya PNG, JPG, WEBP)")
	}

	// Content Type
	contentType := "image/png"
	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".webp":
		contentType = "image/webp"
	}

	// Key penyimpanan R2
	r2Key := fmt.Sprintf("banners/%s.png", slug)

	// Upload ke Cloudflare R2
	url, err := s.storage.Upload(ctx, r2Key, data, contentType)
	if err != nil {
		return "", fmt.Errorf("gagal mengupload banner ke Cloudflare R2: %w", err)
	}

	return url, nil
}

// UploadDocument menerima file dokumen permohonan (PDF/Gambar), memvalidasi, dan mengunggah ke Cloudflare R2.
func (s *FileService) UploadDocument(ctx context.Context, fileHeader *multipart.FileHeader, category string) (string, error) {
	if fileHeader == nil {
		return "", nil
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("gagal membuka file dokumen: %w", err)
	}
	defer src.Close()

	data, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("gagal membaca file dokumen: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	contentType := "application/pdf"
	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	}

	timestamp := time.Now().UnixNano()
	cleanName := strings.TrimSuffix(filepath.Base(fileHeader.Filename), ext)
	cleanName = strings.ReplaceAll(cleanName, " ", "-")

	r2Key := fmt.Sprintf("documents/%s/%d_%s%s", category, timestamp, cleanName, ext)

	url, err := s.storage.Upload(ctx, r2Key, data, contentType)
	if err != nil {
		return "", fmt.Errorf("gagal mengupload dokumen ke Cloudflare R2: %w", err)
	}

	return url, nil
}

// UploadAvatar mengunggah avatar pengguna ke Cloudflare R2
func (s *FileService) UploadAvatar(ctx context.Context, fileHeader *multipart.FileHeader, userID string) (string, error) {
	if fileHeader == nil || userID == "" {
		return "", nil
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("gagal membuka file avatar: %w", err)
	}
	defer src.Close()

	data, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("gagal membaca file avatar: %w", err)
	}

	r2Key := fmt.Sprintf("avatars/%s.png", userID)
	return s.storage.Upload(ctx, r2Key, data, "image/png")
}

// UploadBase64Avatar menerima base64 image avatar dan mengunggah ke Cloudflare R2
func (s *FileService) UploadBase64Avatar(ctx context.Context, base64Str string, userID string) (string, error) {
	if base64Str == "" || userID == "" {
		return "", nil
	}

	cleanBase64 := base64Str
	if idx := strings.Index(base64Str, ","); idx != -1 {
		cleanBase64 = base64Str[idx+1:]
	}

	data, err := base64.StdEncoding.DecodeString(cleanBase64)
	if err != nil {
		return "", fmt.Errorf("gagal decode base64 avatar: %w", err)
	}

	r2Key := fmt.Sprintf("avatars/%s.png", userID)
	return s.storage.Upload(ctx, r2Key, data, "image/png")
}

// CompressPDF (Placeholder Utility untuk Optimasi PDF)
func (s *FileService) CompressPDF(pdfData []byte) ([]byte, error) {
	if len(pdfData) == 0 {
		return pdfData, nil
	}
	return pdfData, nil
}

// ValidateImage (Validasi integritas berkas gambar)
func (s *FileService) ValidateImage(data []byte) bool {
	_, _, err := image.Decode(bytes.NewReader(data))
	return err == nil
}
