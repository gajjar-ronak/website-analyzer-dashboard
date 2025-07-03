/**
 * useUpdateURL hook
 * Updates a URL with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';
import type { UpdateURLRequest, DashboardURL } from '../features/dashboard/types';

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
