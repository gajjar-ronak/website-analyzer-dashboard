/**
 * useURLsList hook
 * Fetches URLs list with pagination, search, and filtering
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

/**
 * Hook to fetch URLs list with pagination, search, and filtering
 */
export const useURLsList = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.urlsList(params),
    queryFn: () => dashboardApi.getURLs(params),
    staleTime: 30 * 1000, // 30 seconds for more real-time feel
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
  });
};
