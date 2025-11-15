package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUsecase
	userUsecase *usecase.UserUsecase
}

func NewAuthHandler(authUsecase *usecase.AuthUsecase, userUsecase *usecase.UserUsecase) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
		userUsecase: userUsecase,
	}
}

func (h *AuthHandler) RegisterRoutes(app *fiber.App) {
	app.Post("/v1/auth/google", h.GoogleOAuth)
	app.Get("/v1/auth/me", middleware.AuthGuard(), h.GetCurrentUser)
}

func (h *AuthHandler) GoogleOAuth(c *fiber.Ctx) error {
	var req contract.GoogleOAuthReq
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	// Validate request
	if err := util.ValidateStruct(&req); err != nil {
		return err
	}

	return h.authUsecase.GoogleOAuth(c, &req)
}

func (h *AuthHandler) GetCurrentUser(c *fiber.Ctx) error {
	claims := middleware.GetAuthClaims(c)
	user, err := h.userUsecase.GetUserByID(c, claims.ID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}
	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}
