package seeders

import (
	"context"
	"fmt"

	"github.com/rijalghodi/memr/api/internal/domain"
	"github.com/rijalghodi/memr/api/libs/logger"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedUsers seeds the database with sample users
func SeedUsers(db *gorm.DB) error {
	ctx := context.Background()

	// Check if users already exist
	var count int64
	if err := db.Model(&domain.User{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count users: %w", err)
	}

	if count > 0 {
		logger.Info("Users already exist, skipping seed", zap.Int64("count", count))
		return nil
	}

	// Hash password for sample users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Sample users
	users := []domain.User{
		{
			Name:     "John Doe",
			Email:    "john@example.com",
			Password: string(hashedPassword),
		},
		{
			Name:     "Jane Smith",
			Email:    "jane@example.com",
			Password: string(hashedPassword),
		},
		{
			Name:     "Bob Johnson",
			Email:    "bob@example.com",
			Password: string(hashedPassword),
		},
		{
			Name:     "Alice Williams",
			Email:    "alice@example.com",
			Password: string(hashedPassword),
		},
		{
			Name:     "Charlie Brown",
			Email:    "charlie@example.com",
			Password: string(hashedPassword),
		},
	}

	// Insert users
	result := db.WithContext(ctx).Create(&users)
	if result.Error != nil {
		return fmt.Errorf("failed to seed users: %w", result.Error)
	}

	logger.Info("Successfully seeded users", zap.Int("count", len(users)))
	return nil
}

// SeedAll runs all seeders
func SeedAll(db *gorm.DB) error {
	logger.Info("Starting database seeding...")

	if err := SeedUsers(db); err != nil {
		return err
	}

	logger.Info("Database seeding completed successfully")
	return nil
}


