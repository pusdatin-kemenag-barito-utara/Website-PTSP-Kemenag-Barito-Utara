package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"
)

type AppointmentHandler struct {
	svc *service.AppointmentService
}

func NewAppointmentHandler(svc *service.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{svc: svc}
}

func (h *AppointmentHandler) GetAppointments(c *fiber.Ctx) error {
	status := c.Query("status")
	limit := c.QueryInt("limit", 100)
	data, err := h.svc.GetAll(c.Context(), status, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.Appointment{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *AppointmentHandler) CreateAppointment(c *fiber.Ctx) error {
	var req models.CreateAppointmentRequest
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
		"message": "Berhasil membuat janji temu.",
		"data": fiber.Map{
			"id":              fmt.Sprintf("%d", res.ID),
			"guestName":       res.GuestName,
			"appointmentDate": res.AppointmentDate,
			"appointmentTime": res.AppointmentTime,
		},
	})
}

func (h *AppointmentHandler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateAppointmentStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.UpdateStatus(c.Context(), id, req.Status); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status janji temu berhasil diperbarui"})
}

func (h *AppointmentHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Janji temu berhasil dihapus"})
}
