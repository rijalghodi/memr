package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rijalghodi/memr/api/internal/pkg"
)

// JWTAuth returns a middleware that validates JWT tokens
func JWTAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return pkg.SendUnauthorized(c, "Missing authorization header")
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return pkg.SendUnauthorized(c, "Invalid authorization header format")
		}

		tokenString := parts[1]

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(secret), nil
		})

		if err != nil {
			return pkg.SendUnauthorized(c, "Invalid or expired token")
		}

		if !token.Valid {
			return pkg.SendUnauthorized(c, "Invalid token")
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Store user ID in context for use in handlers
			if userID, exists := claims["user_id"]; exists {
				c.Locals("user_id", userID)
			}
			if email, exists := claims["email"]; exists {
				c.Locals("email", email)
			}
		}

		return c.Next()
	}
}

// GetUserIDFromContext retrieves the user ID from the context
func GetUserIDFromContext(c *fiber.Ctx) (float64, bool) {
	userID := c.Locals("user_id")
	if userID == nil {
		return 0, false
	}
	id, ok := userID.(float64)
	return id, ok
}

// GetEmailFromContext retrieves the email from the context
func GetEmailFromContext(c *fiber.Ctx) (string, bool) {
	email := c.Locals("email")
	if email == nil {
		return "", false
	}
	emailStr, ok := email.(string)
	return emailStr, ok
}


