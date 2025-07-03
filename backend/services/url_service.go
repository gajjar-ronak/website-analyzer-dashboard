package services

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"website-analyzer-backend/database"
	"website-analyzer-backend/models"

	"gorm.io/gorm"
)

// URLService handles business logic for URL operations
type URLService struct {
	db *gorm.DB
}

// NewURLService creates a new URL service instance
func NewURLService() *URLService {
	return &URLService{
		db: database.GetDB(),
	}
}

// CreateURL creates a new URL record
func (s *URLService) CreateURL(req models.URLCreateRequest) (*models.URL, error) {
	// Check if URL already exists
	var existingURL models.URL
	if err := s.db.Where("url = ?", req.URL).First(&existingURL).Error; err == nil {
		return nil, errors.New("URL already exists")
	}

	// Create new URL record
	url := models.URL{
		URL:       req.URL,
		Title:     req.Title,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.db.Create(&url).Error; err != nil {
		return nil, fmt.Errorf("failed to create URL: %w", err)
	}

	return &url, nil
}

// GetURLByID retrieves a URL by its ID
func (s *URLService) GetURLByID(id uint) (*models.URL, error) {
	var url models.URL
	if err := s.db.First(&url, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("URL not found")
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}

	return &url, nil
}

// URLFilters represents filters for URL queries
type URLFilters struct {
	Search string
	Status string
}

// GetAllURLs retrieves all URLs with pagination, search, and filtering
func (s *URLService) GetAllURLs(page, limit int, filters URLFilters) ([]models.URL, int64, error) {
	var urls []models.URL
	var total int64

	// Build query with filters
	query := s.db.Model(&models.URL{})

	// Apply search filter
	if filters.Search != "" {
		searchTerm := "%" + filters.Search + "%"
		query = query.Where("url LIKE ? OR title LIKE ? OR description LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	// Apply status filter
	if filters.Status != "" && filters.Status != "all" {
		query = query.Where("status = ?", filters.Status)
	}

	// Count total records with filters
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count URLs: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Get paginated results with filters
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&urls).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get URLs: %w", err)
	}

	return urls, total, nil
}

// UpdateURL updates an existing URL
func (s *URLService) UpdateURL(id uint, req models.URLUpdateRequest) (*models.URL, error) {
	var url models.URL
	if err := s.db.First(&url, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("URL not found")
		}
		return nil, fmt.Errorf("failed to find URL: %w", err)
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&url).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update URL: %w", err)
	}

	// Reload the updated record
	if err := s.db.First(&url, id).Error; err != nil {
		return nil, fmt.Errorf("failed to reload URL: %w", err)
	}

	return &url, nil
}

// DeleteURL deletes a URL by ID
func (s *URLService) DeleteURL(id uint) error {
	result := s.db.Delete(&models.URL{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete URL: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("URL not found")
	}

	return nil
}

// AnalyzeURL performs analysis on a URL (placeholder for future implementation)
func (s *URLService) AnalyzeURL(id uint) error {
	var url models.URL
	if err := s.db.First(&url, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("URL not found")
		}
		return fmt.Errorf("failed to find URL: %w", err)
	}

	// Update status to analyzing
	if err := s.db.Model(&url).Updates(map[string]interface{}{
		"status":     "analyzing",
		"updated_at": time.Now(),
	}).Error; err != nil {
		return fmt.Errorf("failed to update URL status: %w", err)
	}

	// TODO: Implement actual URL analysis logic here
	// This is a placeholder that simulates analysis
	go s.performAnalysis(id)

	return nil
}

// performAnalysis performs basic URL analysis (simplified implementation)
func (s *URLService) performAnalysis(id uint) {
	// Get the URL record
	var url models.URL
	if err := s.db.First(&url, id).Error; err != nil {
		// Mark as failed if URL not found
		s.db.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": "URL record not found",
			"updated_at":    time.Now(),
		})
		return
	}

	// Simulate analysis time (2-5 seconds)
	time.Sleep(time.Duration(2+rand.Intn(3)) * time.Second)

	// Perform basic analysis (placeholder - in real implementation, you'd fetch and parse the URL)
	updates := map[string]interface{}{
		"status":      "completed",
		"status_code": 200, // In real implementation, get actual HTTP status
		"analyzed_at": time.Now(),
		"updated_at":  time.Now(),
	}

	// In a real implementation, you would:
	// 1. Make HTTP request to the URL
	// 2. Parse HTML content
	// 3. Extract meta tags, headings, etc.
	// 4. Measure load time and page size
	// For now, we just mark it as completed without sample data

	if err := s.db.Model(&models.URL{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		// If update fails, mark as failed
		s.db.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": "Failed to update analysis results",
			"updated_at":    time.Now(),
		})
	}
}
