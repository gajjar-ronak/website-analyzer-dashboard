/**
 * useURL hook
 * Fetches a single URL by ID
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

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
