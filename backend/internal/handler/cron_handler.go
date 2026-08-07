package handler

import (
	"fmt"
	"time"

	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type CronHandler struct {
	svc *service.SystemService
}

func NewCronHandler(svc *service.SystemService) *CronHandler {
	return &CronHandler{svc: svc}
}

func (h *CronHandler) CleanupDocuments(c *fiber.Ctx) error {
	secret := c.Query("secret")
	if secret == "" {
		secret = c.Get("Authorization")
		if len(secret) > 7 {
			secret = secret[7:]
		}
	}

	processed, deleted, err := h.svc.CleanupDocuments(c.Context(), secret)
	if err != nil {
		if err.Error() == "Unauthorized" {
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if processed == 0 {
		return c.JSON(fiber.Map{"message": "Tidak ada dokumen yang perlu dibersihkan hari ini."})
	}

	return c.JSON(fiber.Map{
		"success":                    true,
		"message":                    fmt.Sprintf("Pembersihan berhasil. %d file ditandai sebagai EXPIRED.", deleted),
		"expired_requests_processed": processed,
	})
}

func (h *CronHandler) KeepAlive(c *fiber.Ctx) error {
	if err := h.svc.KeepAlive(c.Context()); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Backend PTSP aktif",
		"time":    time.Now().Format(time.RFC3339),
	})
}

func (h *CronHandler) GetSystemStatus(c *fiber.Ctx) error {
	status, err := h.svc.GetSystemStatus(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": status})
}

func (h *CronHandler) ToggleGuestBookMode(c *fiber.Ctx) error {
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Format body tidak valid"})
	}
	if err := h.svc.UpdateSystemSettings(c.Context(), body); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Pengaturan sistem berhasil diperbarui"})
}

