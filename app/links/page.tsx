'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Link as LinkType } from '@/db/schema';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Modern state management
import { useAppStore } from '@/lib/store/app-store';
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '@/lib/query/use-links';
import { useToasts, useError } from '@/lib/store/app-store';

// Dynamicznie importujemy komponenty z headlessui (zachowujemy dla performance)
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

// Rozszerzamy typ LinkType o opcjonalny timestamp
type LinkWithTimestamp = LinkType & { _timestamp?: number };

export default function Links() {
  const { data: session, status } = useSession();
  
  // Zustand store state (replaces 8+ useState hooks)
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const editingLink = useAppStore((state) => state.editingLink);
  const setEditingLink = useAppStore((state) => state.setEditingLink);
  const modalOpen = useAppStore((state) => state.modalOpen);
  const setModalOpen = useAppStore((state) => state.setModalOpen);
  
  // Toast notifications (replaces manual toast state)
  const { addToast } = useToasts();
  
  // Error handling (centralized)
  const { error, setError } = useError();
  
  // TanStack Query hooks (replaces manual fetch + useEffect)
  const { 
    data: links = [], 
    isLoading, 
    error: linksError 
  } = useLinks({ search: searchQuery });
  
  // Mutations (replaces manual fetch in handlers)  
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  // Form state (minimal local state for forms only)
  const [formData, setFormData] = React.useState({
    url: '',
    title: '',
    description: '',
  });
  
  const [editFormData, setEditFormData] = React.useState({
    url: '',
    title: '',
    description: '',
  });

  // Form handlers (simplified with mutations)
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
      addToast('Musisz być zalogowany aby dodać link', 'error');
      return;
    }

    try {
      await createLink.mutateAsync(formData);
      setFormData({ url: '', title: '', description: '' });
    } catch (error) {
      console.error('Error adding link:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleEdit = (link: LinkWithTimestamp) => {
    setEditingLink(link as any);
    setEditFormData({
      url: link.url,
      title: link.title,
      description: link.description || '',
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
    
    if (!editingLink) return;

    try {
      await updateLink.mutateAsync({
        ...editFormData,
        id: editingLink.id,
      });
      setModalOpen(false);
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating link:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      await deleteLink.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting link:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('URL copied to clipboard!', 'success');
  };

  const handleShare = (link: LinkType) => {
    if (navigator.share) {
      navigator.share({
        title: link.title,
        text: link.description ?? 'No description available',
        url: link.url,
      });
    } else {
      addToast('Sharing is not supported in this browser', 'warning');
    }
  };

  // Error boundary
  React.useEffect(() => {
    if (linksError) {
      setError(linksError.message);
      addToast('Nie udało się pobrać linków', 'error');
    }
  }, [linksError, setError, addToast]);

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
      <h1 className="text-3xl font-bold mb-8 text-white">Links</h1>
      
      {session ? (
        <>
          {/* Add Link Form */}
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-white mb-2">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Link title"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Link description"
                />
              </div>
              
              <button
                type="submit"
                disabled={createLink.isPending}
                className="gradient-button w-full py-2 px-4 rounded-md text-white font-medium transition-all duration-300 disabled:opacity-50"
              >
                {createLink.isPending ? 'Adding...' : 'Add Link'}
              </button>
            </form>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You need to be logged in to manage links.</p>
          <a 
            href="/auth/signin" 
            className="gradient-button px-6 py-2 rounded-md text-white font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading links...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : links.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No links found matching your search.' : 'No links yet. Add your first link above!'}
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                    >
                      {link.title}
                    </a>
                  </h3>
                  
                  <p className="text-gray-400 text-sm break-all mb-2">
                    {link.url}
                  </p>
                  
                  {link.description && (
                    <p className="text-gray-300 text-sm">
                      {link.description}
                    </p>
                  )}
                  
                  {link.createdAt && (
                    <p className="text-gray-500 text-xs mt-2">
                      Added: {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {/* ZACHOWUJEMY wszystkie gradienty! */}
                  <button
                    onClick={() => handleCopy(link.url)}
                    className="gradient-button copy-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                  >
                    Copy
                  </button>
                  
                  <button
                    onClick={() => handleShare(link as any)}
                    className="gradient-button share-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                  >
                    Share
                  </button>

                  {session && (
                    <>
                      <button
                        onClick={() => handleEdit(link as any)}
                        className="gradient-button edit-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deleteLink.isPending}
                        className="gradient-button delete-gradient px-3 py-1 rounded text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {deleteLink.isPending ? 'Deleting...' : 'Delete'}
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
            <DialogPanel className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <DialogTitle className="text-xl font-semibold text-white mb-4">
                Edit Link
              </DialogTitle>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-url" className="block text-sm font-medium text-white mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    id="edit-url"
                    name="url"
                    value={editFormData.url}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
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
                    disabled={updateLink.isPending}
                    className="gradient-button flex-1 py-2 px-4 rounded-md text-white font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    {updateLink.isPending ? 'Updating...' : 'Update'}
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