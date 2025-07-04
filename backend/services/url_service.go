package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"website-analyzer-backend/database"
	"website-analyzer-backend/models"

	"gorm.io/gorm"
)

// URLService handles business logic for URL operations
type URLService struct {
	db          *gorm.DB
	seoAnalyzer *SEOAnalyzer
}

// NewURLService creates a new URL service instance
func NewURLService() *URLService {
	return &URLService{
		db:          database.GetDB(),
		seoAnalyzer: NewSEOAnalyzer(),
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
	Search    string
	Status    string
	SortBy    string
	SortOrder string
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

	// Apply sorting
	orderClause := "created_at DESC" // default sorting
	if filters.SortBy != "" {
		validSortFields := map[string]string{
			"created_at":       "created_at",
			"title":           "title",
			"url":             "url",
			"status":          "status",
			"html_version":    "html_version",
			"internal_links":  "internal_links",
			"external_links":  "external_links",
			"load_time":       "load_time",
			"page_size":       "page_size",
		}

		if dbField, exists := validSortFields[filters.SortBy]; exists {
			sortOrder := "ASC"
			if filters.SortOrder == "desc" {
				sortOrder = "DESC"
			}
			orderClause = fmt.Sprintf("%s %s", dbField, sortOrder)
		}
	}

	// Get paginated results with filters and sorting
	if err := query.Offset(offset).Limit(limit).Order(orderClause).Find(&urls).Error; err != nil {
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

// performAnalysis performs comprehensive SEO analysis on a URL
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

	log.Printf("Starting SEO analysis for URL: %s", url.URL)

	// Perform comprehensive SEO analysis
	result, err := s.seoAnalyzer.AnalyzeURL(url.URL)
	if err != nil {
		// Mark as failed if analysis fails
		s.db.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": fmt.Sprintf("Analysis failed: %v", err),
			"updated_at":    time.Now(),
		})
		return
	}

	// Convert arrays to JSON strings for database storage
	jsonStrings, err := s.seoAnalyzer.ConvertToJSONStrings(result)
	if err != nil {
		log.Printf("Failed to convert analysis results to JSON: %v", err)
		s.db.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": "Failed to process analysis results",
			"updated_at":    time.Now(),
		})
		return
	}

	// Prepare updates with all analysis results
	updates := map[string]interface{}{
		"status":      "completed",
		"status_code": result.StatusCode,
		"analyzed_at": time.Now(),
		"updated_at":  time.Now(),

		// SEO Analysis fields
		"html_version":     result.HTMLVersion,
		"meta_title":       result.MetaTitle,
		"meta_description": result.MetaDescription,

		// Heading tags
		"h1_tags":  jsonStrings["h1_tags"],
		"h2_tags":  jsonStrings["h2_tags"],
		"h3_tags":  jsonStrings["h3_tags"],
		"h4_tags":  jsonStrings["h4_tags"],
		"h5_tags":  jsonStrings["h5_tags"],
		"h6_tags":  jsonStrings["h6_tags"],
		"h1_count": result.H1Count,
		"h2_count": result.H2Count,
		"h3_count": result.H3Count,
		"h4_count": result.H4Count,
		"h5_count": result.H5Count,
		"h6_count": result.H6Count,

		// Link analysis
		"image_count":        result.ImageCount,
		"link_count":         result.TotalLinks,
		"internal_links":     result.InternalLinks,
		"external_links":     result.ExternalLinks,
		"broken_links":       len(result.BrokenLinks),
		"broken_links_list":  jsonStrings["broken_links_list"],

		// Form analysis
		"has_login_form": result.HasLoginForm,
		"form_count":     result.FormCount,

		// Performance
		"load_time": result.LoadTime,
		"page_size": result.PageSize,
	}

	// Add error message if there was one during analysis
	if result.ErrorMessage != "" {
		updates["error_message"] = result.ErrorMessage
		// If there was an error but we got some results, mark as completed with warnings
		if result.StatusCode > 0 {
			updates["status"] = "completed"
		} else {
			updates["status"] = "failed"
		}
	}

	// Update the database with analysis results
	if err := s.db.Model(&models.URL{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		log.Printf("Failed to update analysis results: %v", err)
		// If update fails, mark as failed
		s.db.Model(&models.URL{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":        "failed",
			"error_message": "Failed to save analysis results",
			"updated_at":    time.Now(),
		})
		return
	}

	log.Printf("SEO analysis completed successfully for URL: %s", url.URL)
}

// BulkDeleteURLs deletes multiple URLs by their IDs
func (s *URLService) BulkDeleteURLs(ids []uint) error {
	if len(ids) == 0 {
		return errors.New("no IDs provided")
	}

	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete URLs in bulk
	result := tx.Where("id IN ?", ids).Delete(&models.URL{})
	if result.Error != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete URLs: %w", result.Error)
	}

	// Check if any URLs were actually deleted
	if result.RowsAffected == 0 {
		tx.Rollback()
		return errors.New("no URLs found with the provided IDs")
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Successfully deleted %d URLs", result.RowsAffected)
	return nil
}

// BulkAnalyzeURLs triggers analysis for multiple URLs by their IDs
func (s *URLService) BulkAnalyzeURLs(ids []uint) error {
	if len(ids) == 0 {
		return errors.New("no IDs provided")
	}

	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Update status to analyzing for all URLs
	result := tx.Model(&models.URL{}).Where("id IN ?", ids).Updates(map[string]interface{}{
		"status":     "analyzing",
		"updated_at": time.Now(),
	})
	if result.Error != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update URL status: %w", result.Error)
	}

	// Check if any URLs were actually updated
	if result.RowsAffected == 0 {
		tx.Rollback()
		return errors.New("no URLs found with the provided IDs")
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Start analysis for each URL in separate goroutines
	for _, id := range ids {
		go s.performAnalysis(id)
	}

	log.Printf("Successfully started analysis for %d URLs", result.RowsAffected)
	return nil
}

// BulkImportURLs creates multiple URLs from import data
func (s *URLService) BulkImportURLs(urls []models.URLCreateRequest) ([]models.URL, []error) {
	if len(urls) == 0 {
		return nil, []error{errors.New("no URLs provided")}
	}

	var createdURLs []models.URL
	var errors []error

	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, []error{fmt.Errorf("failed to start transaction: %w", tx.Error)}
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for i, urlReq := range urls {
		// Check if URL already exists
		var existingURL models.URL
		if err := tx.Where("url = ?", urlReq.URL).First(&existingURL).Error; err == nil {
			errors = append(errors, fmt.Errorf("row %d: URL already exists: %s", i+1, urlReq.URL))
			continue
		}

		// Create new URL record
		url := models.URL{
			URL:       urlReq.URL,
			Title:     urlReq.Title,
			Status:    "pending",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := tx.Create(&url).Error; err != nil {
			errors = append(errors, fmt.Errorf("row %d: failed to create URL %s: %w", i+1, urlReq.URL, err))
			continue
		}

		createdURLs = append(createdURLs, url)
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, []error{fmt.Errorf("failed to commit transaction: %w", err)}
	}

	// Start analysis for each created URL in separate goroutines
	for _, url := range createdURLs {
		go s.performAnalysis(url.ID)
	}

	log.Printf("Successfully imported %d URLs with %d errors", len(createdURLs), len(errors))
	return createdURLs, errors
}
