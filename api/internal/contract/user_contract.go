package contract

import (
	"context"

	"github.com/rijalghodi/memr/api/internal/domain"
)

// UserRepository defines the interface for user data access
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	FindByID(ctx context.Context, id uint) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	FindAll(ctx context.Context) ([]domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id uint) error
}

// UserUseCase defines the interface for user business logic
type UserUseCase interface {
	CreateUser(ctx context.Context, req *domain.CreateUserRequest) (*domain.UserResponse, error)
	GetUserByID(ctx context.Context, id uint) (*domain.UserResponse, error)
	GetAllUsers(ctx context.Context) ([]domain.UserResponse, error)
	UpdateUser(ctx context.Context, id uint, req *domain.UpdateUserRequest) (*domain.UserResponse, error)
	DeleteUser(ctx context.Context, id uint) error
	Login(ctx context.Context, req *domain.LoginRequest) (*domain.LoginResponse, error)
}


