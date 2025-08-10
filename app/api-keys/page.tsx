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

interface ApiKey {
  id: number;
  user_id: string;
  service_name: string;
  api_name: string;
  website_url?: string;
  api_key: string;
  description?: string;
  is_active: boolean;
  expires_at?: Date;
  usage_count: number;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
  categories?: string;
}

interface ApiCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export default function ApiKeys() {
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

  // Local state
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [categories, setCategories] = React.useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingApiKey, setEditingApiKey] = React.useState<ApiKey | null>(null);
  const [showApiKey, setShowApiKey] = React.useState<{ [key: number]: boolean }>({});

  // Form state
  const [formData, setFormData] = React.useState({
    service_name: '',
    api_name: '',
    website_url: '',
    api_key: '',
    description: '',
  });

  const [editFormData, setEditFormData] = React.useState({
    service_name: '',
    api_name: '',
    website_url: '',
    api_key: '',
    description: '',
  });

  // Fetch API keys
  const fetchApiKeys = React.useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/api-keys');

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError('Failed to load API keys');
      addToast('Nie udało się pobrać kluczy API', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [status, setError, addToast]);

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await fetch('/api/api-keys/categories');

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchApiKeys();
    fetchCategories();
  }, [fetchApiKeys, fetchCategories]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== 'authenticated') {
      addToast('Musisz być zalogowany aby dodać klucz API', 'error');
      return;
    }

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add API key');
      }

      setFormData({
        service_name: '',
        api_name: '',
        website_url: '',
        api_key: '',
        description: ''
      });
      addToast('Klucz API został dodany!', 'success');
      fetchApiKeys();
    } catch (error) {
      console.error('Error adding API key:', error);
      addToast('Nie udało się dodać klucza API', 'error');
    }
  };

  const handleEdit = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey);
    setEditFormData({
      service_name: apiKey.service_name,
      api_name: apiKey.api_name,
      website_url: apiKey.website_url || '',
      api_key: apiKey.api_key,
      description: apiKey.description || '',
    });
    setModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingApiKey) return;

    try {
      const response = await fetch(`/api/api-keys/${editingApiKey.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      setModalOpen(false);
      setEditingApiKey(null);
      addToast('Klucz API został zaktualizowany!', 'success');
      fetchApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      addToast('Nie udało się zaktualizować klucza API', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      addToast('Klucz API został usunięty!', 'success');
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      addToast('Nie udało się usunąć klucza API', 'error');
    }
  };

  const handleCopy = (apiKey: string, serviceName: string) => {
    navigator.clipboard.writeText(apiKey);
    addToast(`${serviceName} API key copied to clipboard!`, 'success');
  };

  const toggleApiKeyVisibility = (id: number) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '••••••••';
    return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4);
  };

  // Filter API keys based on search
  const filteredApiKeys = apiKeys.filter(apiKey =>
    apiKey.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apiKey.api_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apiKey.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <h1 className="text-3xl font-bold mb-8 text-white">API Keys Manager</h1>

      {session ? (
        <>
          {/* Add API Key Form */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Add New API Key</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service_name" className="block text-sm font-medium text-white mb-2">
                    Service Name
                  </label>
                  <input
                    type="text"
                    id="service_name"
                    name="service_name"
                    value={formData.service_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="OpenAI, Google, AWS..."
                  />
                </div>

                <div>
                  <label htmlFor="api_name" className="block text-sm font-medium text-white mb-2">
                    API Name
                  </label>
                  <input
                    type="text"
                    id="api_name"
                    name="api_name"
                    value={formData.api_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="GPT-4, Vision API, S3..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-white mb-2">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://platform.openai.com"
                />
              </div>

              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-white mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  id="api_key"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>

              <button
                type="submit"
                className="gradient-button w-full py-2 px-4 rounded-md text-white font-medium transition-all duration-300"
              >
                Add API Key
              </button>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes about this API key..."
                />
              </div>
            </form>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search API keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You need to be logged in to manage API keys.</p>
          <a
            href="/auth/signin"
            className="gradient-button px-6 py-2 rounded-md text-white font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading API keys...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : filteredApiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No API keys found matching your search.' : 'No API keys yet. Add your first API key above!'}
          </div>
        ) : (
          filteredApiKeys.map((apiKey) => (
            <div key={apiKey.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {apiKey.service_name}
                    </h3>
                    {!apiKey.is_active && (
                      <span className="px-2 py-1 text-xs bg-red-600 text-red-100 rounded">Inactive</span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-2">
                    API: {apiKey.api_name}
                  </p>

                  {apiKey.website_url && (
                    <p className="text-blue-400 text-sm mb-2">
                      <a href={apiKey.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {apiKey.website_url}
                      </a>
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-300 text-sm font-mono">
                      {showApiKey[apiKey.id] ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                    </span>
                    <button
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      {showApiKey[apiKey.id] ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {apiKey.description && (
                    <p className="text-gray-300 text-sm mb-2">
                      {apiKey.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Used: {apiKey.usage_count} times</span>
                    <span>Added: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(apiKey.api_key, apiKey.service_name)}
                    className="gradient-button copy-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                  >
                    Copy
                  </button>

                  {session && (
                    <>
                      <button
                        onClick={() => handleEdit(apiKey)}
                        className="gradient-button edit-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(apiKey.id)}
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
                Edit API Key
              </DialogTitle>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-service_name" className="block text-sm font-medium text-white mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      id="edit-service_name"
                      name="service_name"
                      value={editFormData.service_name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-api_name" className="block text-sm font-medium text-white mb-2">
                      API Name
                    </label>
                    <input
                      type="text"
                      id="edit-api_name"
                      name="api_name"
                      value={editFormData.api_name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-website_url" className="block text-sm font-medium text-white mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="edit-website_url"
                    name="website_url"
                    value={editFormData.website_url}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="edit-api_key" className="block text-sm font-medium text-white mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="edit-api_key"
                    name="api_key"
                    value={editFormData.api_key}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    Update API Key
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