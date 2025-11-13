package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rijalghodi/memr/api/internal/handler"
	"github.com/rijalghodi/memr/api/internal/middleware"
)

// SetupRoutes sets up all application routes
func SetupRoutes(app *fiber.App, userHandler *handler.UserHandler, jwtSecret string) {
	// API v1 group
	api := app.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/login", userHandler.Login)

	// User routes
	users := api.Group("/users")
	users.Post("/", userHandler.CreateUser)                                       // Public registration
	users.Get("/", middleware.JWTAuth(jwtSecret), userHandler.GetAllUsers)       // Protected
	users.Get("/:id", middleware.JWTAuth(jwtSecret), userHandler.GetUserByID)    // Protected
	users.Put("/:id", middleware.JWTAuth(jwtSecret), userHandler.UpdateUser)     // Protected
	users.Delete("/:id", middleware.JWTAuth(jwtSecret), userHandler.DeleteUser)  // Protected

	// Health check route
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})
}


