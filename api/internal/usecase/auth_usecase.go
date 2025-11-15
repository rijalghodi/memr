package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/util"
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthUsecase struct {
	userRepo *repository.UserRepository
}

func NewAuthUsecase(userRepo *repository.UserRepository) *AuthUsecase {
	return &AuthUsecase{userRepo: userRepo}
}

type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

func (u *AuthUsecase) GoogleOAuth(c *fiber.Ctx, req *contract.GoogleOAuthReq) error {

	// Verify Google ID token
	googleInfo, err := u.verifyGoogleToken(req.IDToken)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid Google ID token")
	}

	var user *model.User

	// Step 1: Check if user exists by Google ID
	user, err = u.userRepo.GetUserByGoogleID(googleInfo.Sub)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to query user by Google ID")
	}

	// Step 2: If not found by Google ID, check by email
	if user == nil {
		user, err = u.userRepo.GetUserByEmail(googleInfo.Email)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to query user by email")
		}
	}

	// Step 3: Handle user creation or update
	if user == nil {
		// User doesn't exist - create new user
		newUser := &model.User{
			ID:         uuid.New().String(),
			Name:       googleInfo.Name,
			Email:      googleInfo.Email,
			GoogleID:   googleInfo.Sub,
			IsVerified: true,
		}
		if err := u.userRepo.CreateUser(newUser); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
		}
		user = newUser
	} else if user.GoogleID == "" || user.GoogleID != googleInfo.Sub {
		// User exists but doesn't have Google ID or has different Google ID
		// Update user with Google ID and verify status
		user.GoogleID = googleInfo.Sub
		user.IsVerified = true
		user.Name = googleInfo.Name // Update name from Google

		if err := u.userRepo.UpdateUser(user); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to update user")
		}
	}

	// Generate JWT access token
	expiresAt := time.Now().Add(time.Duration(config.Env.JWT.AccessExpMinutes) * time.Minute)

	accessToken, err := util.GenerateToken(user.ID, "", config.TokenTypeAccess, config.Env.JWT.Secret, expiresAt)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to generate token")
	}

	// Prepare response
	res := contract.GoogleOAuthRes{
		AccessToken:          accessToken,
		AccessTokenExpiresAt: expiresAt.Format(time.RFC3339),
		UserRes: contract.UserRes{
			ID:         user.ID,
			Email:      user.Email,
			Name:       user.Name,
			IsVerified: user.IsVerified,
			CreatedAt:  user.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  user.UpdatedAt.Format(time.RFC3339),
		},
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

func (u *AuthUsecase) GetCurrentUser(c *fiber.Ctx) error {
	// Get user from context (set by Auth middleware)
	userLocal := c.Locals("user")
	if userLocal == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
	}

	user, ok := userLocal.(*model.User)
	if !ok {
		return fiber.NewError(fiber.StatusInternalServerError, "Invalid user data")
	}

	// Prepare response
	res := contract.UserRes{
		ID:         user.ID,
		Email:      user.Email,
		Name:       user.Name,
		IsVerified: user.IsVerified,
		CreatedAt:  user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  user.UpdatedAt.Format(time.RFC3339),
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

func (u *AuthUsecase) verifyGoogleToken(idToken string) (*GoogleTokenInfo, error) {
	// Verify token with Firebase Admin SDK
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	token, err := config.FirebaseAuth.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	// Extract user info from token claims
	email, _ := token.Claims["email"].(string)
	name, _ := token.Claims["name"].(string)
	picture, _ := token.Claims["picture"].(string)
	emailVerified, _ := token.Claims["email_verified"].(bool)

	tokenInfo := &GoogleTokenInfo{
		Sub:           token.UID,
		Email:         email,
		EmailVerified: fmt.Sprintf("%t", emailVerified),
		Name:          name,
		Picture:       picture,
	}

	return tokenInfo, nil
}
