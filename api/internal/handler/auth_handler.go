package handler

import (
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
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
	app.Post("/v1/auth/refresh-token", h.RefreshToken)
}

// @Tags Auth
// @Summary Google OAuth
// @Description Google OAuth authentication
// @Accept json
// @Produce json
// @Param request body contract.GoogleOAuthReq true "Google OAuth request"
// @Success 200 {object} util.BaseResponse{data=contract.GoogleOAuthRes}
// @Failure 400 {object} util.BaseResponse
// @Router /v1/auth/google [post]
func (h *AuthHandler) GoogleOAuth(c *fiber.Ctx) error {
	var req contract.GoogleOAuthReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body: %v", err)
		return err
	}

	// Validate request
	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error: %v", err)
		return err
	}

	return h.authUsecase.GoogleOAuth(c, &req)
}

// @Tags Auth
// @Summary Refresh token
// @Description Refresh access token using refresh token
// @Accept json
// @Produce json
// @Param request body contract.RefreshTokenReq true "Refresh token request"
// @Success 200 {object} util.BaseResponse{data=contract.RefreshTokenRes}
// @Failure 401 {object} util.BaseResponse
// @Router /v1/auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req contract.RefreshTokenReq
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Warn("Failed to parse request body: %v", err)
		return err
	}

	if err := util.ValidateStruct(&req); err != nil {
		logger.Log.Warn("Validation error: %v", err)
		return err
	}

	return h.authUsecase.RefreshToken(c, &req)
}

// @Tags Auth
// @Summary Get current user
// @Description Get current user information
// @Accept json
// @Produce json
// @Success 200 {object} util.BaseResponse{data=contract.UserRes}
// @Failure 401 {object} util.BaseResponse
// @Router /v1/auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *fiber.Ctx) error {
	claims, err := middleware.GetAuthClaims(c)
	if err != nil {
		logger.Log.Warn("Failed to get auth claims: %v", err)
		return err
	}

	user, err := h.userUsecase.GetUserByID(c, claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID: %v", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to get user")
	}

	if user == nil {
		logger.Log.Warn("User not found")
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(user))
}
