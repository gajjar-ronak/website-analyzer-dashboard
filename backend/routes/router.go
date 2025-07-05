package routes

import (
	"net/http"
	"time"

	"website-analyzer-backend/config"
	"website-analyzer-backend/controllers"
	"website-analyzer-backend/middlewares"

	"github.com/gin-gonic/gin"
)

// SetupRouter configures and returns the main router
func SetupRouter(cfg *config.Config) *gin.Engine {
	// Set Gin mode
	gin.SetMode(cfg.Server.Mode)

	// Create router
	router := gin.New()

	// Add global middlewares
	router.Use(middlewares.LoggerMiddleware())
	router.Use(middlewares.RecoveryMiddleware())
	router.Use(middlewares.CORSMiddleware())

	// Health check endpoint (no auth required)
	router.GET("/health", HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes (no auth required)
		v1.GET("/health", HealthCheck)

		// Protected routes (auth required)
		protected := v1.Group("")
		protected.Use(middlewares.AuthMiddleware(cfg))
		{
			setupURLRoutes(protected)
		}
	}

	return router
}

// HealthCheck handles health check requests
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"service":   "website-analyzer-backend",
		"version":   "1.0.0",
	})
}

// setupURLRoutes configures URL-related routes
func setupURLRoutes(rg *gin.RouterGroup) {
	urlController := controllers.NewURLController()

	urls := rg.Group("/urls")
	{
		urls.POST("", urlController.CreateURL)           // POST /api/v1/urls
		urls.GET("", urlController.GetAllURLs)           // GET /api/v1/urls
		urls.GET("/:id", urlController.GetURL)           // GET /api/v1/urls/:id
		urls.PUT("/:id", urlController.UpdateURL)        // PUT /api/v1/urls/:id
		urls.DELETE("/:id", urlController.DeleteURL)     // DELETE /api/v1/urls/:id
		urls.POST("/:id/analyze", urlController.AnalyzeURL) // POST /api/v1/urls/:id/analyze (synchronous)
		urls.POST("/:id/analyze-async", urlController.AnalyzeURLAsync) // POST /api/v1/urls/:id/analyze-async (asynchronous)

		// Bulk operations
		bulk := urls.Group("/bulk")
		{
			bulk.DELETE("", urlController.BulkDeleteURLs)     // DELETE /api/v1/urls/bulk
			bulk.POST("/analyze", urlController.BulkAnalyzeURLs) // POST /api/v1/urls/bulk/analyze
			bulk.POST("/import", urlController.BulkImportURLs)   // POST /api/v1/urls/bulk/import
		}
	}
}
