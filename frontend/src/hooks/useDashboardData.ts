/**
 * useDashboardData hook
 * Fetches dashboard data (stats + recent URLs) with real-time updates
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

/**
 * Hook to fetch dashboard data (stats + recent URLs)
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.dashboardData(),
    queryFn: dashboardApi.getDashboardData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time updates
  });
};
