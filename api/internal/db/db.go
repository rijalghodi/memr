package db

import (
	"fmt"

	"github.com/rijalghodi/memr/api/internal/domain"
	"github.com/rijalghodi/memr/api/libs/config"
	"github.com/rijalghodi/memr/api/libs/logger"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// InitDB initializes the database connection
func InitDB(cfg *config.Config) (*gorm.DB, error) {
	// Build DSN (Data Source Name)
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	// Configure GORM logger
	var logLevel gormlogger.LogLevel
	if cfg.Server.Env == "production" {
		logLevel = gormlogger.Error
	} else {
		logLevel = gormlogger.Info
	}

	// Open database connection
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	logger.Info("Database connection established",
		zap.String("host", cfg.Database.Host),
		zap.String("port", cfg.Database.Port),
		zap.String("database", cfg.Database.Name),
	)

	return db, nil
}

// AutoMigrate runs auto-migration for all models
func AutoMigrate(db *gorm.DB) error {
	logger.Info("Running database auto-migration...")

	if err := db.AutoMigrate(
		&domain.User{},
	); err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	logger.Info("Database auto-migration completed successfully")
	return nil
}

// CloseDB closes the database connection
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

