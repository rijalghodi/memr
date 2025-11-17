package app

import (
	"app/internal/config"
	"app/internal/handler"
	"app/internal/repository"
	"app/internal/usecase"
	"app/pkg/openai"
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func InjectHTTPHandlers(ctx context.Context, app *fiber.App, db *gorm.DB) {

	helloUsecase := usecase.NewHelloUsecase()
	helloHandler := handler.NewHelloHandler(helloUsecase)
	helloHandler.RegisterRoutes(app)

	// OpenAI setup
	openaiClient, err := openai.NewOpenAIClient(config.Env.OpenAI.APIKey)
	if err != nil {
		log.Fatalf("Failed to initialize OpenAI client: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	tokenUsecase := usecase.NewTokenUsecase()
	authUsecase := usecase.NewAuthUsecase(userRepo, tokenUsecase)
	userUsecase := usecase.NewUserUsecase(userRepo)
	authHandler := handler.NewAuthHandler(authUsecase, userUsecase)
	authHandler.RegisterRoutes(app)

	// Sync setup
	syncRepo := repository.NewSyncRepository(db, openaiClient)
	syncUsecase := usecase.NewSyncUsecase(syncRepo)
	syncHandler := handler.NewSyncHandler(syncUsecase)
	syncHandler.RegisterRoutes(app)
}
