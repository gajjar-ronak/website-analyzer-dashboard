/**
 * useDeleteURL hook
 * Deletes a URL and updates cache
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

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
