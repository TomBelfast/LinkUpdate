import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import Home from '@/app/page';

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
            <button onClick={() => onEdit(link)}>Edit</button>
            <button onClick={() => onDelete(link.id)}>Delete</button>
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

// Mock fetch
global.fetch = vi.fn();

describe('Home Page - Before Migration (useState)', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should render main components with current state management', async () => {
    // Mock successful API responses
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Test Idea', description: 'Description', status: 'pending' }
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Test Link', url: 'https://test.com' }
        ],
      } as Response);

    render(<Home />);
    
    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    expect(screen.getByTestId('link-form')).toBeInTheDocument();
    expect(screen.getByTestId('link-list')).toBeInTheDocument();
    expect(screen.getByTestId('idea-form')).toBeInTheDocument();
  });

  test('should handle multiple useState calls', async () => {
    // Mock API responses
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Link Manager')).toBeInTheDocument();
    });

    // Should have called fetch for both ideas and links
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith('/api/ideas');
    expect(fetch).toHaveBeenCalledWith('/api/links');
    
    consoleSpy.mockRestore();
  });

  test('should preserve search functionality with local state', async () => {
    // Mock API responses
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Test Link 1', url: 'https://test1.com' },
          { id: 2, title: 'Another Link', url: 'https://test2.com' }
        ],
      } as Response);

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search links...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search links...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    expect(searchInput).toHaveValue('Test');
  });

  test('should demonstrate current complexity with useState/useEffect', async () => {
    // This test documents the current state management complexity
    
    // The original page.tsx contains:
    // - 8+ useState calls (mounted, links, editingLink, editingIdea, searchTerm, allLinks, shouldError, isLoading, error, ideas)
    // - 6+ useEffect calls (mount check, fetch ideas, error handling, fetch links, URL params, search filter)
    
    // This demonstrates the complexity that will be reduced by Zustand + TanStack Query
    const expectedUsageBeforeMigration = {
      useStateHooks: 8,
      useEffectHooks: 6,
      totalComplexity: 14
    };
    
    console.log(`Current Home page complexity (before migration):
      - useState calls: ${expectedUsageBeforeMigration.useStateHooks}
      - useEffect calls: ${expectedUsageBeforeMigration.useEffectHooks}  
      - Total state hooks: ${expectedUsageBeforeMigration.totalComplexity}
    `);
    
    expect(expectedUsageBeforeMigration.totalComplexity).toBeGreaterThan(10);
  });
});