import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '@/lib/query/use-links';
import { useIdeas, useCreateIdea, useIdeaStats } from '@/lib/query/use-ideas';
import { queryKeys } from '@/lib/query/query-client';
import React from 'react';

import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the app store
vi.mock('@/lib/store/app-store', () => ({
  useAppStore: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}));

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence error logs in tests
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('TanStack Query Hooks', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Links Hooks', () => {
    describe('useLinks', () => {
      test('should fetch links successfully', async () => {
        const mockLinks = [
          { id: 1, title: 'Test Link 1', url: 'https://test1.com' },
          { id: 2, title: 'Test Link 2', url: 'https://test2.com' },
        ];

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockLinks,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useLinks(), {
          wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockLinks);
        expect(fetch).toHaveBeenCalledWith('/api/links', {
          headers: { 'Content-Type': 'application/json' },
        });
      });

      test('should handle fetch error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useLinks(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(Error);
      });

      test('should pass filters in query parameters', async () => {
        const mockLinks = [];
        
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockLinks,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(
          () => useLinks({ search: 'test', userId: 'user123' }),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(fetch).toHaveBeenCalledWith(
          '/api/links?search=test&userId=user123',
          { headers: { 'Content-Type': 'application/json' } }
        );
      });
    });

    describe('useCreateLink', () => {
      test('should create link successfully', async () => {
        const newLink = { id: 3, title: 'New Link', url: 'https://new.com' };
        const linkData = { title: 'New Link', url: 'https://new.com' };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => newLink,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useCreateLink(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(linkData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(newLink);
        expect(fetch).toHaveBeenCalledWith('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData),
        });
      });

      test('should handle create error', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 400,
        });

        const { result } = renderHook(() => useCreateLink(), {
          wrapper: createWrapper(),
        });

        result.current.mutate({
          title: 'Test Link',
          url: 'https://test.com',
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    describe('useUpdateLink', () => {
      test('should update link successfully', async () => {
        const updatedLink = { 
          id: 1, 
          title: 'Updated Link', 
          url: 'https://updated.com' 
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => updatedLink,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useUpdateLink(), {
          wrapper: createWrapper(),
        });

        result.current.mutate({
          id: 1,
          title: 'Updated Link',
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(updatedLink);
        expect(fetch).toHaveBeenCalledWith('/api/links/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Link' }),
        });
      });
    });

    describe('useDeleteLink', () => {
      test('should delete link successfully', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          text: async () => '',
        });

        const { result } = renderHook(() => useDeleteLink(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(1);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(fetch).toHaveBeenCalledWith('/api/links/1', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      });
    });
  });

  describe('Ideas Hooks', () => {
    describe('useIdeas', () => {
      test('should fetch ideas successfully', async () => {
        const mockIdeas = [
          { 
            id: 1, 
            title: 'Test Idea 1', 
            description: 'Description 1',
            status: 'active' as const
          },
          { 
            id: 2, 
            title: 'Test Idea 2', 
            description: 'Description 2',
            status: 'completed' as const
          },
        ];

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockIdeas,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useIdeas(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockIdeas);
        expect(fetch).toHaveBeenCalledWith('/api/ideas', {
          headers: { 'Content-Type': 'application/json' },
        });
      });

      test('should filter by status', async () => {
        const mockIdeas = [];

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockIdeas,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(
          () => useIdeas({ status: 'active' }),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(fetch).toHaveBeenCalledWith(
          '/api/ideas?status=active',
          { headers: { 'Content-Type': 'application/json' } }
        );
      });
    });

    describe('useCreateIdea', () => {
      test('should create idea successfully', async () => {
        const newIdea = { 
          id: 3, 
          title: 'New Idea', 
          description: 'New Description',
          status: 'active' as const
        };
        const ideaData = { 
          title: 'New Idea', 
          description: 'New Description',
          status: 'active' as const
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => newIdea,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useCreateIdea(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(ideaData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(newIdea);
        expect(fetch).toHaveBeenCalledWith('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ideaData),
        });
      });
    });

    describe('useIdeaStats', () => {
      test('should calculate idea statistics', async () => {
        const mockIdeas = [
          { id: 1, title: 'Idea 1', description: 'Desc 1', status: 'active' as const },
          { id: 2, title: 'Idea 2', description: 'Desc 2', status: 'active' as const },
          { id: 3, title: 'Idea 3', description: 'Desc 3', status: 'completed' as const },
          { id: 4, title: 'Idea 4', description: 'Desc 4', status: 'archived' as const },
        ];

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockIdeas,
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useIdeaStats(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current).toEqual({
            total: 4,
            active: 2,
            completed: 1,
            archived: 1,
            completionRate: 25, // 1 completed out of 4 total = 25%
          });
        });
      });

      test('should handle empty ideas list', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
          headers: new Headers({ 'content-type': 'application/json' }),
        });

        const { result } = renderHook(() => useIdeaStats(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current).toEqual({
            total: 0,
            active: 0,
            completed: 0,
            archived: 0,
            completionRate: 0,
          });
        });
      });
    });
  });

  describe('Query Keys', () => {
    test('should generate correct query keys', () => {
      expect(queryKeys.links()).toEqual(['queries', 'links']);
      expect(queryKeys.linksList()).toEqual(['queries', 'links', 'list', undefined]);
      expect(queryKeys.linksList({ search: 'test' })).toEqual(['queries', 'links', 'list', { search: 'test' }]);
      expect(queryKeys.linksDetail(1)).toEqual(['queries', 'links', 'detail', 1]);
      
      expect(queryKeys.ideas()).toEqual(['queries', 'ideas']);
      expect(queryKeys.ideasList({ status: 'active' })).toEqual(['queries', 'ideas', 'list', { status: 'active' }]);
      expect(queryKeys.ideasDetail(1)).toEqual(['queries', 'ideas', 'detail', 1]);
    });
  });
});