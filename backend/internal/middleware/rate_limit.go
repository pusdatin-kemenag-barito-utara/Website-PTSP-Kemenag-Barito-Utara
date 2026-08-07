package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// SetupRateLimiter membuat middleware rate limit dengan ambang batas yang ditentukan.
func SetupRateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        200,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Terlalu banyak permintaan. Silakan coba beberapa saat lagi.",
			})
		},
	})
}
