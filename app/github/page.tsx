'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Modern state management
import { useAppStore } from '@/lib/store/app-store';
import { useToasts, useError } from '@/lib/store/app-store';

// Dynamicznie importujemy komponenty z headlessui
const DialogRoot = dynamic(
  () => import('@headlessui/react').then(mod => mod.Dialog),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-700 h-64 rounded-lg"></div>
  }
);

const DialogPanel = dynamic(
  () => import('@headlessui/react').then(mod => mod.Dialog.Panel),
  { ssr: false }
);

const DialogTitle = dynamic(
  () => import('@headlessui/react').then(mod => mod.Dialog.Title),
  { ssr: false }
);

interface GitHubRepository {
  id: number;
  user_id: string;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  clone_url?: string;
  ssh_url?: string;
  language?: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  is_private: boolean;
  is_fork: boolean;
  is_archived: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  license_name?: string;
  topics?: string;
  github_created_at?: Date;
  github_updated_at?: Date;
  github_pushed_at?: Date;
  created_at: Date;
  updated_at: Date;
  tags?: string;
  notes_count?: number;
  is_favorite?: boolean;
}

export default function GitHub() {
  const { data: session, status } = useSession();
  
  // Zustand store state
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const modalOpen = useAppStore((state) => state.modalOpen);
  const setModalOpen = useAppStore((state) => state.setModalOpen);
  
  // Toast notifications
  const { addToast } = useToasts();
  
  // Error handling
  const { error, setError } = useError();
  
  // Local state for repositories
  const [repositories, setRepositories] = React.useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingRepo, setEditingRepo] = React.useState<GitHubRepository | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    full_name: '',
    description: '',
    html_url: '',
    language: '',
    topics: '',
  });
  
  const [editFormData, setEditFormData] = React.useState({
    name: '',
    full_name: '',
    description: '',
    html_url: '',
    language: '',
    topics: '',
  });

  // Fetch repositories
  const fetchRepositories = React.useCallback(async () => {
    if (status !== 'authenticated') return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/github/repositories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to load GitHub repositories');
      addToast('Nie udało się pobrać repozytoriów GitHub', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [status, setError, addToast]);

  React.useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      addToast('Musisz być zalogowany aby dodać repozytorium', 'error');
      return;
    }

    try {
      const response = await fetch('/api/github/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add repository');
      }

      setFormData({ name: '', full_name: '', description: '', html_url: '', language: '', topics: '' });
      addToast('Repozytorium zostało dodane!', 'success');
      fetchRepositories();
    } catch (error) {
      console.error('Error adding repository:', error);
      addToast('Nie udało się dodać repozytorium', 'error');
    }
  };

  const handleEdit = (repo: GitHubRepository) => {
    setEditingRepo(repo);
    setEditFormData({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      html_url: repo.html_url,
      language: repo.language || '',
      topics: repo.topics || '',
    });
    setModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRepo) return;

    try {
      const response = await fetch(`/api/github/repositories/${editingRepo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update repository');
      }

      setModalOpen(false);
      setEditingRepo(null);
      addToast('Repozytorium zostało zaktualizowane!', 'success');
      fetchRepositories();
    } catch (error) {
      console.error('Error updating repository:', error);
      addToast('Nie udało się zaktualizować repozytorium', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this repository?')) {
      return;
    }

    try {
      const response = await fetch(`/api/github/repositories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }

      addToast('Repozytorium zostało usunięte!', 'success');
      fetchRepositories();
    } catch (error) {
      console.error('Error deleting repository:', error);
      addToast('Nie udało się usunąć repozytorium', 'error');
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('URL copied to clipboard!', 'success');
  };

  const handleShare = (repo: GitHubRepository) => {
    if (navigator.share) {
      navigator.share({
        title: repo.name,
        text: repo.description ?? 'GitHub Repository',
        url: repo.html_url,
      });
    } else {
      addToast('Sharing is not supported in this browser', 'warning');
    }
  };

  // Filter repositories based on search
  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.topics?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">GitHub Repositories</h1>
      
      {session ? (
        <>
          {/* Add Repository Form */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Add New Repository</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="my-awesome-repo"
                  />
                </div>
                
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-white mb-2">
                    Full Name (owner/repo)
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="username/my-awesome-repo"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="html_url" className="block text-sm font-medium text-white mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="html_url"
                  name="html_url"
                  value={formData.html_url}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-white mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="JavaScript"
                  />
                </div>
                
                <div>
                  <label htmlFor="topics" className="block text-sm font-medium text-white mb-2">
                    Topics (comma separated)
                  </label>
                  <input
                    type="text"
                    id="topics"
                    name="topics"
                    value={formData.topics}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="react,nodejs,javascript"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repository description"
                />
              </div>
              
              <button
                type="submit"
                className="gradient-button w-full py-2 px-4 rounded-md text-white font-medium transition-all duration-300"
              >
                Add Repository
              </button>
            </form>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You need to be logged in to manage GitHub repositories.</p>
          <a 
            href="/auth/signin" 
            className="gradient-button px-6 py-2 rounded-md text-white font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Repositories List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading repositories...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : filteredRepositories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No repositories found matching your search.' : 'No repositories yet. Add your first repository above!'}
          </div>
        ) : (
          filteredRepositories.map((repo) => (
            <div key={repo.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    {repo.is_fork && (
                      <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">Fork</span>
                    )}
                    {repo.is_private && (
                      <span className="px-2 py-1 text-xs bg-yellow-600 text-yellow-100 rounded">Private</span>
                    )}
                    {repo.is_archived && (
                      <span className="px-2 py-1 text-xs bg-red-600 text-red-100 rounded">Archived</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    {repo.full_name}
                  </p>
                  
                  {repo.description && (
                    <p className="text-gray-300 text-sm mb-2">
                      {repo.description}
                    </p>
                  )}
                  {!repo.description && (
                    <p className="text-gray-500 text-sm mb-2">No description provided.</p>
                  )}

                  {/** AI generated description (if exists) */}
                  {(repo as any).ai_description && (
                    <p className="text-gray-200 text-sm mb-3 italic">
                      {(repo as any).ai_description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stars_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>👀 {repo.watchers_count}</span>
                  </div>
                  
                  {repo.topics && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {repo.topics.split(',').map((topic, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded">
                          {topic.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {repo.created_at && (
                    <p className="text-gray-500 text-xs">
                      Added: {new Date(repo.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(repo.html_url)}
                    className="gradient-button copy-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                  >
                    Copy
                  </button>
                  
                  <button
                    onClick={() => handleShare(repo)}
                    className="gradient-button share-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                  >
                    Share
                  </button>
                  
                  {session && (
                    <>
                      <button
                        onClick={() => handleEdit(repo)}
                        className="gradient-button edit-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                      >
                        Edit
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            const resp = await fetch(`/api/github/repositories/${repo.id}/generate-description`, { method: 'POST' });
                            const data = await resp.json();
                            if (!resp.ok) throw new Error(data?.error || 'Generation failed');
                            addToast('Opis wygenerowany przez Perplexity', 'success');
                            fetchRepositories();
                          } catch (e) {
                            addToast('Nie udało się wygenerować opisu', 'error');
                          }
                        }}
                        className="gradient-button copy-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                        title="Użyj Perplexity do wygenerowania opisu"
                      >
                        Użyj Perplexity
                      </button>
                      
                      <button
                        onClick={() => handleDelete(repo.id)}
                        className="gradient-button delete-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <DialogRoot open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <DialogPanel className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogTitle className="text-xl font-semibold text-white mb-4">
                Edit Repository
              </DialogTitle>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-white mb-2">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-full_name" className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="edit-full_name"
                      name="full_name"
                      value={editFormData.full_name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-html_url" className="block text-sm font-medium text-white mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="edit-html_url"
                    name="html_url"
                    value={editFormData.html_url}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-language" className="block text-sm font-medium text-white mb-2">
                      Language
                    </label>
                    <input
                      type="text"
                      id="edit-language"
                      name="language"
                      value={editFormData.language}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-topics" className="block text-sm font-medium text-white mb-2">
                      Topics
                    </label>
                    <input
                      type="text"
                      id="edit-topics"
                      name="topics"
                      value={editFormData.topics}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="gradient-button flex-1 py-2 px-4 rounded-md text-white font-medium transition-all duration-300"
                  >
                    Update Repository
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </DialogRoot>
      </Suspense>
    </div>
  );
}