/**
 * useCreateURL hook
 * Creates a new URL with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';
import type { CreateURLRequest, DashboardURL } from '../features/dashboard/types';

/**
 * Hook to create a new URL with optimistic updates
 */
export const useCreateURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateURLRequest) => dashboardApi.createURL(data),
    onMutate: async newURL => {
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
            html_version: '',
            heading_tags: {
              h1_tags: '',
              h2_tags: '',
              h3_tags: '',
              h4_tags: '',
              h5_tags: '',
              h6_tags: '',
              h1_count: 0,
              h2_count: 0,
              h3_count: 0,
              h4_count: 0,
              h5_count: 0,
              h6_count: 0,
            },
            link_analysis: {
              total_links: 0,
              internal_links: 0,
              external_links: 0,
              broken_links: 0,
              broken_links_list: [],
            },
            form_analysis: {
              has_login_form: false,
              form_count: 0,
            },
            image_count: 0,
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
    onSuccess: data => {
      toast.success('URL created successfully');
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urls() });
    },
  });
};
