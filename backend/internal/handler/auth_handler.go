package handler

import (
	"os"
	"strings"
	"time"

	"ptsp-kemenag-backend/internal/models"
	"ptsp-kemenag-backend/internal/service"

	"github.com/gofiber/fiber/v3"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// Login memproses request login dan mengatur cookie ptsp-auth HttpOnly.
func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Payload request tidak valid",
		})
	}

	res, err := h.svc.Login(c.Context(), &req)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	// Tentukan masa berlaku cookie
	maxAge := 7 * 24 * 3600 // 7 hari (detik)
	if req.RememberMe {
		maxAge = 30 * 24 * 3600 // 30 hari (detik)
	}

	isProd := os.Getenv("NODE_ENV") == "production" || strings.Contains(c.Hostname(), "kemenag-baritoutara.com")

	// Pasang cookie ptsp-auth langsung dari Golang
	c.Cookie(&fiber.Cookie{
		Name:     "ptsp-auth",
		Value:    res.Token,
		Path:     "/",
		MaxAge:   maxAge,
		Expires:  time.Now().Add(time.Duration(maxAge) * time.Second),
		Secure:   isProd,
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.JSON(res)
}

// Register menangani registrasi akun baru.
func (h *AuthHandler) Register(c fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Payload request tidak valid",
		})
	}

	res, err := h.svc.Register(c.Context(), &req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	isProd := os.Getenv("NODE_ENV") == "production" || strings.Contains(c.Hostname(), "kemenag-baritoutara.com")

	c.Cookie(&fiber.Cookie{
		Name:     "ptsp-auth",
		Value:    res.Token,
		Path:     "/",
		MaxAge:   7 * 24 * 3600,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		Secure:   isProd,
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.Status(201).JSON(res)
}

// Logout menghapus cookie ptsp-auth dan mengakhiri sesi pengguna.
func (h *AuthHandler) Logout(c fiber.Ctx) error {
	isProd := os.Getenv("NODE_ENV") == "production" || strings.Contains(c.Hostname(), "kemenag-baritoutara.com")

	// Hapus cookie sesi ptsp-auth dengan MaxAge -1 dan Expired di masa lalu
	c.Cookie(&fiber.Cookie{
		Name:     "ptsp-auth",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		Secure:   isProd,
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sesi berhasil diakhiri (logout sukses)",
	})
}

// Me mengembalikan informasi pengguna yang sedang login berdasarkan token sesi.
func (h *AuthHandler) Me(c fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil || userID == "" {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"error":   "Sesi tidak terotentikasi",
		})
	}

	user, err := h.svc.GetMe(c.Context(), userID.(string))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Data pengguna tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// ChangePassword memproses perubahan password pengguna.
func (h *AuthHandler) ChangePassword(c fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil || userID == "" {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"error":   "Sesi tidak terotentikasi",
		})
	}

	var req models.ChangePasswordRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Payload request tidak valid",
		})
	}

	userType, _ := c.Locals("user_type").(string)

	err := h.svc.ChangePassword(c.Context(), userID.(string), userType, req.OldPassword, req.NewPassword)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password berhasil diubah",
	})
}

// AdminResetPassword menangani reset password pengguna oleh admin.
func (h *AuthHandler) AdminResetPassword(c fiber.Ctx) error {
	var req models.ResetPasswordRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Payload request tidak valid",
		})
	}

	targetID := c.Params("id")
	if targetID != "" {
		req.UserID = targetID
	}

	if req.UserID == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "User ID dan password baru wajib diisi",
		})
	}

	err := h.svc.ResetPassword(c.Context(), req.UserID, req.UserType, req.Password)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password pengguna berhasil direset",
	})
}

