/**
 * Dashboard feature types
 * Defines interfaces for dashboard data structures and API responses
 */

// URL status from backend (matching Go backend model)
export type URLStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

// URL interface matching the Go backend response
export interface DashboardURL {
  id: number;
  url: string;
  title: string;
  description: string;
  status: URLStatus;
  status_code: number;

  // SEO Analysis data
  seo_analysis: {
    meta_title: string;
    meta_description: string;
    html_version: string;
    heading_tags: {
      h1_tags: string;
      h2_tags: string;
      h3_tags: string;
      h4_tags: string;
      h5_tags: string;
      h6_tags: string;
      h1_count: number;
      h2_count: number;
      h3_count: number;
      h4_count: number;
      h5_count: number;
      h6_count: number;
    };
    link_analysis: {
      total_links: number;
      internal_links: number;
      external_links: number;
      broken_links: number;
      broken_links_list: Array<{
        url: string;
        status_code: number;
        error?: string;
      }>;
    };
    form_analysis: {
      has_login_form: boolean;
      form_count: number;
    };
    image_count: number;
  };

  // Performance data
  performance: {
    load_time: number;
    page_size: number;
  };

  // Metadata
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard statistics
export interface DashboardStats {
  total_urls: number;
  completed_urls: number;
  pending_urls: number;
  failed_urls: number;
  analyzing_urls: number;
}

// API response for URLs list with pagination
export interface URLsListResponse {
  data: DashboardURL[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API response for single URL
export interface URLResponse {
  data: DashboardURL;
  message?: string;
}

// API response for URL creation
export interface CreateURLResponse {
  data: DashboardURL;
  message: string;
}

// Request payload for creating a URL
export interface CreateURLRequest {
  url: string;
  title?: string;
}

// Request payload for updating a URL
export interface UpdateURLRequest {
  title?: string;
  description?: string;
  status?: URLStatus;
}

// Dashboard data aggregated for the dashboard view
export interface DashboardData {
  stats: DashboardStats;
  recent_urls: DashboardURL[];
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

// API error response structure
export interface APIErrorResponse {
  error: string;
  message: string;
  details?: string;
}
