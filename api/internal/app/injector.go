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
	firebaseUsecase, err := usecase.NewFirebaseUsecase(ctx, config.Env.Firebase.ServiceAccountKeyPath)
	if err != nil {
		log.Fatalf("Failed to initialize firebase usecase: %v", err)
	}
	// OpenAI setup
	openaiUsecase, err := usecase.NewOpenAIUsecase(config.Env.OpenAI.APIKey)
	if err != nil {
		log.Fatalf("Failed to initialize OpenAI usecase: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	tokenUsecase := usecase.NewTokenUsecase()
	authUsecase := usecase.NewAuthUsecase(userRepo, firebaseUsecase, tokenUsecase)
	userUsecase := usecase.NewUserUsecase(userRepo)
	authHandler := handler.NewAuthHandler(authUsecase, userUsecase)
	authHandler.RegisterRoutes(app)

	// Sync setup
	syncRepo := repository.NewSyncRepository(db, openaiUsecase)
	syncUsecase := usecase.NewSyncUsecase(syncRepo)
	syncHandler := handler.NewSyncHandler(syncUsecase)
	syncHandler.RegisterRoutes(app)
}
