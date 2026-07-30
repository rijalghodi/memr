package app

import (
	"app/internal/agent"
	"app/internal/config"
	"app/internal/handler"
	"app/internal/repository"
	"app/internal/usecase"
	firebasepkg "app/pkg/firebase"
	"app/pkg/logger"
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

	// Firebase is used to verify ID tokens for email/password and magic-link
	// (email link) sign-in. It's optional at boot: if no service account is
	// configured yet, we log a warning and disable the /v1/auth/firebase-login
	// route instead of crashing the whole server.
	firebaseUsecase, err := firebasepkg.NewFirebaseUsecase(ctx, config.Env.Firebase.ServiceAccountKeyPath)
	if err != nil {
		logger.Log.Warnf("Firebase not configured, email/magic-link login disabled: %v", err)
		firebaseUsecase = nil
	}

	authHandler := handler.NewAuthHandler(authUsecase, userUsecase, firebaseUsecase)
	authHandler.RegisterRoutes(app)

	// Sync setup
	syncRepo := repository.NewSyncRepository(db, openaiClient)
	syncUsecase := usecase.NewSyncUsecase(syncRepo)
	syncHandler := handler.NewSyncHandler(syncUsecase)
	syncHandler.RegisterRoutes(app)

	// Chat setup
	chatRepo := repository.NewChatRepository(db)
	agentRepo := agent.NewAgentRepository(db)
	toolExecutor := agent.NewToolExecutor(openaiClient, agentRepo)
	chatAgent := agent.NewAgent(openaiClient, toolExecutor)
	chatUsecase := usecase.NewChatUsecase(userRepo, chatRepo, chatAgent, openaiClient)
	chatHandler := handler.NewChatHandler(chatUsecase)
	chatHandler.RegisterRoutes(app)
}
