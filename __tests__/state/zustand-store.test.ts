import { renderHook, act } from '@testing-library/react';
import { 
  useAppStore, 
  useTheme, 
  useUser, 
  useSidebar, 
  useModal, 
  useLoading,
  useError,
  useToasts,
  useSearch,
  useSettings
} from '@/lib/store/app-store';

describe('Zustand App Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAppStore.getState();
    store.reset();
  });

  describe('Theme Management', () => {
    test('should initialize with system theme', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe('system');
    });

    test('should toggle theme through cycle: light -> dark -> system -> light', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Start with system, first toggle should go to light
      act(() => {
        result.current.setTheme('system');
      });
      
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('dark');
      
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('system');
    });

    test('should set theme directly', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('User Management', () => {
    test('should initialize with no user', () => {
      const { result } = renderHook(() => useUser());
      expect(result.current).toBeNull();
    });

    test('should set and update user', () => {
      const { result } = renderHook(() => useAppStore());
      const testUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin' as const,
      };
      
      act(() => {
        result.current.setUser(testUser);
      });
      
      expect(result.current.user).toEqual(testUser);
    });

    test('should clear user', () => {
      const { result } = renderHook(() => useAppStore());
      const testUser = {
        id: '1',
        email: 'test@example.com',
      };
      
      act(() => {
        result.current.setUser(testUser);
      });
      
      expect(result.current.user).toEqual(testUser);
      
      act(() => {
        result.current.setUser(null);
      });
      
      expect(result.current.user).toBeNull();
    });
  });

  describe('Sidebar Management', () => {
    test('should initialize with closed sidebar', () => {
      const { result } = renderHook(() => useSidebar());
      expect(result.current.isOpen).toBe(false);
    });

    test('should toggle sidebar', () => {
      const { result } = renderHook(() => useSidebar());
      
      act(() => {
        result.current.toggle();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      act(() => {
        result.current.toggle();
      });
      
      expect(result.current.isOpen).toBe(false);
    });

    test('should open and close sidebar directly', () => {
      const { result } = renderHook(() => useSidebar());
      
      act(() => {
        result.current.open();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      act(() => {
        result.current.close();
      });
      
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Modal Management', () => {
    test('should initialize with closed modal', () => {
      const { result } = renderHook(() => useModal());
      expect(result.current.isOpen).toBe(false);
      expect(result.current.content).toBeNull();
    });

    test('should open modal with content', () => {
      const { result } = renderHook(() => useModal());
      
      act(() => {
        result.current.open('test-content');
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.content).toBe('test-content');
    });

    test('should close modal and clear content', () => {
      const { result } = renderHook(() => useModal());
      
      act(() => {
        result.current.open('test-content');
      });
      
      act(() => {
        result.current.close();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.content).toBeNull();
    });
  });

  describe('Loading State Management', () => {
    test('should initialize with no loading state', () => {
      const { result } = renderHook(() => useLoading());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.message).toBe('');
    });

    test('should set loading state with message', () => {
      const { result } = renderHook(() => useLoading());
      
      act(() => {
        result.current.setLoading(true, 'Loading data...');
      });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.message).toBe('Loading data...');
    });

    test('should clear loading state', () => {
      const { result } = renderHook(() => useLoading());
      
      act(() => {
        result.current.setLoading(true, 'Loading...');
      });
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.message).toBe('');
    });
  });

  describe('Error Management', () => {
    test('should initialize with no error', () => {
      const { result } = renderHook(() => useError());
      expect(result.current.error).toBeNull();
    });

    test('should set and clear error', () => {
      const { result } = renderHook(() => useError());
      
      act(() => {
        result.current.setError('Test error message');
      });
      
      expect(result.current.error).toBe('Test error message');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Toast Management', () => {
    beforeEach(() => {
      // Clear any existing timers
      if (typeof jest !== 'undefined') {
        jest.clearAllTimers();
      }
    });

    afterEach(() => {
      if (typeof jest !== 'undefined') {
        jest.clearAllTimers();
      }
    });

    test('should initialize with no toasts', () => {
      const { result } = renderHook(() => useToasts());
      expect(result.current.toasts).toHaveLength(0);
    });

    test('should add toast', () => {
      const { result } = renderHook(() => useToasts());
      
      act(() => {
        result.current.addToast('Test message', 'success');
      });
      
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        message: 'Test message',
        type: 'success',
      });
      expect(result.current.toasts[0].id).toBeDefined();
    });

    test('should remove toast manually', () => {
      const { result } = renderHook(() => useToasts());
      
      act(() => {
        result.current.addToast('Test message');
      });
      
      const toastId = result.current.toasts[0].id;
      
      act(() => {
        result.current.removeToast(toastId);
      });
      
      expect(result.current.toasts).toHaveLength(0);
    });

    test('should auto-remove toast after duration', async () => {
      const { result } = renderHook(() => useToasts());
      
      act(() => {
        result.current.addToast('Test message', 'info', 100); // 100ms duration
      });
      
      expect(result.current.toasts).toHaveLength(1);
      
      // Wait for the toast to be auto-removed
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Check that the toast was removed
      expect(result.current.toasts).toHaveLength(0);
    });

    test('should not auto-remove toast with zero duration', async () => {
      const { result } = renderHook(() => useToasts());
      
      act(() => {
        result.current.addToast('Test message', 'info', 0); // No auto-removal
      });
      
      expect(result.current.toasts).toHaveLength(1);
      
      // Wait to ensure no auto-removal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(result.current.toasts).toHaveLength(1); // Still there
    });
  });

  describe('Search and Filter Management', () => {
    test('should initialize with empty search and all filter', () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.query).toBe('');
      expect(result.current.filter).toBe('all');
    });

    test('should update search query', () => {
      const { result } = renderHook(() => useSearch());
      
      act(() => {
        result.current.setQuery('test search');
      });
      
      expect(result.current.query).toBe('test search');
    });

    test('should update filter', () => {
      const { result } = renderHook(() => useSearch());
      
      act(() => {
        result.current.setFilter('links');
      });
      
      expect(result.current.filter).toBe('links');
    });
  });

  describe('Settings Management', () => {
    test('should initialize with default settings', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.settings).toEqual({
        autoSave: true,
        notifications: true,
        compactMode: false,
      });
    });

    test('should update individual settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.updateSettings({ compactMode: true });
      });
      
      expect(result.current.settings.compactMode).toBe(true);
      expect(result.current.settings.autoSave).toBe(true); // Should remain unchanged
    });

    test('should update multiple settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.updateSettings({ 
          compactMode: true,
          notifications: false 
        });
      });
      
      expect(result.current.settings).toEqual({
        autoSave: true,
        notifications: false,
        compactMode: true,
      });
    });
  });

  describe('Editing State Management', () => {
    test('should initialize with no editing states', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.editingLink).toBeNull();
      expect(result.current.editingIdea).toBeNull();
    });

    test('should set editing link', () => {
      const { result } = renderHook(() => useAppStore());
      const testLink = {
        id: 1,
        title: 'Test Link',
        url: 'https://test.com',
      };
      
      act(() => {
        result.current.setEditingLink(testLink);
      });
      
      expect(result.current.editingLink).toEqual(testLink);
    });

    test('should clear editing link', () => {
      const { result } = renderHook(() => useAppStore());
      const testLink = {
        id: 1,
        title: 'Test Link', 
        url: 'https://test.com',
      };
      
      act(() => {
        result.current.setEditingLink(testLink);
      });
      
      act(() => {
        result.current.setEditingLink(null);
      });
      
      expect(result.current.editingLink).toBeNull();
    });
  });

  describe('Store Reset', () => {
    test('should reset all state to initial values', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Modify various state values
      act(() => {
        result.current.setTheme('dark');
        result.current.setSidebarOpen(true);
        result.current.setError('Test error');
        result.current.setUser({ id: '1', email: 'test@test.com' });
        result.current.addToast('Test toast');
      });
      
      // Verify state was changed
      expect(result.current.theme).toBe('dark');
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.error).toBe('Test error');
      expect(result.current.user).not.toBeNull();
      expect(result.current.toasts).toHaveLength(1);
      
      // Reset store
      act(() => {
        result.current.reset();
      });
      
      // Verify state was reset
      expect(result.current.theme).toBe('system');
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.toasts).toHaveLength(0);
    });
  });
});