import React from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { queryKeys, fetchWithErrorHandling, handleQueryError } from './query-client';
import { useAppStore } from '../store/app-store';
import type { Link } from '../store/app-store';
import { Link as LinkType } from '@/db/schema';

// Types
interface CreateLinkData extends Partial<Omit<LinkType, 'id' | 'createdAt' | 'updatedAt' | 'userId'>> {
  title: string;
  url: string;
}

interface UpdateLinkData extends Partial<Omit<LinkType, 'id' | 'createdAt' | 'userId'>> {
  id: number;
}

interface LinkFilters {
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Fetch links query hook (zwraca tylko dane dla kompatybilności)
export function useLinks(filters?: LinkFilters): UseQueryResult<Link[], Error> {
  return useQuery({
    queryKey: queryKeys.linksList(filters),
    queryFn: async (): Promise<Link[]> => {
      const searchParams = new URLSearchParams();

      if (filters?.search) {
        searchParams.append('search', filters.search);
      }
      if (filters?.userId) {
        searchParams.append('userId', filters.userId);
      }
      if (filters?.page) {
        searchParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        searchParams.append('limit', filters.limit.toString());
      }

      const url = `/api/links${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetchWithErrorHandling<PaginatedResponse<Link>>(url);
      return response.data;
    },
    meta: {
      errorMessage: 'Failed to fetch links',
    },
  });
}

// Fetch links with pagination metadata
export function useLinksPaginated(filters?: LinkFilters): UseQueryResult<PaginatedResponse<Link>, Error> {
  return useQuery({
    queryKey: [...queryKeys.linksList(filters), 'paginated'],
    queryFn: async (): Promise<PaginatedResponse<Link>> => {
      const searchParams = new URLSearchParams();

      if (filters?.search) {
        searchParams.append('search', filters.search);
      }
      if (filters?.userId) {
        searchParams.append('userId', filters.userId);
      }
      if (filters?.page) {
        searchParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        searchParams.append('limit', filters.limit.toString());
      }

      const url = `/api/links${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      return fetchWithErrorHandling<PaginatedResponse<Link>>(url);
    },
    meta: {
      errorMessage: 'Failed to fetch links',
    },
  });
}

// Fetch single link query hook
export function useLink(id: number): UseQueryResult<Link, Error> {
  return useQuery({
    queryKey: queryKeys.linksDetail(id),
    queryFn: (): Promise<Link> => fetchWithErrorHandling<Link>(`/api/links/${id}`),
    enabled: !!id, // Only run query if id is provided
    meta: {
      errorMessage: 'Failed to fetch link details',
    },
  });
}

// Create link mutation hook
export function useCreateLink(): UseMutationResult<Link, Error, CreateLinkData> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (linkData: CreateLinkData): Promise<Link> => {
      return fetchWithErrorHandling<Link>('/api/links', {
        method: 'POST',
        body: JSON.stringify(linkData),
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: queryKeys.links() });
      
      // Add the new link to existing cache if it exists
      queryClient.setQueryData(queryKeys.linksDetail(data.id), data);
      
      // Show success notification
      addToast('Link created successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to create link: ${message}`, 'error');
    },
    meta: {
      errorMessage: 'Failed to create link',
    },
  });
}

// Update link mutation hook
export function useUpdateLink(): UseMutationResult<Link, Error, UpdateLinkData> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (linkData: UpdateLinkData): Promise<Link> => {
      const { id, ...updateData } = linkData;
      return fetchWithErrorHandling<Link>(`/api/links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: (data) => {
      // Update the specific link in cache
      queryClient.setQueryData(queryKeys.linksDetail(data.id), data);
      
      // Update the link in the list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.links() },
        (oldData: Link[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(link => 
            link.id === data.id ? { ...link, ...data } : link
          );
        }
      );
      
      addToast('Link updated successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to update link: ${message}`, 'error');
    },
    meta: {
      errorMessage: 'Failed to update link',
    },
  });
}

// Delete link mutation hook
export function useDeleteLink(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await fetchWithErrorHandling<void>(`/api/links/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.linksDetail(deletedId) });
      
      // Remove from list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.links() },
        (oldData: Link[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(link => link.id !== deletedId);
        }
      );
      
      addToast('Link deleted successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to delete link: ${message}`, 'error');
    },
    meta: {
      errorMessage: 'Failed to delete link',
    },
  });
}

// Bulk operations
export function useBulkDeleteLinks(): UseMutationResult<void, Error, number[]> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (ids: number[]): Promise<void> => {
      await fetchWithErrorHandling<void>('/api/links/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: (_, deletedIds) => {
      // Remove from caches
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: queryKeys.linksDetail(id) });
      });
      
      // Remove from list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.links() },
        (oldData: Link[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(link => !deletedIds.includes(link.id));
        }
      );
      
      addToast(`${deletedIds.length} links deleted successfully!`, 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to delete links: ${message}`, 'error');
    },
  });
}

// Custom hook for link search with debouncing
export function useLinksSearch(searchTerm: string, debounceMs: number = 300) {
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm);

  // Debounce the search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useLinks({ search: debouncedSearch });
}

// Hook for optimistic updates
export function useOptimisticLinkUpdate() {
  const queryClient = useQueryClient();
  
  return {
    updateLink: (id: number, updateData: Partial<Link>) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.linksDetail(id),
        (oldData: Link | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updateData };
        }
      );
      
      // Update in list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.links() },
        (oldData: Link[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(link => 
            link.id === id ? { ...link, ...updateData } : link
          );
        }
      );
    },
    
    rollbackUpdate: (id: number) => {
      // Refetch the specific link to revert optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.linksDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.links() });
    },
  };
}