import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default query options for the entire app
const defaultOptions: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests once
    retry: 1,
    // Don't refetch on window focus (can be overwhelming)
    refetchOnWindowFocus: false,
    // Refetch on reconnect (useful for mobile)
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
    // Mutations don't have stale time
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query keys factory - centralized query key management
export const queryKeys = {
  // All queries
  all: ['queries'] as const,
  
  // Links queries
  links: () => [...queryKeys.all, 'links'] as const,
  linksList: (filters?: { search?: string; userId?: string }) => 
    [...queryKeys.links(), 'list', filters] as const,
  linksDetail: (id: number) => [...queryKeys.links(), 'detail', id] as const,
  
  // Ideas queries  
  ideas: () => [...queryKeys.all, 'ideas'] as const,
  ideasList: (filters?: { status?: string; userId?: string }) => 
    [...queryKeys.ideas(), 'list', filters] as const,
  ideasDetail: (id: string | number) => [...queryKeys.ideas(), 'detail', id] as const,
  
  // User queries
  users: () => [...queryKeys.all, 'users'] as const,
  usersList: () => [...queryKeys.users(), 'list'] as const,
  usersDetail: (id: string) => [...queryKeys.users(), 'detail', id] as const,
  userProfile: () => [...queryKeys.users(), 'profile'] as const,
  
  // Prompts queries
  prompts: () => [...queryKeys.all, 'prompts'] as const,
  promptsList: () => [...queryKeys.prompts(), 'list'] as const,
  promptsDetail: (id: number) => [...queryKeys.prompts(), 'detail', id] as const,
  
  // AI queries
  ai: () => [...queryKeys.all, 'ai'] as const,
  aiGenerate: (prompt: string) => [...queryKeys.ai(), 'generate', prompt] as const,
} as const;

// Utility function to invalidate related queries
export const invalidateQueries = {
  links: () => queryClient.invalidateQueries({ queryKey: queryKeys.links() }),
  ideas: () => queryClient.invalidateQueries({ queryKey: queryKeys.ideas() }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users() }),
  prompts: () => queryClient.invalidateQueries({ queryKey: queryKeys.prompts() }),
  all: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
};

// Common error handler
export const handleQueryError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Common API fetch wrapper with error handling
export const fetchWithErrorHandling = async <T>(
  url: string, 
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Handle different HTTP error codes
      switch (response.status) {
        case 401:
          throw new Error('Unauthorized - Please log in again');
        case 403:
          throw new Error('Forbidden - You do not have permission');
        case 404:
          throw new Error('Resource not found');
        case 500:
          throw new Error('Server error - Please try again later');
        default:
          throw new Error(`HTTP Error: ${response.status}`);
      }
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return response.text() as unknown as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Network errors, parsing errors, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - Please check your connection');
    }
    throw error;
  }
};

// Prefetch utilities for common data
export const prefetchQueries = {
  links: async (filters?: { search?: string; userId?: string }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.linksList(filters),
      queryFn: () => fetchWithErrorHandling<any[]>('/api/links'),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  ideas: async (filters?: { status?: string; userId?: string }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.ideasList(filters),
      queryFn: () => fetchWithErrorHandling<any[]>('/api/ideas'),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  userProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userProfile(),
      queryFn: () => fetchWithErrorHandling<any>('/api/user/profile'),
      staleTime: 10 * 60 * 1000, // User profile changes less frequently
    });
  },
};