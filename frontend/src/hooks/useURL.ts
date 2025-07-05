/**
 * useURL hook
 * Fetches a single URL by ID with smart polling for analyzing URLs
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

/**
 * Hook to fetch a single URL by ID
 * Automatically polls when URL is in analyzing status
 */
export const useURL = (id: number) => {
  const query = useQuery({
    queryKey: dashboardQueryKeys.url(id),
    queryFn: () => dashboardApi.getURL(id),
    enabled: !!id, // Only run if ID is provided
    staleTime: 10 * 1000, // 10 seconds - more responsive for analysis updates
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: (data: any) => {
      // Poll every 2 seconds if URL is analyzing, otherwise don't poll
      return data?.status === 'analyzing' ? 2 * 1000 : false;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
    // Refetch on window focus to catch updates when returning to the page
    refetchOnWindowFocus: true,
  });

  return query;
};
