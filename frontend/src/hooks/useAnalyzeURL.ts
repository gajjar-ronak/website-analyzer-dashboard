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
    onSuccess: (_, id) => {
      toast.success('URL analysis started');
      // Invalidate the specific URL, URLs list, and dashboard data
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.url(id) });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urlsList() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboardData() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.recentUrls() });
    },
    onError: () => {
      toast.error('Failed to start URL analysis');
    },
  });
};
