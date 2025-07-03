package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"website-analyzer-backend/config"
	"website-analyzer-backend/database"
	"website-analyzer-backend/routes"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()
	
	// Initialize database
	if err := database.InitDatabase(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	
	// Setup router
	router := routes.SetupRouter(cfg)
	
	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)
		log.Printf("Server mode: %s", cfg.Server.Mode)
		log.Printf("Health check available at: http://%s:%s/health", cfg.Server.Host, cfg.Server.Port)
		log.Printf("API endpoints available at: http://%s:%s/api/v1", cfg.Server.Host, cfg.Server.Port)
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Println("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	// Close database connection
	if err := database.CloseDatabase(); err != nil {
		log.Printf("Error closing database: %v", err)
	}

	log.Println("Server exited")
}
