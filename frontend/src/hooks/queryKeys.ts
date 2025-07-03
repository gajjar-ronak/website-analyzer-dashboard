/**
 * React Query keys for caching
 * Centralized query key definitions for consistent cache management
 */

/**
 * Dashboard query keys for React Query caching
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  urls: () => [...dashboardQueryKeys.all, 'urls'] as const,
  urlsList: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    [...dashboardQueryKeys.urls(), 'list', params] as const,
  url: (id: number) => [...dashboardQueryKeys.urls(), 'detail', id] as const,
  recentUrls: () => [...dashboardQueryKeys.urls(), 'recent'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  dashboardData: () => [...dashboardQueryKeys.all, 'data'] as const,
  health: () => [...dashboardQueryKeys.all, 'health'] as const,
};

/**
 * URL Management query keys (legacy support)
 */
export const urlQueryKeys = {
  all: ['urls'] as const,
  lists: () => [...urlQueryKeys.all, 'list'] as const,
  list: (filters?: any) => [...urlQueryKeys.lists(), filters] as const,
  details: () => [...urlQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...urlQueryKeys.details(), id] as const,
  analytics: (id: string) => [...urlQueryKeys.all, 'analytics', id] as const,
};
