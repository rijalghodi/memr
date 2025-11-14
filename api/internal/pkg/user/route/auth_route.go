package router

import (
	"app/internal/config"
	"app/internal/middleware"
	"app/internal/pkg/user/controller"
	"app/internal/pkg/user/service"
	"app/internal/shared"

	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(
	v1 fiber.Router, a service.AuthService, u service.UserService,
	t service.TokenService, e shared.EmailService,
) {
	authController := controller.NewAuthController(a, u, t, e)
	config.GoogleConfig()

	auth := v1.Group("/auth")

	auth.Post("/register", authController.Register)
	auth.Post("/login", authController.Login)
	auth.Post("/logout", authController.Logout)
	auth.Post("/refresh-tokens", authController.RefreshTokens)
	auth.Post("/forgot-password", authController.ForgotPassword)
	auth.Post("/reset-password", authController.ResetPassword)
	auth.Post("/send-verification-email", middleware.Auth(u), authController.SendVerificationEmail)
	auth.Post("/verify-email", authController.VerifyEmail)
	auth.Get("/google", authController.GoogleLogin)
	auth.Get("/google-callback", authController.GoogleCallback)
}
