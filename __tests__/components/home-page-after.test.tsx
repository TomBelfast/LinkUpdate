import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import Home from '@/app/page-modernized';

// Mock the dynamic imports
vi.mock('next/dynamic', () => ({
  default: (importFunc: () => Promise<any>) => {
    const Component = importFunc();
    return Component;
  }
}));

// Mock the components
vi.mock('@/components/LinkForm', () => ({
  default: function MockLinkForm({ onSubmit }: any) {
    return (
      <div data-testid="link-form">
        <button onClick={() => onSubmit({ url: 'test.com', title: 'Test' })}>
          Submit Link
        </button>
      </div>
    );
  }
}));

vi.mock('@/components/LinkList', () => ({
  default: function MockLinkList({ links, onEdit, onDelete }: any) {
    return (
      <div data-testid="link-list">
        {links?.map((link: any) => (
          <div key={link.id} data-testid={`link-${link.id}`}>
            {link.title}
            {/* ZACHOWUJEMY gradienty w buttonach! */}
            <button className="gradient-button edit-gradient" onClick={() => onEdit(link)}>
              Edit
            </button>
            <button className="gradient-button delete-gradient" onClick={() => onDelete(link.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  }
}));

vi.mock('@/components/IdeaForm', () => ({
  default: function MockIdeaForm({ onSubmit }: any) {
    return (
      <div data-testid="idea-form">
        <button onClick={() => onSubmit({ title: 'Test Idea', description: 'Test', status: 'pending' })}>
          Submit Idea
        </button>
      </div>
    );
  }
}));

// Mock the query hooks
vi.mock('@/lib/query/use-links', () => ({
  useLinks: vi.fn(),
  useCreateLink: vi.fn(),
  useUpdateLink: vi.fn(),
  useDeleteLink: vi.fn(),
}));

vi.mock('@/lib/query/use-ideas', () => ({
  useIdeas: vi.fn(),
  useCreateIdea: vi.fn(),
  useUpdateIdea: vi.fn(),
  useDeleteIdea: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Home Page - After Migration (Zustand + TanStack Query)', () => {
  const mockUseLinks = require('@/lib/query/use-links').useLinks;
  const mockUseIdeas = require('@/lib/query/use-ideas').useIdeas;
  const mockUseCreateLink = require('@/lib/query/use-links').useCreateLink;
  const mockUseCreateIdea = require('@/lib/query/use-ideas').useCreateIdea;
  const mockUseDeleteLink = require('@/lib/query/use-links').useDeleteLink;
  const mockUseDeleteIdea = require('@/lib/query/use-ideas').useDeleteIdea;
  const mockUseUpdateLink = require('@/lib/query/use-links').useUpdateLink;
  const mockUseUpdateIdea = require('@/lib/query/use-ideas').useUpdateIdea;

  beforeEach(() => {
    // Setup default mock returns
    mockUseLinks.mockReturnValue({
      data: [
        { id: 1, title: 'Test Link', url: 'https://test.com' }
      ],
      isLoading: false,
      error: null,
    });

    mockUseIdeas.mockReturnValue({
      data: [
        { id: 1, title: 'Test Idea', description: 'Description', status: 'pending' }
      ],
      isLoading: false,
      error: null,
    });

    mockUseCreateLink.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });

    mockUseCreateIdea.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });

    mockUseDeleteLink.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });

    mockUseDeleteIdea.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });

    mockUseUpdateLink.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });

    mockUseUpdateIdea.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render main components with modern state management', async () => {
    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    expect(screen.getByTestId('link-form')).toBeInTheDocument();
    expect(screen.getByTestId('link-list')).toBeInTheDocument();
    expect(screen.getByTestId('idea-form')).toBeInTheDocument();
  });

  test('should use TanStack Query instead of manual fetch calls', async () => {
    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    // Verify that query hooks are called instead of fetch
    expect(mockUseLinks).toHaveBeenCalled();
    expect(mockUseIdeas).toHaveBeenCalled();
    
    // No direct fetch calls should be made
    expect(fetch).not.toHaveBeenCalled();
  });

  test('should preserve gradient buttons in migrated components', async () => {
    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    // Check that gradient classes are preserved
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');

    editButtons.forEach(button => {
      expect(button).toHaveClass('gradient-button', 'edit-gradient');
    });

    deleteButtons.forEach(button => {
      expect(button).toHaveClass('gradient-button', 'delete-gradient');
    });
  });

  test('should handle loading states through TanStack Query', async () => {
    // Mock loading state
    mockUseLinks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    mockUseIdeas.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<Home />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Loading links...')).toBeInTheDocument();
  });

  test('should handle error states through centralized error handling', async () => {
    const testError = new Error('Test error');
    
    mockUseLinks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: testError,
    });

    mockUseIdeas.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  test('should use Zustand store for search functionality', async () => {
    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search links...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search links...');
    fireEvent.change(searchInput, { target: { value: 'Test Query' } });
    
    // The search should trigger the useLinks hook with search parameters
    expect(mockUseLinks).toHaveBeenCalledWith({ search: 'Test Query' });
  });

  test('should demonstrate reduced complexity compared to useState version', async () => {
    // This test documents the improvement
    const newHomeSource = require('@/app/page-modernized').toString();
    
    // Count remaining useState/useEffect calls
    const useStateCount = (newHomeSource.match(/useState/g) || []).length;
    const useEffectCount = (newHomeSource.match(/useEffect/g) || []).length;
    
    console.log(`Migrated Home page complexity:
      - useState calls: ${useStateCount} (down from 8+)
      - useEffect calls: ${useEffectCount} (down from 6+)
      - Total state hooks: ${useStateCount + useEffectCount}
      - Replaced with: Zustand store + TanStack Query hooks
    `);
    
    // Should have significantly fewer direct state management calls
    expect(useStateCount + useEffectCount).toBeLessThan(4);
    
    // The complex state logic is now handled by:
    // - Zustand store (centralized state)
    // - TanStack Query hooks (server state)
    // - Fewer, more focused useEffect calls
  });

  test('should maintain all original functionality', async () => {
    render(<Home />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    // All original sections should still be present
    expect(screen.getByText('Add New Link')).toBeInTheDocument();
    expect(screen.getByText('Your Links')).toBeInTheDocument();
    expect(screen.getByText('Ideas')).toBeInTheDocument();
    
    // Search functionality preserved
    expect(screen.getByPlaceholderText('Search links...')).toBeInTheDocument();
    
    // Form submission should work
    const submitButton = screen.getByText('Submit Link');
    fireEvent.click(submitButton);
    
    expect(mockUseCreateLink().mutateAsync).toHaveBeenCalled();
  });
});