package handler

import (
	"github.com/gofiber/fiber/v2"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"
)

type RequestHandler struct {
	svc *service.RequestService
}

func NewRequestHandler(svc *service.RequestService) *RequestHandler {
	return &RequestHandler{svc: svc}
}

func (h *RequestHandler) GetRequests(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	if userID == "" {
		userID = c.Query("userId")
	}
	status := c.Query("status")
	limit := c.QueryInt("limit", 100)


	data, err := h.svc.GetAll(c.Context(), userID, status, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.ServiceRequest{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *RequestHandler) TrackRequest(c *fiber.Ctx) error {
	reqNum := c.Params("requestNumber")
	res, err := h.svc.Track(c.Context(), reqNum)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "error": "Nomor pengajuan tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

func (h *RequestHandler) GetRequestByID(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.svc.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "error": "Permohonan tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

func (h *RequestHandler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateRequestStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdateStatus(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status pengajuan berhasil diperbarui"})
}

func (h *RequestHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Permohonan berhasil dihapus"})
}

func (h *RequestHandler) GetDashboardStats(c *fiber.Ctx) error {
	stats, err := h.svc.GetDashboardStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": stats})
}
