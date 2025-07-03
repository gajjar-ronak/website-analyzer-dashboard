package controllers

import (
	"net/http"
	"strconv"

	"website-analyzer-backend/models"
	"website-analyzer-backend/services"

	"github.com/gin-gonic/gin"
)

// URLController handles HTTP requests for URL operations
type URLController struct {
	urlService *services.URLService
}

// NewURLController creates a new URL controller instance
func NewURLController() *URLController {
	return &URLController{
		urlService: services.NewURLService(),
	}
}

// CreateURL handles POST /api/urls
func (ctrl *URLController) CreateURL(c *gin.Context) {
	var req models.URLCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	url, err := ctrl.urlService.CreateURL(req)
	if err != nil {
		if err.Error() == "URL already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Conflict",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to create URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "URL created successfully",
		"data":    url.ToResponse(),
	})
}

// GetURL handles GET /api/urls/:id
func (ctrl *URLController) GetURL(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid URL ID",
		})
		return
	}

	url, err := ctrl.urlService.GetURLByID(uint(id))
	if err != nil {
		if err.Error() == "URL not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to get URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": url.ToResponse(),
	})
}

// GetAllURLs handles GET /api/urls
func (ctrl *URLController) GetAllURLs(c *gin.Context) {
	// Parse pagination parameters
	pageParam := c.DefaultQuery("page", "1")
	limitParam := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	// Parse filter parameters
	filters := services.URLFilters{
		Search: c.Query("search"),
		Status: c.Query("status"),
	}

	urls, total, err := ctrl.urlService.GetAllURLs(page, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to get URLs",
			"details": err.Error(),
		})
		return
	}

	// Convert to response format
	var urlResponses []models.URLResponse
	for _, url := range urls {
		urlResponses = append(urlResponses, url.ToResponse())
	}

	// Calculate pagination metadata
	totalPages := (int(total) + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data": urlResponses,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// UpdateURL handles PUT /api/urls/:id
func (ctrl *URLController) UpdateURL(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid URL ID",
		})
		return
	}

	var req models.URLUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	url, err := ctrl.urlService.UpdateURL(uint(id), req)
	if err != nil {
		if err.Error() == "URL not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to update URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "URL updated successfully",
		"data":    url.ToResponse(),
	})
}

// DeleteURL handles DELETE /api/urls/:id
func (ctrl *URLController) DeleteURL(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid URL ID",
		})
		return
	}

	err = ctrl.urlService.DeleteURL(uint(id))
	if err != nil {
		if err.Error() == "URL not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to delete URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "URL deleted successfully",
	})
}

// AnalyzeURL handles POST /api/urls/:id/analyze
func (ctrl *URLController) AnalyzeURL(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid URL ID",
		})
		return
	}

	err = ctrl.urlService.AnalyzeURL(uint(id))
	if err != nil {
		if err.Error() == "URL not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Failed to start URL analysis",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"message": "URL analysis started successfully",
	})
}
