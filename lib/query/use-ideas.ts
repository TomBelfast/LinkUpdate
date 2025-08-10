import React from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { queryKeys, fetchWithErrorHandling, handleQueryError } from './query-client';
import { useAppStore } from '../store/app-store';
import type { Idea } from '../store/app-store';

// Types
interface CreateIdeaData {
  title: string;
  description: string;
  status?: 'active' | 'completed' | 'archived';
}

interface UpdateIdeaData extends Partial<CreateIdeaData> {
  id: number;
}

interface IdeaFilters {
  status?: 'active' | 'completed' | 'archived';
  userId?: string;
}

// Fetch ideas query hook
export function useIdeas(filters?: IdeaFilters): UseQueryResult<Idea[], Error> {
  return useQuery({
    queryKey: queryKeys.ideasList(filters),
    queryFn: async (): Promise<Idea[]> => {
      const searchParams = new URLSearchParams();
      
      if (filters?.status) {
        searchParams.append('status', filters.status);
      }
      if (filters?.userId) {
        searchParams.append('userId', filters.userId);
      }
      
      const url = `/api/ideas${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      return fetchWithErrorHandling<Idea[]>(url);
    },
    meta: {
      errorMessage: 'Failed to fetch ideas',
    },
  });
}

// Fetch single idea query hook
export function useIdea(id: number): UseQueryResult<Idea, Error> {
  return useQuery({
    queryKey: queryKeys.ideasDetail(id),
    queryFn: (): Promise<Idea> => fetchWithErrorHandling<Idea>(`/api/ideas/${id}`),
    enabled: !!id,
    meta: {
      errorMessage: 'Failed to fetch idea details',
    },
  });
}

// Create idea mutation hook
export function useCreateIdea(): UseMutationResult<Idea, Error, CreateIdeaData> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (ideaData: CreateIdeaData): Promise<Idea> => {
      return fetchWithErrorHandling<Idea>('/api/ideas', {
        method: 'POST',
        body: JSON.stringify(ideaData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas() });
      queryClient.setQueryData(queryKeys.ideasDetail(data.id), data);
      addToast('Idea created successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to create idea: ${message}`, 'error');
    },
  });
}

// Update idea mutation hook
export function useUpdateIdea(): UseMutationResult<Idea, Error, UpdateIdeaData> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (ideaData: UpdateIdeaData): Promise<Idea> => {
      const { id, ...updateData } = ideaData;
      return fetchWithErrorHandling<Idea>(`/api/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.ideasDetail(data.id), data);
      queryClient.setQueriesData(
        { queryKey: queryKeys.ideas() },
        (oldData: Idea[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(idea => 
            idea.id === data.id ? { ...idea, ...data } : idea
          );
        }
      );
      addToast('Idea updated successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to update idea: ${message}`, 'error');
    },
  });
}

// Delete idea mutation hook
export function useDeleteIdea(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await fetchWithErrorHandling<void>(`/api/ideas/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.ideasDetail(deletedId) });
      queryClient.setQueriesData(
        { queryKey: queryKeys.ideas() },
        (oldData: Idea[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(idea => idea.id !== deletedId);
        }
      );
      addToast('Idea deleted successfully!', 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to delete idea: ${message}`, 'error');
    },
  });
}

// Change idea status (active -> completed -> archived)
export function useChangeIdeaStatus(): UseMutationResult<Idea, Error, { id: number; status: 'active' | 'completed' | 'archived' }> {
  const queryClient = useQueryClient();
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'completed' | 'archived' }): Promise<Idea> => {
      return fetchWithErrorHandling<Idea>(`/api/ideas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.ideasDetail(data.id), data);
      queryClient.setQueriesData(
        { queryKey: queryKeys.ideas() },
        (oldData: Idea[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(idea => 
            idea.id === data.id ? { ...idea, status: data.status } : idea
          );
        }
      );
      addToast(`Idea marked as ${data.status}!`, 'success');
    },
    onError: (error) => {
      const message = handleQueryError(error);
      addToast(`Failed to update idea status: ${message}`, 'error');
    },
  });
}

// Hook to get ideas grouped by status
export function useIdeasByStatus() {
  const { data: allIdeas, ...rest } = useIdeas();
  
  const groupedIdeas = React.useMemo(() => {
    if (!allIdeas) return null;
    
    return {
      active: allIdeas.filter(idea => idea.status === 'active'),
      completed: allIdeas.filter(idea => idea.status === 'completed'),
      archived: allIdeas.filter(idea => idea.status === 'archived'),
    };
  }, [allIdeas]);
  
  return {
    data: groupedIdeas,
    ...rest,
  };
}

// Hook for idea statistics
export function useIdeaStats() {
  const { data: allIdeas } = useIdeas();
  
  const stats = React.useMemo(() => {
    if (!allIdeas) return null;
    
    return {
      total: allIdeas.length,
      active: allIdeas.filter(idea => idea.status === 'active').length,
      completed: allIdeas.filter(idea => idea.status === 'completed').length,
      archived: allIdeas.filter(idea => idea.status === 'archived').length,
      completionRate: allIdeas.length > 0 
        ? Math.round((allIdeas.filter(idea => idea.status === 'completed').length / allIdeas.length) * 100)
        : 0,
    };
  }, [allIdeas]);
  
  return stats;
}