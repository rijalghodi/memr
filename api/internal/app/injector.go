package app

import (
	"app/internal/config"
	"app/internal/handler"
	"app/internal/repository"
	"app/internal/usecase"
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func InjectHTTPHandlers(ctx context.Context, app *fiber.App, db *gorm.DB) {
	helloUsecase := usecase.NewHelloUsecase()
	helloHandler := handler.NewHelloHandler(helloUsecase)
	helloHandler.RegisterRoutes(app)

	// Auth setup
	userRepo := repository.NewUserRepository(db)
	firebaseUsecase, err := usecase.NewFirebaseUsecase(ctx, config.Env.Firebase.ServiceAccountKeyPath)
	if err != nil {
		log.Fatalf("Failed to initialize firebase usecase: %v", err)
	}
	authUsecase := usecase.NewAuthUsecase(userRepo, firebaseUsecase)
	userUsecase := usecase.NewUserUsecase(userRepo)

	// handler
	authHandler := handler.NewAuthHandler(authUsecase, userUsecase)
	authHandler.RegisterRoutes(app)

}
