package models

import (
	"time"

	"gorm.io/gorm"
)

// URL represents a URL entity in the database
type URL struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	URL         string         `json:"url" gorm:"not null;index" validate:"required,url"`
	Title       string         `json:"title" gorm:"size:500"`
	Description string         `json:"description" gorm:"type:text"`
	Status      string         `json:"status" gorm:"size:20;default:'pending'"` // pending, analyzing, completed, failed
	StatusCode  int            `json:"status_code" gorm:"default:0"`
	
	// SEO Analysis fields
	MetaTitle       string `json:"meta_title" gorm:"size:500"`
	MetaDescription string `json:"meta_description" gorm:"type:text"`
	H1Tags          string `json:"h1_tags" gorm:"type:text"`
	H2Tags          string `json:"h2_tags" gorm:"type:text"`
	ImageCount      int    `json:"image_count" gorm:"default:0"`
	LinkCount       int    `json:"link_count" gorm:"default:0"`
	
	// Performance fields
	LoadTime     float64 `json:"load_time" gorm:"default:0"`
	PageSize     int64   `json:"page_size" gorm:"default:0"`
	
	// Analysis metadata
	AnalyzedAt   *time.Time `json:"analyzed_at"`
	ErrorMessage string     `json:"error_message" gorm:"type:text"`
	
	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the URL model
func (URL) TableName() string {
	return "urls"
}

// URLCreateRequest represents the request payload for creating a URL
type URLCreateRequest struct {
	URL string `json:"url" validate:"required,url" binding:"required"`
}

// URLUpdateRequest represents the request payload for updating a URL
type URLUpdateRequest struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Status      *string `json:"status,omitempty"`
}

// URLResponse represents the response format for URL data
type URLResponse struct {
	ID          uint       `json:"id"`
	URL         string     `json:"url"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	StatusCode  int        `json:"status_code"`
	
	// SEO Analysis
	SEOAnalysis SEOAnalysis `json:"seo_analysis"`
	
	// Performance
	Performance Performance `json:"performance"`
	
	// Metadata
	AnalyzedAt *time.Time `json:"analyzed_at"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// SEOAnalysis represents SEO analysis data
type SEOAnalysis struct {
	MetaTitle       string `json:"meta_title"`
	MetaDescription string `json:"meta_description"`
	H1Tags          string `json:"h1_tags"`
	H2Tags          string `json:"h2_tags"`
	ImageCount      int    `json:"image_count"`
	LinkCount       int    `json:"link_count"`
}

// Performance represents performance metrics
type Performance struct {
	LoadTime float64 `json:"load_time"`
	PageSize int64   `json:"page_size"`
}

// ToResponse converts URL model to URLResponse
func (u *URL) ToResponse() URLResponse {
	return URLResponse{
		ID:          u.ID,
		URL:         u.URL,
		Title:       u.Title,
		Description: u.Description,
		Status:      u.Status,
		StatusCode:  u.StatusCode,
		SEOAnalysis: SEOAnalysis{
			MetaTitle:       u.MetaTitle,
			MetaDescription: u.MetaDescription,
			H1Tags:          u.H1Tags,
			H2Tags:          u.H2Tags,
			ImageCount:      u.ImageCount,
			LinkCount:       u.LinkCount,
		},
		Performance: Performance{
			LoadTime: u.LoadTime,
			PageSize: u.PageSize,
		},
		AnalyzedAt: u.AnalyzedAt,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
	}
}
