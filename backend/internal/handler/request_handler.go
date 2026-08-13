package handler

import (
	"path/filepath"
	"strings"

	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type RequestHandler struct {
	svc     *service.RequestService
	fileSvc *service.FileService
}

func NewRequestHandler(svc *service.RequestService, fileSvc *service.FileService) *RequestHandler {
	return &RequestHandler{svc: svc, fileSvc: fileSvc}
}

func (h *RequestHandler) GetRequests(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	if userID == "" {
		userID = c.Query("userId")
	}
	status := c.Query("status")
	category := c.Query("category")
	if category == "" {
		category = c.Query("type")
	}
	limit := c.QueryInt("limit", 100)

	data, err := h.svc.GetAll(c.Context(), userID, status, category, limit)
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

func (h *RequestHandler) UploadDocument(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("document")
	if err != nil || fileHeader == nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "File dokumen tidak ditemukan"})
	}

	category := c.FormValue("category", "umum")
	url, uploadErr := h.fileSvc.UploadDocument(c.Context(), fileHeader, category)
	if uploadErr != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": uploadErr.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "url": url, "data": fiber.Map{"url": url}})
}

// AttachDocument mengunggah dokumen revisi & menyimpannya ke record dokumen permohonan.
func (h *RequestHandler) AttachDocument(c *fiber.Ctx) error {
	requestID := c.Params("id")

	fileHeader, err := c.FormFile("document")
	if err != nil || fileHeader == nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "File dokumen tidak ditemukan"})
	}

	requirementID := c.FormValue("requirementId", "")
	category := c.FormValue("category", "revisi")

	url, uploadErr := h.fileSvc.UploadDocument(c.Context(), fileHeader, category)
	if uploadErr != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": uploadErr.Error()})
	}

	fileType := "application/octet-stream"
	switch strings.ToLower(filepath.Ext(fileHeader.Filename)) {
	case ".pdf":
		fileType = "application/pdf"
	case ".jpg", ".jpeg":
		fileType = "image/jpeg"
	case ".png":
		fileType = "image/png"
	case ".webp":
		fileType = "image/webp"
	}

	if attachErr := h.svc.AttachDocument(c.Context(), requestID, requirementID, fileHeader.Filename, url, fileType, fileHeader.Size); attachErr != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": attachErr.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dokumen berhasil diunggah",
		"url":     url,
		"data": fiber.Map{
			"url": url,
		},
	})
}

// CreateByApplicant membuat permohonan baru oleh pemohon (JSON: userId, serviceId, serviceItemId, answers[]).
func (h *RequestHandler) CreateByApplicant(c *fiber.Ctx) error {
	var req struct {
		UserID        string                `json:"userId"`
		ServiceID     int64                 `json:"serviceId"`
		ServiceItemID int64                 `json:"serviceItemId"`
		Answers       []models.RequestAnswer `json:"answers"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if req.UserID == "" || req.ServiceID == 0 {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "userId dan serviceId wajib diisi"})
	}

	created, err := h.svc.CreateByApplicant(c.Context(), req.UserID, req.ServiceID, req.ServiceItemID, req.Answers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"success": true, "data": created, "id": created.ID, "requestNumber": created.RequestNumber})
}

// UpdateByApplicant memperbarui permohonan milik pemohon.
func (h *RequestHandler) UpdateByApplicant(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		UserID  string                `json:"userId"`
		Answers []models.RequestAnswer `json:"answers"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}
	if req.UserID == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
	}

	if err := h.svc.UpdateByApplicant(c.Context(), id, req.UserID, req.Answers); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Permohonan berhasil diperbarui"})
}

// DeleteByApplicant menghapus permohonan milik pemohon (query: ?userId=).
func (h *RequestHandler) DeleteByApplicant(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Query("userId")
	if userID == "" {
		userID = c.Query("user_id")
	}
	if userID == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
	}

	if err := h.svc.DeleteByApplicant(c.Context(), id, userID); err != nil {
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
