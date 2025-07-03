/**
 * Dashboard React Query hooks
 * Provides data fetching, caching, and state management for dashboard features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardApi } from './api';
import type {
  DashboardURL,
  CreateURLRequest,
  UpdateURLRequest,
  DashboardStats,
} from './types';

/**
 * Query keys for React Query caching
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  urls: () => [...dashboardQueryKeys.all, 'urls'] as const,
  urlsList: (params?: { page?: number; limit?: number }) =>
    [...dashboardQueryKeys.urls(), 'list', params] as const,
  url: (id: number) => [...dashboardQueryKeys.urls(), 'detail', id] as const,
  recentUrls: () => [...dashboardQueryKeys.urls(), 'recent'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  dashboardData: () => [...dashboardQueryKeys.all, 'data'] as const,
  health: () => [...dashboardQueryKeys.all, 'health'] as const,
};

/**
 * Hook to fetch dashboard data (stats + recent URLs)
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.dashboardData(),
    queryFn: dashboardApi.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch URLs list with pagination
 */
export const useURLsList = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: dashboardQueryKeys.urlsList(params),
    queryFn: () => dashboardApi.getURLs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

/**
 * Hook to fetch recent URLs for dashboard
 */
export const useRecentURLs = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.recentUrls(),
    queryFn: dashboardApi.getRecentURLs,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single URL by ID
 */
export const useURL = (id: number) => {
  return useQuery({
    queryKey: dashboardQueryKeys.url(id),
    queryFn: () => dashboardApi.getURL(id),
    enabled: !!id, // Only run if ID is provided
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to check API health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.health(),
    queryFn: dashboardApi.healthCheck,
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to create a new URL with optimistic updates
 */
export const useCreateURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateURLRequest) => dashboardApi.createURL(data),
    onMutate: async (newURL) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.urls() });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(dashboardQueryKeys.dashboardData());

      // Optimistically update the cache
      queryClient.setQueryData(dashboardQueryKeys.dashboardData(), (old: any) => {
        if (!old) return old;

        const optimisticURL: DashboardURL = {
          id: Date.now(), // Temporary ID
          url: newURL.url,
          title: 'Loading...',
          description: '',
          status: 'pending',
          status_code: 0,
          seo_analysis: {
            meta_title: '',
            meta_description: '',
            h1_tags: '',
            h2_tags: '',
            image_count: 0,
            link_count: 0,
          },
          performance: {
            load_time: 0,
            page_size: 0,
          },
          analyzed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return {
          ...old,
          recentURLs: [optimisticURL, ...old.recentURLs.slice(0, 4)],
          stats: {
            ...old.stats,
            total_urls: old.stats.total_urls + 1,
            pending_urls: old.stats.pending_urls + 1,
          },
        };
      });

      return { previousData };
    },
    onError: (err, newURL, context) => {
      // Revert the optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(dashboardQueryKeys.dashboardData(), context.previousData);
      }
      toast.error('Failed to create URL');
    },
    onSuccess: (data) => {
      toast.success('URL created successfully');
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urls() });
    },
  });
};

/**
 * Hook to update a URL with optimistic updates
 */
export const useUpdateURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateURLRequest }) =>
      dashboardApi.updateURL(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.url(id) });

      // Snapshot the previous value
      const previousURL = queryClient.getQueryData(dashboardQueryKeys.url(id));

      // Optimistically update the cache
      queryClient.setQueryData(dashboardQueryKeys.url(id), (old: DashboardURL | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousURL };
    },
    onError: (err, { id }, context) => {
      // Revert the optimistic update on error
      if (context?.previousURL) {
        queryClient.setQueryData(dashboardQueryKeys.url(id), context.previousURL);
      }
      toast.error('Failed to update URL');
    },
    onSuccess: (data, { id }) => {
      toast.success('URL updated successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urls() });
    },
  });
};

/**
 * Hook to delete a URL
 */
export const useDeleteURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.deleteURL(id),
    onSuccess: () => {
      toast.success('URL deleted successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urls() });
    },
    onError: () => {
      toast.error('Failed to delete URL');
    },
  });
};

/**
 * Hook to analyze a URL
 */
export const useAnalyzeURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.analyzeURL(id),
    onSuccess: (data, id) => {
      toast.success('URL analysis started');
      // Invalidate the specific URL and dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.url(id) });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
    },
    onError: () => {
      toast.error('Failed to start URL analysis');
    },
  });
};
