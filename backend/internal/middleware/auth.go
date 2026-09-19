package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"ptsp-kemenag-backend/internal/config"
	"ptsp-kemenag-backend/internal/utils"
)

// RequireJWT memvalidasi token JWT (baik dari header Authorization Bearer maupun cookie ptsp-auth).
// Identitas pengguna (user_id, email, role, user_type, nama, permissions) disimpan di context locals.
func RequireJWT(cfg *config.Config) fiber.Handler {
	secret := cfg.JWTSecret
	if secret == "" {
		secret = cfg.SupabaseJWTSecret
	}
	if secret == "" {
		secret = "ptsp-kemenag-barito-utara-secret-jwt-key-2026"
	}

	return func(c fiber.Ctx) error {
		var tokenStr string

		// 1. Cek Header Authorization
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 2. Jika tidak ada di header, baca dari cookie ptsp-auth
		if tokenStr == "" {
			tokenStr = c.Cookies("ptsp-auth")
		}

		if tokenStr == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Sesi autentikasi tidak ditemukan. Silakan login terlebih dahulu.",
			})
		}

		// Verifikasi token JWT via utils native
		claims, err := utils.VerifyJWT(tokenStr, secret)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Token autentikasi tidak valid atau sudah kedaluwarsa.",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("nama", claims.Nama)
		c.Locals("role", claims.Role)
		c.Locals("user_type", claims.UserType)
		c.Locals("nip", claims.NIP)
		c.Locals("phone", claims.Phone)
		c.Locals("permissions", claims.Permissions)
		c.Locals("is_verified", claims.IsVerified)

		return c.Next()
	}
}