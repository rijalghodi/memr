//go:build wireinject
// +build wireinject

package injector

import (
	"github.com/google/wire"
	"github.com/rijalghodi/memr/api/internal/handler"
	"github.com/rijalghodi/memr/api/internal/repository"
	"github.com/rijalghodi/memr/api/internal/usecases"
	"gorm.io/gorm"
)

// InitializeUserHandler initializes and returns a UserHandler with all dependencies
func InitializeUserHandler(db *gorm.DB, jwtSecret string, jwtExpiry string) (*handler.UserHandler, error) {
	wire.Build(
		repository.NewUserRepository,
		usecases.NewUserUseCase,
		handler.NewUserHandler,
	)
	return &handler.UserHandler{}, nil
}


