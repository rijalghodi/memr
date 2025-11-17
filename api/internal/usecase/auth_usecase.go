package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/internal/model"
	"app/internal/repository"
	"app/pkg/logger"
	"app/pkg/util"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type AuthUsecase struct {
	userRepo     *repository.UserRepository
	tokenUsecase *TokenUsecase
}

func NewAuthUsecase(userRepo *repository.UserRepository, tokenUsecase *TokenUsecase) *AuthUsecase {
	return &AuthUsecase{
		userRepo:     userRepo,
		tokenUsecase: tokenUsecase,
	}
}

func (u *AuthUsecase) LoginGoogleUser(c *fiber.Ctx, req *contract.GoogleLoginReq) (*contract.GoogleLoginRes, error) {
	userFromDB, err := u.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		if err.Error() == "User not found" {
			user := &model.User{
				Name:       req.Name,
				Email:      req.Email,
				IsVerified: req.VerifiedEmail,
			}

			if err := u.userRepo.CreateUser(user); err != nil {
				logger.Log.Errorf("Failed to create user: %+v", err)
				return nil, err
			}

			tokens, err := u.tokenUsecase.GenerateTokenPair(user.ID)
			if err != nil {
				logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
				return nil, err
			}

			return &contract.GoogleLoginRes{
				TokenRes: *tokens,
				UserRes:  u.buildUserRes(user),
			}, nil
		}

		return nil, err
	}

	userFromDB.IsVerified = req.VerifiedEmail
	if err := u.userRepo.UpdateUser(userFromDB); err != nil {
		logger.Log.Errorf("Failed to update user: %+v", err)
		return nil, err
	}

	tokens, err := u.tokenUsecase.GenerateTokenPair(userFromDB.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", userFromDB.ID))
		return nil, err
	}

	return &contract.GoogleLoginRes{
		TokenRes: *tokens,
		UserRes:  u.buildUserRes(userFromDB),
	}, nil
}

func (u *AuthUsecase) RefreshToken(c *fiber.Ctx, req *contract.RefreshTokenReq) error {
	claims, err := util.VerifyToken(req.RefreshToken, config.Env.JWT.Secret)
	if err != nil {
		logger.Log.Error("Invalid or expired refresh token", zap.Error(err))
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	if claims.Type != config.TokenTypeRefresh {
		logger.Log.Warn("Invalid token type for refresh", zap.String("tokenType", claims.Type))
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token type")
	}

	user, err := u.userRepo.GetUserByID(claims.ID)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", claims.ID))
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	if user == nil {
		logger.Log.Warn("User not found for token refresh", zap.String("userID", claims.ID))
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	tokens, err := u.tokenUsecase.GenerateTokenPair(user.ID)
	if err != nil {
		logger.Log.Error("Failed to generate token pair", zap.Error(err), zap.String("userID", user.ID))
		return fiber.NewError(fiber.StatusInternalServerError)
	}

	res := contract.RefreshTokenRes{
		TokenRes: *tokens,
		UserRes:  u.buildUserRes(user),
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

func (u *AuthUsecase) GetUserByID(id string) (*model.User, error) {
	user, err := u.userRepo.GetUserByID(id)
	if err != nil {
		logger.Log.Error("Failed to get user by ID", zap.Error(err), zap.String("userID", id))
		return nil, fiber.NewError(fiber.StatusInternalServerError)
	}
	return user, nil
}

func (u *AuthUsecase) buildUserRes(user *model.User) contract.UserRes {
	return contract.UserRes{
		ID:         user.ID,
		Email:      user.Email,
		Name:       user.Name,
		IsVerified: user.IsVerified,
		CreatedAt:  user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  user.UpdatedAt.Format(time.RFC3339),
	}
}
