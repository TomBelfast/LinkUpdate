import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user';
}

interface Link {
  id: number;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Main App State Interface
interface AppState {
  // Theme state
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // UI state  
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal state
  modalOpen: boolean;
  modalContent: string | null;
  setModalOpen: (open: boolean, content?: string) => void;
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Current editing states (for forms)
  editingLink: Link | null;
  setEditingLink: (link: Link | null) => void;
  
  editingIdea: Idea | null;
  setEditingIdea: (idea: Idea | null) => void;
  
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  activeFilter: 'all' | 'links' | 'ideas' | 'prompts';
  setActiveFilter: (filter: 'all' | 'links' | 'ideas' | 'prompts') => void;
  
  // Notifications/Toast state
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
  
  // Settings
  settings: {
    autoSave: boolean;
    notifications: boolean;
    compactMode: boolean;
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Actions
  reset: () => void;
}

// Initial state
const initialState = {
  theme: 'system' as const,
  sidebarOpen: false,
  modalOpen: false,
  modalContent: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  user: null,
  editingLink: null,
  editingIdea: null,
  searchQuery: '',
  activeFilter: 'all' as const,
  toasts: [],
  settings: {
    autoSave: true,
    notifications: true,
    compactMode: false,
  },
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Theme actions
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light'
        }), false, 'toggleTheme'),
        
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        
        // UI actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
        setModalOpen: (open, content) => set({ 
          modalOpen: open, 
          modalContent: content || null 
        }, false, 'setModalOpen'),
        
        // Loading actions
        setLoading: (loading, message = '') => set({ 
          isLoading: loading, 
          loadingMessage: message 
        }, false, 'setLoading'),
        
        // Error actions
        setError: (error) => set({ error }, false, 'setError'),
        
        // User actions
        setUser: (user) => set({ user }, false, 'setUser'),
        
        // Editing actions
        setEditingLink: (link) => set({ editingLink: link }, false, 'setEditingLink'),
        
        setEditingIdea: (idea) => set({ editingIdea: idea }, false, 'setEditingIdea'),
        
        // Search and filter actions
        setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),
        
        setActiveFilter: (filter) => set({ activeFilter: filter }, false, 'setActiveFilter'),
        
        // Toast actions
        addToast: (message, type = 'info', duration = 5000) => {
          const id = Math.random().toString(36).substring(2, 9);
          const newToast = { id, message, type, duration };
          
          set((state) => ({
            toasts: [...state.toasts, newToast]
          }), false, 'addToast');
          
          // Auto-remove toast after duration
          if (duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, duration);
          }
        },
        
        removeToast: (id) => set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }), false, 'removeToast'),
        
        // Settings actions
        updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }), false, 'updateSettings'),
        
        // Reset action
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'app-store',
        // Only persist certain parts of the state
        partialize: (state) => ({ 
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          settings: state.settings,
          // Don't persist: user, loading states, errors, modals, editing states
        }),
        // Custom storage configuration
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle migrations if needed in the future
          if (version === 0) {
            // Migration logic for version 0 -> 1
            return {
              ...persistedState,
              settings: {
                autoSave: true,
                notifications: true,
                compactMode: false,
                ...persistedState.settings,
              }
            };
          }
          return persistedState;
        },
      }
    ),
    {
      name: 'app-store', // DevTools name
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Typed selectors for common use cases
export const useTheme = () => useAppStore((state) => state.theme);
export const useSetTheme = () => useAppStore((state) => state.setTheme);
export const useToggleTheme = () => useAppStore((state) => state.toggleTheme);

export const useUser = () => useAppStore((state) => state.user);
export const useSetUser = () => useAppStore((state) => state.setUser);

export const useSidebar = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  
  return {
    isOpen: sidebarOpen,
    toggle: () => setSidebarOpen(!sidebarOpen),
    open: () => setSidebarOpen(true),
    close: () => setSidebarOpen(false),
  };
};

export const useModal = () => {
  const modalOpen = useAppStore((state) => state.modalOpen);
  const modalContent = useAppStore((state) => state.modalContent);
  const setModalOpen = useAppStore((state) => state.setModalOpen);
  
  return {
    isOpen: modalOpen,
    content: modalContent,
    open: (content?: string) => setModalOpen(true, content),
    close: () => setModalOpen(false),
  };
};

export const useLoading = () => {
  const isLoading = useAppStore((state) => state.isLoading);
  const loadingMessage = useAppStore((state) => state.loadingMessage);
  const setLoading = useAppStore((state) => state.setLoading);
  
  return {
    isLoading,
    message: loadingMessage,
    setLoading,
  };
};

export const useError = () => {
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  
  return {
    error,
    setError,
    clearError: () => setError(null),
  };
};

export const useToasts = () => {
  const toasts = useAppStore((state) => state.toasts);
  const addToast = useAppStore((state) => state.addToast);
  const removeToast = useAppStore((state) => state.removeToast);
  
  return {
    toasts,
    addToast,
    removeToast,
  };
};

export const useSearch = () => {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const activeFilter = useAppStore((state) => state.activeFilter);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setActiveFilter = useAppStore((state) => state.setActiveFilter);
  
  return {
    query: searchQuery,
    filter: activeFilter,
    setQuery: setSearchQuery,
    setFilter: setActiveFilter,
  };
};

export const useSettings = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  
  return {
    settings,
    updateSettings,
  };
};

// Export types for use in components
export type { User, Link, Idea, AppState };