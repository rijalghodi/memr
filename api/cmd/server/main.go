package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	fiberSwagger "github.com/swaggo/fiber-swagger"

	"github.com/rijalghodi/memr/api/internal/db"
	"github.com/rijalghodi/memr/api/internal/db/seeders"
	"github.com/rijalghodi/memr/api/internal/injector"
	"github.com/rijalghodi/memr/api/internal/middleware"
	"github.com/rijalghodi/memr/api/internal/routes"
	"github.com/rijalghodi/memr/api/libs/config"
	"github.com/rijalghodi/memr/api/libs/logger"
	_ "github.com/rijalghodi/memr/api/swagger" // Import swagger docs
	"go.uber.org/zap"
)

// @title User Service API
// @version 1.0
// @description A Clean Architecture Go API with user management
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	if err := logger.Init(cfg.Server.Env); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Starting server...",
		zap.String("env", cfg.Server.Env),
		zap.String("port", cfg.Server.Port),
	)

	// Initialize database
	database, err := db.InitDB(cfg)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}
	logger.Info("Database initialized successfully")

	// Auto-migrate database
	if err := db.AutoMigrate(database); err != nil {
		logger.Fatal("Failed to migrate database", zap.Error(err))
	}

	// Seed database if in development mode
	if cfg.Server.Env == "development" {
		if err := seeders.SeedAll(database); err != nil {
			logger.Warn("Failed to seed database", zap.Error(err))
		}
	}

	// Initialize dependencies using Wire
	userHandler, err := injector.InitializeUserHandler(database, cfg.JWT.Secret, cfg.JWT.Expiry)
	if err != nil {
		logger.Fatal("Failed to initialize dependencies", zap.Error(err))
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: customErrorHandler,
		AppName:      "User Service API v1.0",
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	app.Use(middleware.Logger())

	// Swagger documentation
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	// Setup routes
	routes.SetupRoutes(app, userHandler, cfg.JWT.Secret)

	// Start server in a goroutine
	go func() {
		addr := fmt.Sprintf(":%s", cfg.Server.Port)
		if err := app.Listen(addr); err != nil {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	logger.Info("Server started successfully",
		zap.String("port", cfg.Server.Port),
		zap.String("swagger", fmt.Sprintf("http://localhost:%s/swagger/index.html", cfg.Server.Port)),
	)

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Gracefully shutdown the server
	if err := app.Shutdown(); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	// Close database connection
	if err := db.CloseDB(database); err != nil {
		logger.Error("Failed to close database connection", zap.Error(err))
	}

	logger.Info("Server exited")
}

// customErrorHandler handles errors from Fiber
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	logger.Error("Request error",
		zap.Int("status", code),
		zap.String("message", message),
		zap.Error(err),
	)

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": message,
		"error":   err.Error(),
	})
}

