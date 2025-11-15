package app

import (
	"app/internal/handler"
	"app/internal/repository"
	"app/internal/usecase"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func InjectHTTPHandlers(app *fiber.App, db *gorm.DB) {

	helloUsecase := usecase.NewHelloUsecase()
	helloHandler := handler.NewHelloHandler(helloUsecase)
	helloHandler.RegisterRoutes(app)

	// Auth setup
	userRepo := repository.NewUserRepository(db)
	authUsecase := usecase.NewAuthUsecase(userRepo)
	userUsecase := usecase.NewUserUsecase(userRepo)

	// handler
	authHandler := handler.NewAuthHandler(authUsecase, userUsecase)
	authHandler.RegisterRoutes(app)

}
