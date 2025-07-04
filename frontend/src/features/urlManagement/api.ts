import { apiClient } from '../../services/apiClient';
import type {
  URL,
  CreateURLRequest,
  UpdateURLRequest,
  URLListFilters,
  URLListResponse,
  URLAnalytics,
} from './types';

// URL Management API endpoints
export const urlApi = {
  // Get all URLs with optional filters
  getURLs: async (filters?: URLListFilters): Promise<URLListResponse> => {
    return apiClient.get<URLListResponse>('/urls', filters);
  },

  // Get a single URL by ID
  getURL: async (id: string): Promise<URL> => {
    return apiClient.get<URL>(`/urls/${id}`);
  },

  // Create a new URL
  createURL: async (data: CreateURLRequest): Promise<URL> => {
    return apiClient.post<URL>('/urls', data);
  },

  // Update an existing URL
  updateURL: async (data: UpdateURLRequest): Promise<URL> => {
    const { id, ...updateData } = data;
    return apiClient.put<URL>(`/urls/${id}`, updateData);
  },

  // Delete a URL
  deleteURL: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/urls/${id}`);
  },

  // Check URL status manually
  checkURL: async (id: string): Promise<URL> => {
    return apiClient.post<URL>(`/urls/${id}/check`);
  },

  // Get URL analytics
  getURLAnalytics: async (id: string, days = 30): Promise<URLAnalytics[]> => {
    return apiClient.get<URLAnalytics[]>(`/urls/${id}/analytics`, { days });
  },

  // Bulk operations
  bulkUpdateURLs: async (ids: string[], data: Partial<UpdateURLRequest>): Promise<URL[]> => {
    return apiClient.put<URL[]>('/urls/bulk', { ids, ...data });
  },

  bulkDeleteURLs: async (ids: number[]): Promise<void> => {
    return apiClient.delete<void>('/urls/bulk', { ids });
  },

  bulkAnalyzeURLs: async (ids: number[]): Promise<void> => {
    return apiClient.post<void>('/urls/bulk/analyze', { ids });
  },

  bulkImportURLs: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    // Don't set Content-Type header - let browser handle it for FormData
    return apiClient.post<any>('/urls/bulk/import', formData);
  },
};

// Mock data for development (remove when backend is ready)
export const mockURLs: URL[] = [
  {
    id: '1',
    url: 'https://example.com',
    title: 'Example Website',
    description: 'A sample website for testing',
    status: 'active',
    lastChecked: new Date('2024-01-15T10:30:00Z'),
    responseTime: 250,
    statusCode: 200,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: '2',
    url: 'https://google.com',
    title: 'Google',
    description: 'Search engine',
    status: 'active',
    lastChecked: new Date('2024-01-15T11:00:00Z'),
    responseTime: 120,
    statusCode: 200,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z'),
  },
  {
    id: '3',
    url: 'https://broken-site.com',
    title: 'Broken Site',
    description: 'This site is down',
    status: 'inactive',
    lastChecked: new Date('2024-01-15T09:45:00Z'),
    responseTime: undefined,
    statusCode: 500,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z'),
  },
];
