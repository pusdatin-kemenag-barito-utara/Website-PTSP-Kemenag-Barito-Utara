package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"ptsp-kemenag-backend/internal/config"
)

// RequireJWT memvalidasi access token Supabase (JWT HS256) pada header Authorization.
// User identity (sub/email/role) disimpan di context locals untuk dipakai handler.
func RequireJWT(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Token tidak ditemukan. Silakan login terlebih dahulu."})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader || tokenStr == "" {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Format token tidak valid."})
		}

		// Dev mode: bila SUPABASE_JWT_SECRET kosong, izinkan tanpa verifikasi (tempuh HANYA untuk pengembangan lokal).
		if cfg.SupabaseJWTSecret == "" {
			c.Locals("user_id", "")
			c.Locals("email", "")
			c.Locals("role", "")
			return c.Next()
		}

		claims, err := verifySupabaseJWT(tokenStr, cfg.SupabaseJWTSecret)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Token tidak valid atau kedaluwarsa."})
		}

		c.Locals("user_id", claims["sub"])
		c.Locals("email", claims["email"])
		c.Locals("role", claims["role"])

		return c.Next()
	}
}

// verifySupabaseJWT memverifikasi token JWT HS256 (standard unpadded base64url).
// Mengembalikan map klaim {sub, email, role} bila valid.
func verifySupabaseJWT(tokenStr, secret string) (map[string]interface{}, error) {
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Struktur token tidak valid.")
	}

	headerPayload := parts[0] + "." + parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(headerPayload))
	expectedSig := mac.Sum(nil)

	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, err
	}
	if !hmac.Equal(sigBytes, expectedSig) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Tanda tangan token tidak valid.")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(payloadBytes, &raw); err != nil {
		return nil, err
	}

	// Cek kedaluwarsa (exp)
	if exp, ok := raw["exp"].(float64); ok && exp > 0 {
		if time.Now().Unix() > int64(exp) {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "Token sudah kedaluwarsa.")
		}
	}

	// Ekstrak role dari app_metadata (struktur Supabase)
	role := ""
	if appMeta, ok := raw["app_metadata"].(map[string]interface{}); ok {
		if r, ok := appMeta["role"].(string); ok {
			role = r
		}
		if role == "" {
			if r, ok := appMeta["app_role"].(string); ok {
				role = r
			}
		}
	}

	claims := map[string]interface{}{
		"sub":   raw["sub"],
		"email": raw["email"],
		"role":  role,
	}
	return claims, nil
}