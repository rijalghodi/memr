package app

import (
	healthcontroller "app/internal/pkg/health/controller"
	healthservice "app/internal/pkg/health/service"
	userrouter "app/internal/pkg/user/route"
	userservice "app/internal/pkg/user/service"
	"app/internal/shared"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	"gorm.io/gorm"
)

func Routes(app *fiber.App, db *gorm.DB) {
	validate := shared.Validator()

	healthCheckService := healthservice.NewHealthCheckService(db)
	healthCheckController := healthcontroller.NewHealthCheckController(healthCheckService)

	emailService := shared.NewEmailService()
	userService := userservice.NewUserService(db, validate)
	tokenService := userservice.NewTokenService(db, validate, userService)
	authService := userservice.NewAuthService(db, validate, userService, tokenService)

	docs := app.Group("/docs")

	docs.Get("/*", swagger.HandlerDefault)

	v1 := app.Group("/v1")

	// Health check routes
	healthCheck := v1.Group("/health-check")
	healthCheck.Get("/", healthCheckController.Check)

	// User routes
	userrouter.AuthRoutes(v1, authService, userService, tokenService, emailService)
	userrouter.UserRoutes(v1, userService, tokenService)
	// TODO: add another routes here...
}
