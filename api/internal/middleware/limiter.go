package middleware

import (
	"app/internal/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func LimiterConfig() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        20,
		Expiration: 15 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).
				JSON(utils.ToErrorResponse("Too many requests, please try again later", nil))
		},
		SkipSuccessfulRequests: true,
	})
}
