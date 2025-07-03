/**
 * Hooks index file
 * Centralized exports for all custom hooks
 */

// Query keys
export { dashboardQueryKeys, urlQueryKeys } from './queryKeys';

// Authentication
export { useAuth, AuthProvider } from './useAuth';
export type { User } from './useAuth';

// Utility hooks
export { useDebounce, useDebounceCallback } from './useDebounce';

// Dashboard data hooks
export { useDashboardData } from './useDashboardData';
export { useURLsList } from './useURLsList';
export { useURL } from './useURL';
export { useRecentURLs } from './useRecentURLs';
export { useHealthCheck } from './useHealthCheck';

// URL mutation hooks
export { useCreateURL } from './useCreateURL';
export { useUpdateURL } from './useUpdateURL';
export { useDeleteURL } from './useDeleteURL';
export { useAnalyzeURL } from './useAnalyzeURL';
