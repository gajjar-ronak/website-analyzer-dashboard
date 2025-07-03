/**
 * useRecentURLs hook
 * Fetches recent URLs for dashboard display
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

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
