package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"website-analyzer-backend/models"
)

// SEOAnalyzer handles comprehensive SEO analysis of websites
type SEOAnalyzer struct {
	client *http.Client
}

// NewSEOAnalyzer creates a new SEO analyzer instance
func NewSEOAnalyzer() *SEOAnalyzer {
	return &SEOAnalyzer{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// BrokenLink represents a broken link with its status code
type BrokenLink struct {
	URL        string `json:"url"`
	StatusCode int    `json:"status_code"`
	Error      string `json:"error,omitempty"`
}

// SEOAnalysisResult contains all the SEO analysis data
type SEOAnalysisResult struct {
	StatusCode      int
	HTMLVersion     string
	MetaTitle       string
	MetaDescription string
	H1Tags          []string
	H2Tags          []string
	H3Tags          []string
	H4Tags          []string
	H5Tags          []string
	H6Tags          []string
	H1Count         int
	H2Count         int
	H3Count         int
	H4Count         int
	H5Count         int
	H6Count         int
	ImageCount      int
	TotalLinks      int
	InternalLinks   int
	ExternalLinks   int
	BrokenLinks     []BrokenLink
	HasLoginForm    bool
	FormCount       int
	LoadTime        float64
	PageSize        int64
	ErrorMessage    string
}

// AnalyzeURL performs comprehensive SEO analysis on a given URL
func (s *SEOAnalyzer) AnalyzeURL(targetURL string) (*SEOAnalysisResult, error) {
	result := &SEOAnalysisResult{}
	
	// Parse the target URL
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Measure load time
	startTime := time.Now()
	
	// Make HTTP request
	resp, err := s.client.Get(targetURL)
	if err != nil {
		result.ErrorMessage = fmt.Sprintf("Failed to fetch URL: %v", err)
		return result, nil
	}
	defer resp.Body.Close()

	loadTime := time.Since(startTime).Seconds()
	result.LoadTime = loadTime
	result.StatusCode = resp.StatusCode

	// Check if response is successful
	if resp.StatusCode >= 400 {
		result.ErrorMessage = fmt.Sprintf("HTTP error: %d", resp.StatusCode)
		return result, nil
	}

	// Parse HTML document
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		result.ErrorMessage = fmt.Sprintf("Failed to parse HTML: %v", err)
		return result, nil
	}

	// Calculate page size (approximate)
	result.PageSize = resp.ContentLength
	if result.PageSize <= 0 {
		// Estimate based on HTML content
		htmlContent, _ := doc.Html()
		result.PageSize = int64(len(htmlContent))
	}

	// Analyze HTML version
	result.HTMLVersion = s.detectHTMLVersion(doc)

	// Extract meta information
	result.MetaTitle = s.extractMetaTitle(doc)
	result.MetaDescription = s.extractMetaDescription(doc)

	// Analyze heading tags
	s.analyzeHeadingTags(doc, result)

	// Count images
	result.ImageCount = doc.Find("img").Length()

	// Analyze links
	s.analyzeLinks(doc, parsedURL, result)

	// Analyze forms
	s.analyzeForms(doc, result)

	return result, nil
}

// detectHTMLVersion detects the HTML version from DOCTYPE
func (s *SEOAnalyzer) detectHTMLVersion(doc *goquery.Document) string {
	// Get the raw HTML to check DOCTYPE
	html, _ := doc.Html()
	
	// Check for HTML5 DOCTYPE
	if strings.Contains(strings.ToLower(html), "<!doctype html>") {
		return "HTML5"
	}
	
	// Check for XHTML
	if strings.Contains(strings.ToLower(html), "xhtml") {
		if strings.Contains(html, "1.1") {
			return "XHTML 1.1"
		} else if strings.Contains(html, "1.0") {
			if strings.Contains(html, "Strict") {
				return "XHTML 1.0 Strict"
			} else if strings.Contains(html, "Transitional") {
				return "XHTML 1.0 Transitional"
			}
			return "XHTML 1.0"
		}
		return "XHTML"
	}
	
	// Check for HTML 4.01
	if strings.Contains(html, "HTML 4.01") {
		if strings.Contains(html, "Strict") {
			return "HTML 4.01 Strict"
		} else if strings.Contains(html, "Transitional") {
			return "HTML 4.01 Transitional"
		}
		return "HTML 4.01"
	}
	
	return "Unknown"
}

// extractMetaTitle extracts the page title
func (s *SEOAnalyzer) extractMetaTitle(doc *goquery.Document) string {
	title := doc.Find("title").First().Text()
	return strings.TrimSpace(title)
}

// extractMetaDescription extracts the meta description
func (s *SEOAnalyzer) extractMetaDescription(doc *goquery.Document) string {
	description, exists := doc.Find("meta[name='description']").Attr("content")
	if !exists {
		description, _ = doc.Find("meta[property='og:description']").Attr("content")
	}
	return strings.TrimSpace(description)
}

// analyzeHeadingTags analyzes all heading tags (H1-H6)
func (s *SEOAnalyzer) analyzeHeadingTags(doc *goquery.Document, result *SEOAnalysisResult) {
	// H1 tags
	doc.Find("h1").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H1Tags = append(result.H1Tags, text)
		}
	})
	result.H1Count = len(result.H1Tags)

	// H2 tags
	doc.Find("h2").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H2Tags = append(result.H2Tags, text)
		}
	})
	result.H2Count = len(result.H2Tags)

	// H3 tags
	doc.Find("h3").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H3Tags = append(result.H3Tags, text)
		}
	})
	result.H3Count = len(result.H3Tags)

	// H4 tags
	doc.Find("h4").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H4Tags = append(result.H4Tags, text)
		}
	})
	result.H4Count = len(result.H4Tags)

	// H5 tags
	doc.Find("h5").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H5Tags = append(result.H5Tags, text)
		}
	})
	result.H5Count = len(result.H5Tags)

	// H6 tags
	doc.Find("h6").Each(func(i int, sel *goquery.Selection) {
		text := strings.TrimSpace(sel.Text())
		if text != "" {
			result.H6Tags = append(result.H6Tags, text)
		}
	})
	result.H6Count = len(result.H6Tags)
}

