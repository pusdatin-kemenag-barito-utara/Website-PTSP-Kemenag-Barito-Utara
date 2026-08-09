package handler

import (
	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	svc     *service.UserService
	fileSvc *service.FileService
}

func NewUserHandler(svc *service.UserService, fileSvc *service.FileService) *UserHandler {
	return &UserHandler{svc: svc, fileSvc: fileSvc}
}

func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	role := c.Query("role")
	status := c.Query("status")
	limit := c.QueryInt("limit", 100)

	data, err := h.svc.GetAll(c.Context(), role, status, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.User{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.svc.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "error": "User tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Payload tidak valid"})
	}

	if err := h.svc.Update(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil diperbarui"})
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		// BodyParser error ignore if multipart
	}

	// Cek jika ada unggahan avatar multipart atau base64
	if fileHeader, err := c.FormFile("avatar"); err == nil && fileHeader != nil && h.fileSvc != nil {
		avatarURL, uploadErr := h.fileSvc.UploadAvatar(c.Context(), fileHeader, id)
		if uploadErr == nil && avatarURL != "" {
			req.AvatarURL = avatarURL
		}
	} else if req.Base64Image != "" && h.fileSvc != nil {
		avatarURL, uploadErr := h.fileSvc.UploadBase64Avatar(c.Context(), req.Base64Image, id)
		if uploadErr == nil && avatarURL != "" {
			req.AvatarURL = avatarURL
		}
	}

	if req.FullName == "" && req.Phone == "" && req.Address == "" && req.AvatarURL == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Tidak ada data yang diperbarui"})
	}
	if err := h.svc.UpdateProfile(c.Context(), id, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "avatar_url": req.AvatarURL, "message": "Profil berhasil diperbarui"})
}

func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "User berhasil dihapus"})
}

func (h *UserHandler) GetAuditLogs(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 100)
	data, err := h.svc.GetAuditLogs(c.Context(), limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if data == nil {
		data = []models.AuditLog{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func (h *UserHandler) Search(c *fiber.Ctx) error {
	q := c.Query("q")
	res, err := h.svc.Search(c.Context(), q)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}
