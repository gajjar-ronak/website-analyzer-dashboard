package database

import (
	"fmt"
	"log"
	"time"

	"website-analyzer-backend/config"
	"website-analyzer-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase initializes the database connection
func InitDatabase(cfg *config.Config) error {
	var err error
	
	// Configure GORM logger
	gormLogger := logger.Default
	if cfg.Server.Mode == "release" {
		gormLogger = logger.Default.LogMode(logger.Silent)
	}

	// Open database connection
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{
		Logger: gormLogger,
	})
	
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection established successfully")

	// Auto-migrate the schema
	if err := AutoMigrate(); err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	return nil
}

// AutoMigrate runs auto migration for all models
func AutoMigrate() error {
	log.Println("Running database migrations...")
	
	err := DB.AutoMigrate(
		&models.URL{},
		// Add more models here as they are created
	)
	
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}
	
	log.Println("Database migrations completed successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// CloseDatabase closes the database connection
func CloseDatabase() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
