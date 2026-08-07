package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"
)

type GuestBookHandler struct {
	svc *service.GuestBookService
}

func NewGuestBookHandler(svc *service.GuestBookService) *GuestBookHandler {
	return &GuestBookHandler{svc: svc}
}

func (h *GuestBookHandler) GetGuestBook(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 100)
	data, err := h.svc.GetAll(c.Context(), limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.GuestBook{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *GuestBookHandler) CreateGuestBook(c *fiber.Ctx) error {
	var req models.CreateGuestBookRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	clientIP := c.Get("X-Forwarded-For")
	res, err := h.svc.Create(c.Context(), req, clientIP)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Berhasil menyimpan buku tamu.",
		"data": fiber.Map{
			"id":        fmt.Sprintf("%d", res.ID),
			"guestName": res.GuestName,
			"visitDate": res.VisitDate,
		},
	})
}

func (h *GuestBookHandler) DeleteGuestBook(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Buku tamu berhasil dihapus"})
}
