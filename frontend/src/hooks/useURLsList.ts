/**
 * useURLsList hook
 * Fetches URLs list with pagination, search, and filtering
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { dashboardApi } from '../features/dashboard/api';
import { dashboardQueryKeys } from './queryKeys';

/**
 * Hook to fetch URLs list with pagination, search, and filtering
 * Uses a stable cache key to prevent flickering on parameter changes
 */
export const useURLsList = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}) => {
  const queryClient = useQueryClient();
  const paramsRef = useRef(params);

  // Update params ref when they change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const query = useQuery({
    queryKey: dashboardQueryKeys.urlsList(),
    queryFn: () => dashboardApi.getURLs(paramsRef.current),
    staleTime: 5 * 1000, // 5 seconds - shorter to ensure fresh data
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time updates
  });

  // Invalidate and refetch when params change to get fresh data
  useEffect(() => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.urlsList() });
    }
  }, [
    params?.page,
    params?.search,
    params?.status,
    params?.sort_by,
    params?.sort_order,
    queryClient,
  ]);

  return query;
};
