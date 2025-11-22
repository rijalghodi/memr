package handler

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/middleware"
	"app/internal/usecase"
	"app/pkg/logger"
	"app/pkg/util"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
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
	app.Get("/v1/auth/me", middleware.AuthGuard(), h.GetCurrentUser)
	app.Post("/v1/auth/refresh-token", h.RefreshToken)
	app.Get("/v1/auth/google/login", h.GoogleLogin)
	app.Get("/v1/auth/google/callback", h.GoogleCallback)
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

// @Tags Auth
// @Summary Initiate Google OAuth login
// @Description Redirects to Google OAuth login page
// @Accept json
// @Produce json
// @Success 302
// @Router /v1/auth/google/login [get]
func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	// Generate a random state for CSRF protection
	stateBytes := make([]byte, 32)
	if _, err := rand.Read(stateBytes); err != nil {
		logger.Log.Error("Failed to generate state: %v", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to generate state")
	}
	state := base64.URLEncoding.EncodeToString(stateBytes)

	// Store state in cookie (httpOnly for security)
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_state",
		Value:    state,
		HTTPOnly: true,
		Secure:   true, // Set to true in production with HTTPS
		SameSite: "Lax",
		MaxAge:   600, // 10 minutes
		Path:     "/",
	})

	// Get Google OAuth config
	googleConfig := config.GoogleConfig()

	// Generate OAuth URL with state and additional parameters for refresh token
	// access_type=offline and prompt=consent ensure we get a refresh token
	authURL := googleConfig.AuthCodeURL(state,
		oauth2.SetAuthURLParam("access_type", "offline"),
		oauth2.SetAuthURLParam("prompt", "consent"),
	)

	// Redirect to Google OAuth
	return c.Redirect(authURL, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	state := c.Query("state")
	storedState := c.Cookies("oauth_state")

	if state != storedState {
		return fiber.NewError(fiber.StatusUnauthorized, "States don't Match!")
	}

	code := c.Query("code")
	googlecon := config.GoogleConfig()

	token, err := googlecon.Exchange(context.Background(), code)
	if err != nil {
		logger.Log.Error("Failed to exchange code: %v", err)
		return err
	}

	req, err := http.NewRequestWithContext(
		c.Context(), http.MethodGet,
		"https://www.googleapis.com/oauth2/v2/userinfo?access_token="+token.AccessToken,
		nil,
	)
	if err != nil {
		logger.Log.Error("Failed to get google user info: %v", err)
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Log.Error("Failed to do request: %v", err)
		return err
	}
	defer resp.Body.Close()

	userData, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	googleUser := new(contract.GoogleLoginReq)
	if errJSON := json.Unmarshal(userData, googleUser); errJSON != nil {
		return errJSON
	}

	res, err := h.authUsecase.LoginGoogleUser(c, googleUser)
	if err != nil {
		return err
	}

	googleLoginURL := fmt.Sprintf("%s?accessToken=%s&refreshToken=%s",
		config.Env.GoogleOAuth.ClientCallbackURI, res.TokenRes.AccessToken, res.TokenRes.RefreshToken)

	return c.Status(fiber.StatusSeeOther).Redirect(googleLoginURL)
}
