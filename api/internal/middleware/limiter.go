package middleware

import (
	"app/pkg/util"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// By default, Fiber's limiter middleware uses the same key (IP) for all requests,
// so rate limiting is applied globally per client IP for ALL paths, not per-path.
// To customize and limit per path per client, use the KeyGenerator function:

func LimiterConfig() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        20,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).
				JSON(util.ToErrorResponse("Too many requests, please try again later", nil))
		},
		SkipSuccessfulRequests: true,
		// Set KeyGenerator to combine IP & path for per-path limits per client
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP() + ":" + c.Method() + ":" + c.Path()
		},
	})
}
