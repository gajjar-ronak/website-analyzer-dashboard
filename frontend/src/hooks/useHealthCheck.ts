/**
 * useHealthCheck hook
 * Checks API health status
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

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