// analyzeLinks analyzes internal and external links and checks for broken links
func (s *SEOAnalyzer) analyzeLinks(doc *goquery.Document, baseURL *url.URL, result *SEOAnalysisResult) {
	var allLinks []string
	
	doc.Find("a[href]").Each(func(i int, sel *goquery.Selection) {
		href, exists := sel.Attr("href")
		if !exists || href == "" {
			return
		}
		
		// Parse the link URL
		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}
		
		// Resolve relative URLs
		resolvedURL := baseURL.ResolveReference(linkURL)
		allLinks = append(allLinks, resolvedURL.String())
		
		// Determine if link is internal or external
		if resolvedURL.Host == baseURL.Host {
			result.InternalLinks++
		} else if resolvedURL.Host != "" {
			result.ExternalLinks++
		}
	})
	
	result.TotalLinks = len(allLinks)
	
	// Check for broken links (sample a few to avoid overwhelming the target server)
	maxLinksToCheck := 10
	if len(allLinks) > maxLinksToCheck {
		allLinks = allLinks[:maxLinksToCheck]
	}
	
	for _, link := range allLinks {
		if brokenLink := s.checkLinkStatus(link); brokenLink != nil {
			result.BrokenLinks = append(result.BrokenLinks, *brokenLink)
		}
	}
}

// checkLinkStatus checks if a link is broken and returns details
func (s *SEOAnalyzer) checkLinkStatus(link string) *BrokenLink {
	// Create a new client with shorter timeout for link checking
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Head(link)
	if err != nil {
		return &BrokenLink{
			URL:        link,
			StatusCode: 0,
			Error:      err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return &BrokenLink{
			URL:        link,
			StatusCode: resp.StatusCode,
		}
	}

	return nil
}

// analyzeForms analyzes forms on the page and detects login forms
func (s *SEOAnalyzer) analyzeForms(doc *goquery.Document, result *SEOAnalysisResult) {
	forms := doc.Find("form")
	result.FormCount = forms.Length()
	
	// Check for login forms
	forms.Each(func(i int, form *goquery.Selection) {
		// Look for common login form indicators
		hasPasswordField := form.Find("input[type='password']").Length() > 0
		hasEmailField := form.Find("input[type='email']").Length() > 0
		hasUsernameField := form.Find("input[name*='user'], input[name*='login'], input[name*='email']").Length() > 0
		
		// Check form action or class/id for login-related terms
		action, _ := form.Attr("action")
		class, _ := form.Attr("class")
		id, _ := form.Attr("id")
		
		loginKeywords := []string{"login", "signin", "sign-in", "auth", "authenticate"}
		hasLoginKeyword := false
		
		for _, keyword := range loginKeywords {
			if strings.Contains(strings.ToLower(action), keyword) ||
			   strings.Contains(strings.ToLower(class), keyword) ||
			   strings.Contains(strings.ToLower(id), keyword) {
				hasLoginKeyword = true
				break
			}
		}
		
		if hasPasswordField && (hasEmailField || hasUsernameField || hasLoginKeyword) {
			result.HasLoginForm = true
		}
	})
}

// ConvertToJSONStrings converts slices to JSON strings for database storage
func (s *SEOAnalyzer) ConvertToJSONStrings(result *SEOAnalysisResult) (map[string]string, error) {
	jsonStrings := make(map[string]string)
	
	// Convert heading tags to JSON strings
	h1JSON, _ := json.Marshal(result.H1Tags)
	h2JSON, _ := json.Marshal(result.H2Tags)
	h3JSON, _ := json.Marshal(result.H3Tags)
	h4JSON, _ := json.Marshal(result.H4Tags)
	h5JSON, _ := json.Marshal(result.H5Tags)
	h6JSON, _ := json.Marshal(result.H6Tags)
	// Convert broken links to the format expected by the frontend
	var brokenLinksInfo []models.BrokenLinkInfo
	for _, bl := range result.BrokenLinks {
		brokenLinksInfo = append(brokenLinksInfo, models.BrokenLinkInfo{
			URL:        bl.URL,
			StatusCode: bl.StatusCode,
			Error:      bl.Error,
		})
	}
	brokenLinksJSON, _ := json.Marshal(brokenLinksInfo)

	jsonStrings["h1_tags"] = string(h1JSON)
	jsonStrings["h2_tags"] = string(h2JSON)
	jsonStrings["h3_tags"] = string(h3JSON)
	jsonStrings["h4_tags"] = string(h4JSON)
	jsonStrings["h5_tags"] = string(h5JSON)
	jsonStrings["h6_tags"] = string(h6JSON)
	jsonStrings["broken_links_list"] = string(brokenLinksJSON)
	
	return jsonStrings, nil
}
