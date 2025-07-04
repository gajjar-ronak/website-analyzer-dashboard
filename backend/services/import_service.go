package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/url"
	"path/filepath"
	"strings"

	"website-analyzer-backend/models"

	"github.com/xuri/excelize/v2"
)

// ImportService handles file import operations
type ImportService struct{}

// NewImportService creates a new import service instance
func NewImportService() *ImportService {
	return &ImportService{}
}

// ImportResult represents the result of an import operation
type ImportResult struct {
	URLs   []models.URLCreateRequest `json:"urls"`
	Errors []string                  `json:"errors"`
}

// ParseUploadedFile parses CSV or Excel files and extracts URL data
func (s *ImportService) ParseUploadedFile(file *multipart.FileHeader) (*ImportResult, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Determine file type by extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	
	switch ext {
	case ".csv":
		return s.parseCSVFile(src)
	case ".xlsx", ".xls":
		return s.parseExcelFile(src, file.Size)
	default:
		return nil, errors.New("unsupported file format. Only CSV and Excel files are supported")
	}
}

// parseCSVFile parses a CSV file and extracts URL data
func (s *ImportService) parseCSVFile(reader io.Reader) (*ImportResult, error) {
	csvReader := csv.NewReader(reader)
	
	// Read all records
	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV file: %w", err)
	}

	if len(records) == 0 {
		return nil, errors.New("CSV file is empty")
	}

	result := &ImportResult{
		URLs:   make([]models.URLCreateRequest, 0),
		Errors: make([]string, 0),
	}

	// Find column indices for title and url
	titleCol, urlCol, err := s.findCSVColumns(records[0])
	if err != nil {
		return nil, err
	}

	// Process data rows (skip header)
	for i, record := range records[1:] {
		rowNum := i + 2 // +2 because we skip header and arrays are 0-indexed

		if len(record) <= titleCol || len(record) <= urlCol {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: insufficient columns", rowNum))
			continue
		}

		title := strings.TrimSpace(record[titleCol])
		urlStr := strings.TrimSpace(record[urlCol])

		// Validate URL
		if urlStr == "" {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: URL is empty", rowNum))
			continue
		}

		if !s.isValidURL(urlStr) {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: invalid URL format: %s", rowNum, urlStr))
			continue
		}

		// Add to results
		result.URLs = append(result.URLs, models.URLCreateRequest{
			URL:   urlStr,
			Title: title,
		})
	}

	return result, nil
}

// parseExcelFile parses an Excel file and extracts URL data
func (s *ImportService) parseExcelFile(reader io.Reader, size int64) (*ImportResult, error) {
	// Open Excel file directly from reader
	f, err := excelize.OpenReader(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to open Excel file: %w", err)
	}
	defer f.Close()

	// Get the first sheet
	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, errors.New("Excel file has no sheets")
	}

	// Get all rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("failed to read Excel rows: %w", err)
	}

	if len(rows) == 0 {
		return nil, errors.New("Excel file is empty")
	}

	result := &ImportResult{
		URLs:   make([]models.URLCreateRequest, 0),
		Errors: make([]string, 0),
	}

	// Find column indices for title and url
	titleCol, urlCol, err := s.findCSVColumns(rows[0])
	if err != nil {
		return nil, err
	}

	// Process data rows (skip header)
	for i, row := range rows[1:] {
		rowNum := i + 2 // +2 because we skip header and arrays are 0-indexed

		if len(row) <= titleCol || len(row) <= urlCol {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: insufficient columns", rowNum))
			continue
		}

		title := strings.TrimSpace(row[titleCol])
		urlStr := strings.TrimSpace(row[urlCol])

		// Validate URL
		if urlStr == "" {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: URL is empty", rowNum))
			continue
		}

		if !s.isValidURL(urlStr) {
			result.Errors = append(result.Errors, fmt.Sprintf("Row %d: invalid URL format: %s", rowNum, urlStr))
			continue
		}

		// Add to results
		result.URLs = append(result.URLs, models.URLCreateRequest{
			URL:   urlStr,
			Title: title,
		})
	}

	return result, nil
}

// findCSVColumns finds the column indices for title and url in the header row
func (s *ImportService) findCSVColumns(header []string) (titleCol, urlCol int, err error) {
	titleCol = -1
	urlCol = -1

	for i, col := range header {
		colLower := strings.ToLower(strings.TrimSpace(col))
		
		if titleCol == -1 && (colLower == "title" || colLower == "name" || colLower == "website title") {
			titleCol = i
		}
		
		if urlCol == -1 && (colLower == "url" || colLower == "link" || colLower == "website" || colLower == "website url") {
			urlCol = i
		}
	}

	if urlCol == -1 {
		return 0, 0, errors.New("URL column not found. Expected column names: 'url', 'link', 'website', or 'website url'")
	}

	if titleCol == -1 {
		return 0, 0, errors.New("Title column not found. Expected column names: 'title', 'name', or 'website title'")
	}

	return titleCol, urlCol, nil
}

// isValidURL validates if a string is a valid URL
func (s *ImportService) isValidURL(str string) bool {
	u, err := url.Parse(str)
	return err == nil && u.Scheme != "" && u.Host != ""
}
