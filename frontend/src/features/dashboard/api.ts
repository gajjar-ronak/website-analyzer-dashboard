/**
 * Dashboard API service
 * Handles all API calls related to dashboard functionality
 */

import { apiClient } from '../../services/apiClient';
import type {
  DashboardURL,
  URLsListResponse,
  URLResponse,
  CreateURLRequest,
  CreateURLResponse,
  UpdateURLRequest,
  HealthCheckResponse,
  DashboardStats,
} from './types';

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<HealthCheckResponse> => {
    return apiClient.get<HealthCheckResponse>('/health');
  },

  /**
   * Get all URLs with pagination, search, and filtering
   */
  getURLs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<URLsListResponse> => {
    const queryParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    // Add search parameter if provided
    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    // Add status filter if provided and not 'all'
    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }

    // Add sorting parameters if provided
    if (params?.sort_by) {
      queryParams.sort_by = params.sort_by;
    }
    if (params?.sort_order) {
      queryParams.sort_order = params.sort_order;
    }

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('API Request params:', queryParams);
    }

    return apiClient.get<URLsListResponse>('/urls', queryParams);
  },

  /**
   * Get recent URLs (limited to 5 for dashboard)
   */
  getRecentURLs: async (): Promise<DashboardURL[]> => {
    const response = await apiClient.get<URLsListResponse>('/urls', {
      page: 1,
      limit: 5,
    });

    return response.data;
  },

  /**
   * Get URL by ID
   */
  getURL: async (id: number): Promise<DashboardURL> => {
    const response = await apiClient.get<URLResponse>(`/urls/${id}`);
    return response.data;
  },

  /**
   * Create a new URL
   */
  createURL: async (data: CreateURLRequest): Promise<DashboardURL> => {
    const response = await apiClient.post<CreateURLResponse>('/urls', data);
    return response.data;
  },

  /**
   * Update an existing URL
   */
  updateURL: async (id: number, data: UpdateURLRequest): Promise<DashboardURL> => {
    const response = await apiClient.put<URLResponse>(`/urls/${id}`, data);
    return response.data;
  },

  /**
   * Delete a URL
   */
  deleteURL: async (id: number): Promise<void> => {
    await apiClient.delete(`/urls/${id}`);
  },

  /**
   * Start URL analysis
   */
  analyzeURL: async (id: number): Promise<void> => {
    await apiClient.post(`/urls/${id}/analyze`);
  },

  /**
   * Calculate dashboard statistics from URLs data
   * This is a client-side calculation since the backend doesn't have a dedicated stats endpoint yet
   */
  calculateStats: (urls: DashboardURL[]): DashboardStats => {
    const stats: DashboardStats = {
      total_urls: urls.length,
      completed_urls: 0,
      pending_urls: 0,
      failed_urls: 0,
      analyzing_urls: 0,
    };

    urls.forEach(url => {
      switch (url.status) {
        case 'completed':
          stats.completed_urls++;
          break;
        case 'pending':
          stats.pending_urls++;
          break;
        case 'failed':
          stats.failed_urls++;
          break;
        case 'analyzing':
          stats.analyzing_urls++;
          break;
        default:
          break;
      }
    });

    return stats;
  },

  /**
   * Get dashboard data (stats + recent URLs)
   * This combines multiple API calls for the dashboard view
   */
  getDashboardData: async (): Promise<{
    stats: DashboardStats;
    recentURLs: DashboardURL[];
  }> => {
    // Get all URLs to calculate stats and recent URLs
    const urlsResponse = await dashboardApi.getURLs({ page: 1, limit: 100 });
    const allURLs = urlsResponse?.data || [];

    // Calculate stats from all URLs
    const stats = dashboardApi.calculateStats(allURLs);

    // Get recent URLs (first 5)
    const recentURLs = allURLs.slice(0, 5);

    return {
      stats,
      recentURLs,
    };
  },
};

export default dashboardApi;
