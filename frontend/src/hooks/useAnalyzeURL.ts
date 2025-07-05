/**
 * useAnalyzeURL hook
 * Triggers URL analysis and updates cache
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

/**
 * Hook to analyze a URL
 */
export const useAnalyzeURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.analyzeURL(id),
    onMutate: async id => {
      // Cancel any outgoing refetches for this URL
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.url(id) });

      // Optimistically update the URL status to 'analyzing'
      queryClient.setQueryData(dashboardQueryKeys.url(id), (old: any) => {
        if (!old) return old;
        return { ...old, status: 'analyzing' };
      });
    },
    onSuccess: (_, id) => {
      toast.success('URL analysis started');
      // Invalidate and refetch the specific URL immediately
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.url(id) });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urlsList() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.recentUrls() });
    },
    onError: (_, id) => {
      toast.error('Failed to start URL analysis');
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.url(id) });
    },
  });
};
