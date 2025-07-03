package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration for our application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port string
	Host string
	Mode string // gin mode: debug, release, test
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	Charset  string
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	APIToken string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "localhost"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "website_analyzer"),
			Charset:  getEnv("DB_CHARSET", "utf8mb4"),
		},
		Auth: AuthConfig{
			APIToken: getEnv("API_TOKEN", "your-secret-api-token"),
		},
	}

	return config
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// GetDSN returns the database connection string
func (c *Config) GetDSN() string {
	return c.Database.User + ":" + c.Database.Password + "@tcp(" + 
		   c.Database.Host + ":" + c.Database.Port + ")/" + 
		   c.Database.DBName + "?charset=" + c.Database.Charset + 
		   "&parseTime=True&loc=Local"
}
