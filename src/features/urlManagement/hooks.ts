import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlApi, mockURLs } from "./api";
import type {
  URL,
  CreateURLRequest,
  UpdateURLRequest,
  URLListFilters,
  URLListResponse,
} from "./types";

// Query keys
export const urlQueryKeys = {
  all: ["urls"] as const,
  lists: () => [...urlQueryKeys.all, "list"] as const,
  list: (filters?: URLListFilters) =>
    [...urlQueryKeys.lists(), filters] as const,
  details: () => [...urlQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...urlQueryKeys.details(), id] as const,
  analytics: (id: string) => [...urlQueryKeys.all, "analytics", id] as const,
};

// Hook to get URLs list
export const useURLs = (filters?: URLListFilters) => {
  return useQuery({
    queryKey: urlQueryKeys.list(filters),
    queryFn: async (): Promise<URLListResponse> => {
      // For development, return mock data
      // Replace this with actual API call when backend is ready
      const filteredURLs = mockURLs.filter((url) => {
        if (
          filters?.status &&
          filters.status !== "all" &&
          url.status !== filters.status
        ) {
          return false;
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            url.title.toLowerCase().includes(searchLower) ||
            url.url.toLowerCase().includes(searchLower) ||
            url.description?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      return {
        urls: filteredURLs,
        total: filteredURLs.length,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(filteredURLs.length / (filters?.limit || 10)),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get a single URL
export const useURL = (id: string) => {
  return useQuery({
    queryKey: urlQueryKeys.detail(id),
    queryFn: async (): Promise<URL> => {
      // For development, return mock data
      const url = mockURLs.find((u) => u.id === id);
      if (!url) {
        throw new Error("URL not found");
      }
      return url;
    },
    enabled: !!id,
  });
};

// Hook to create a new URL
export const useCreateURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateURLRequest): Promise<URL> => {
      // For development, simulate API call
      const newURL: URL = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: "pending",
        lastChecked: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to mock data
      mockURLs.push(newURL);
      return newURL;
    },
    onSuccess: () => {
      // Invalidate and refetch URLs list
      queryClient.invalidateQueries({ queryKey: urlQueryKeys.lists() });
    },
  });
};

// Hook to update a URL
export const useUpdateURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateURLRequest): Promise<URL> => {
      // For development, simulate API call
      const urlIndex = mockURLs.findIndex((u) => u.id === data.id);
      if (urlIndex === -1) {
        throw new Error("URL not found");
      }

      const updatedURL = {
        ...mockURLs[urlIndex],
        ...data,
        updatedAt: new Date(),
      };

      mockURLs[urlIndex] = updatedURL;
      return updatedURL;
    },
    onSuccess: (data) => {
      // Update the specific URL in cache
      queryClient.setQueryData(urlQueryKeys.detail(data.id), data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: urlQueryKeys.lists() });
    },
  });
};

// Hook to delete a URL
export const useDeleteURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // For development, simulate API call
      const urlIndex = mockURLs.findIndex((u) => u.id === id);
      if (urlIndex === -1) {
        throw new Error("URL not found");
      }

      mockURLs.splice(urlIndex, 1);
    },
    onSuccess: () => {
      // Invalidate and refetch URLs list
      queryClient.invalidateQueries({ queryKey: urlQueryKeys.lists() });
    },
  });
};

// Hook to check URL status
export const useCheckURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<URL> => {
      // For development, simulate API call
      const urlIndex = mockURLs.findIndex((u) => u.id === id);
      if (urlIndex === -1) {
        throw new Error("URL not found");
      }

      // Simulate status check
      const updatedURL = {
        ...mockURLs[urlIndex],
        lastChecked: new Date(),
        responseTime: Math.floor(Math.random() * 1000) + 100,
        statusCode: Math.random() > 0.8 ? 500 : 200,
        status: (Math.random() > 0.8 ? "inactive" : "active") as
          | "active"
          | "inactive",
        updatedAt: new Date(),
      } as URL;

      mockURLs[urlIndex] = updatedURL;
      return updatedURL;
    },
    onSuccess: (data) => {
      // Update the specific URL in cache
      queryClient.setQueryData(urlQueryKeys.detail(data.id), data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: urlQueryKeys.lists() });
    },
  });
};
