package models

import (
	"encoding/json"
	"strings"
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
	HTMLVersion     string `json:"html_version" gorm:"size:50"`

	// Heading tags analysis
	H1Tags          string `json:"h1_tags" gorm:"type:text"`
	H2Tags          string `json:"h2_tags" gorm:"type:text"`
	H3Tags          string `json:"h3_tags" gorm:"type:text"`
	H4Tags          string `json:"h4_tags" gorm:"type:text"`
	H5Tags          string `json:"h5_tags" gorm:"type:text"`
	H6Tags          string `json:"h6_tags" gorm:"type:text"`
	H1Count         int    `json:"h1_count" gorm:"default:0"`
	H2Count         int    `json:"h2_count" gorm:"default:0"`
	H3Count         int    `json:"h3_count" gorm:"default:0"`
	H4Count         int    `json:"h4_count" gorm:"default:0"`
	H5Count         int    `json:"h5_count" gorm:"default:0"`
	H6Count         int    `json:"h6_count" gorm:"default:0"`

	// Link analysis
	ImageCount      int    `json:"image_count" gorm:"default:0"`
	LinkCount       int    `json:"link_count" gorm:"default:0"`
	InternalLinks   int    `json:"internal_links" gorm:"default:0"`
	ExternalLinks   int    `json:"external_links" gorm:"default:0"`
	BrokenLinks     int    `json:"broken_links" gorm:"default:0"`
	BrokenLinksList string `json:"broken_links_list" gorm:"type:text"`

	// Form analysis
	HasLoginForm    bool   `json:"has_login_form" gorm:"default:false"`
	FormCount       int    `json:"form_count" gorm:"default:0"`
	
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
	URL   string `json:"url" validate:"required,url" binding:"required"`
	Title string `json:"title,omitempty" validate:"omitempty,min=2,max=100"`
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
	MetaTitle       string      `json:"meta_title"`
	MetaDescription string      `json:"meta_description"`
	HTMLVersion     string      `json:"html_version"`
	HeadingTags     HeadingTags `json:"heading_tags"`
	LinkAnalysis    LinkAnalysis `json:"link_analysis"`
	FormAnalysis    FormAnalysis `json:"form_analysis"`
	ImageCount      int         `json:"image_count"`
}

// HeadingTags represents heading tag analysis
type HeadingTags struct {
	H1Tags  string `json:"h1_tags"`
	H2Tags  string `json:"h2_tags"`
	H3Tags  string `json:"h3_tags"`
	H4Tags  string `json:"h4_tags"`
	H5Tags  string `json:"h5_tags"`
	H6Tags  string `json:"h6_tags"`
	H1Count int    `json:"h1_count"`
	H2Count int    `json:"h2_count"`
	H3Count int    `json:"h3_count"`
	H4Count int    `json:"h4_count"`
	H5Count int    `json:"h5_count"`
	H6Count int    `json:"h6_count"`
}

// BrokenLinkInfo represents a broken link with status information
type BrokenLinkInfo struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
	Error      string `json:"error,omitempty"`
}

// LinkAnalysis represents link analysis data
type LinkAnalysis struct {
	TotalLinks      int               `json:"total_links"`
	InternalLinks   int               `json:"internal_links"`
	ExternalLinks   int               `json:"external_links"`
	BrokenLinks     int               `json:"broken_links"`
	BrokenLinksList []BrokenLinkInfo  `json:"broken_links_list"`
}

// FormAnalysis represents form analysis data
type FormAnalysis struct {
	HasLoginForm bool `json:"has_login_form"`
	FormCount    int  `json:"form_count"`
}

// Performance represents performance metrics
type Performance struct {
	LoadTime float64 `json:"load_time"`
	PageSize int64   `json:"page_size"`
}

// ToResponse converts URL model to URLResponse
func (u *URL) ToResponse() URLResponse {
	// Parse JSON strings back to arrays
	var h1Tags, h2Tags, h3Tags, h4Tags, h5Tags, h6Tags []string
	var brokenLinksList []BrokenLinkInfo

	// Parse heading tags
	if u.H1Tags != "" {
		json.Unmarshal([]byte(u.H1Tags), &h1Tags)
	}
	if u.H2Tags != "" {
		json.Unmarshal([]byte(u.H2Tags), &h2Tags)
	}
	if u.H3Tags != "" {
		json.Unmarshal([]byte(u.H3Tags), &h3Tags)
	}
	if u.H4Tags != "" {
		json.Unmarshal([]byte(u.H4Tags), &h4Tags)
	}
	if u.H5Tags != "" {
		json.Unmarshal([]byte(u.H5Tags), &h5Tags)
	}
	if u.H6Tags != "" {
		json.Unmarshal([]byte(u.H6Tags), &h6Tags)
	}

	// Parse broken links list
	if u.BrokenLinksList != "" {
		json.Unmarshal([]byte(u.BrokenLinksList), &brokenLinksList)
	}

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
			HTMLVersion:     u.HTMLVersion,
			HeadingTags: HeadingTags{
				H1Tags:  strings.Join(h1Tags, ", "),
				H2Tags:  strings.Join(h2Tags, ", "),
				H3Tags:  strings.Join(h3Tags, ", "),
				H4Tags:  strings.Join(h4Tags, ", "),
				H5Tags:  strings.Join(h5Tags, ", "),
				H6Tags:  strings.Join(h6Tags, ", "),
				H1Count: u.H1Count,
				H2Count: u.H2Count,
				H3Count: u.H3Count,
				H4Count: u.H4Count,
				H5Count: u.H5Count,
				H6Count: u.H6Count,
			},
			LinkAnalysis: LinkAnalysis{
				TotalLinks:      u.LinkCount,
				InternalLinks:   u.InternalLinks,
				ExternalLinks:   u.ExternalLinks,
				BrokenLinks:     u.BrokenLinks,
				BrokenLinksList: brokenLinksList,
			},
			FormAnalysis: FormAnalysis{
				HasLoginForm: u.HasLoginForm,
				FormCount:    u.FormCount,
			},
			ImageCount: u.ImageCount,
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
