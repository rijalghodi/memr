package usecases

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rijalghodi/memr/api/internal/contract"
	"github.com/rijalghodi/memr/api/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

// userUseCase implements the UserUseCase interface
type userUseCase struct {
	userRepo  contract.UserRepository
	jwtSecret string
	jwtExpiry string
}

// NewUserUseCase creates a new user use case instance
func NewUserUseCase(userRepo contract.UserRepository, jwtSecret, jwtExpiry string) contract.UserUseCase {
	return &userUseCase{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

// CreateUser creates a new user
func (uc *userUseCase) CreateUser(ctx context.Context, req *domain.CreateUserRequest) (*domain.UserResponse, error) {
	// Check if user with email already exists
	existingUser, _ := uc.userRepo.FindByEmail(ctx, req.Email)
	if existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Create user entity
	user := &domain.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	// Save to database
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user.ToResponse(), nil
}

// GetUserByID retrieves a user by ID
func (uc *userUseCase) GetUserByID(ctx context.Context, id uint) (*domain.UserResponse, error) {
	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user.ToResponse(), nil
}

// GetAllUsers retrieves all users
func (uc *userUseCase) GetAllUsers(ctx context.Context) ([]domain.UserResponse, error) {
	users, err := uc.userRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]domain.UserResponse, len(users))
	for i, user := range users {
		responses[i] = *user.ToResponse()
	}

	return responses, nil
}

// UpdateUser updates a user
func (uc *userUseCase) UpdateUser(ctx context.Context, id uint, req *domain.UpdateUserRequest) (*domain.UserResponse, error) {
	// Find existing user
	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		// Check if email is already taken by another user
		existingUser, _ := uc.userRepo.FindByEmail(ctx, req.Email)
		if existingUser != nil && existingUser.ID != id {
			return nil, errors.New("email already taken by another user")
		}
		user.Email = req.Email
	}

	// Save updates
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user.ToResponse(), nil
}

// DeleteUser deletes a user
func (uc *userUseCase) DeleteUser(ctx context.Context, id uint) error {
	return uc.userRepo.Delete(ctx, id)
}

// Login authenticates a user and returns a JWT token
func (uc *userUseCase) Login(ctx context.Context, req *domain.LoginRequest) (*domain.LoginResponse, error) {
	// Find user by email
	user, err := uc.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := uc.generateToken(user)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &domain.LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// generateToken generates a JWT token for a user
func (uc *userUseCase) generateToken(user *domain.User) (string, error) {
	// Parse expiry duration
	expiry, err := time.ParseDuration(uc.jwtExpiry)
	if err != nil {
		expiry = 24 * time.Hour // Default to 24 hours
	}

	// Create claims
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(expiry).Unix(),
		"iat":     time.Now().Unix(),
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token
	tokenString, err := token.SignedString([]byte(uc.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}


