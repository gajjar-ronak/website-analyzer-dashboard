package services

import (
	"errors"
	"fmt"
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

// GetAllURLs retrieves all URLs with pagination
func (s *URLService) GetAllURLs(page, limit int) ([]models.URL, int64, error) {
	var urls []models.URL
	var total int64

	// Count total records
	if err := s.db.Model(&models.URL{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count URLs: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Get paginated results
	if err := s.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&urls).Error; err != nil {
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

// performAnalysis simulates URL analysis (placeholder implementation)
func (s *URLService) performAnalysis(id uint) {
	// Simulate analysis time
	time.Sleep(2 * time.Second)

	// Update with mock analysis results
	updates := map[string]interface{}{
		"status":           "completed",
		"status_code":      200,
		"title":           "Sample Website Title",
		"meta_title":      "Sample Meta Title",
		"meta_description": "Sample meta description for the website",
		"h1_tags":         "Main Heading",
		"h2_tags":         "Subheading 1, Subheading 2",
		"image_count":     5,
		"link_count":      10,
		"load_time":       1.25,
		"page_size":       1024000,
		"analyzed_at":     time.Now(),
		"updated_at":      time.Now(),
	}

	s.db.Model(&models.URL{}).Where("id = ?", id).Updates(updates)
}
