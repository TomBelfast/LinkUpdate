'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkType } from '@/db/schema';
import { commonStyles } from '@/styles/common';
import IdeaForm from '@/components/IdeaForm';
import { v4 as uuidv4 } from 'uuid';

// Modern state management
import { useAppStore } from '@/lib/store/app-store';
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '@/lib/query/use-links';
import { useIdeas, useCreateIdea, useUpdateIdea, useDeleteIdea } from '@/lib/query/use-ideas';
import { useToasts, useError } from '@/lib/store/app-store';

// Dynamiczne importowanie komponentów (zachowujemy dla lazy loading)
const LinkForm = dynamic(() => import('@/components/LinkForm'), {
  loading: () => (
    <div className="animate-pulse bg-gray-700 h-32 rounded-lg p-4">
      <div className="h-8 bg-gray-600 rounded w-1/4 mb-4"></div>
      <div className="h-12 bg-gray-600 rounded mb-4"></div>
      <div className="h-12 bg-gray-600 rounded"></div>
    </div>
  )
});

const LinkList = dynamic(() => import('@/components/LinkList'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-700 h-24 rounded-lg p-4">
          <div className="h-6 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
});

interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  // Zustand store state (replaces 8 useState hooks)
  const editingLink = useAppStore((state) => state.editingLink);
  const setEditingLink = useAppStore((state) => state.setEditingLink);
  const editingIdea = useAppStore((state) => state.editingIdea);
  const setEditingIdea = useAppStore((state) => state.setEditingIdea);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  
  // Toast notifications (replaces manual toast.success/error)
  const { addToast } = useToasts();
  
  // Error handling (centralized)
  const { error, setError } = useError();
  
  // TanStack Query hooks (replaces manual fetch + useEffect)
  const { 
    data: links = [], 
    isLoading: linksLoading, 
    error: linksError 
  } = useLinks({ search: searchQuery });
  
  const { 
    data: ideas = [], 
    isLoading: ideasLoading, 
    error: ideasError 
  } = useIdeas();
  
  // Mutations (replaces manual fetch in handlers)
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  // URL parameter handling for editing (only remaining useEffect)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    
    if (editId && links.length > 0) {
      const linkToEdit = links.find(link => link.id === parseInt(editId));
      if (linkToEdit) {
        console.log('Znaleziono link do edycji:', linkToEdit);
        setEditingLink(linkToEdit);
        const formElement = document.querySelector('#linkForm');
        formElement?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [links, setEditingLink]);

  // Error boundary - redirect errors to centralized error handling
  React.useEffect(() => {
    if (linksError) {
      setError(linksError.message);
      addToast('Nie udało się pobrać linków', 'error');
    }
    if (ideasError) {
      setError(ideasError.message);
      addToast('Nie udało się pobrać pomysłów', 'error');
    }
  }, [linksError, ideasError, setError, addToast]);

  // Handlers (simplified with mutations)
  const handleSubmit = async (data: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingLink) {
        await updateLink.mutateAsync({ ...data, id: editingLink.id } as any);
        setEditingLink(null);
      } else {
        await createLink.mutateAsync(data as any);
        // Clear form
        const form = document.querySelector('form');
        if (form) {
          form.reset();
        }
      }
    } catch (error) {
      console.error('Error while adding/editing link:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleEdit = (link: LinkType) => {
    setEditingLink(link as any);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLink.mutateAsync(id);
    } catch (error) {
      console.error('Błąd podczas usuwania linku:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleCopy = (link: LinkType) => {
    navigator.clipboard.writeText(link.url);
    addToast('Link copied to clipboard!', 'success');
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

  const handleAddIdea = async (data: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'rejected' }) => {
    try {
      const newIdea = {
        id: uuidv4(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createIdea.mutateAsync(newIdea as any);
    } catch (error) {
      console.error('Błąd podczas dodawania pomysłu:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      await deleteIdea.mutateAsync(parseInt(id));
    } catch (error) {
      console.error('Error while deleting idea:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    try {
      const ideaToUpdate = ideas.find(idea => idea.id === parseInt(id));
      if (!ideaToUpdate) return;

      await updateIdea.mutateAsync({
        id: parseInt(id),
        status: newStatus,
      } as any);
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error);
      // Error handling is automatic through mutations
    }
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea as any);
    const formElement = document.querySelector('#ideaForm');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIdeaSubmit = async (data: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'rejected' }) => {
    try {
      if (editingIdea) {
        await updateIdea.mutateAsync({
          id: editingIdea.id,
          ...data,
        } as any);
        setEditingIdea(null);
      } else {
        await createIdea.mutateAsync(data as any);
      }
    } catch (error) {
      console.error('Error while saving idea:', error);
      // Error handling is automatic through mutations
    }
  };

  // Loading states
  const isLoading = linksLoading || ideasLoading;
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-500 text-white p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Link Manager</h1>
      
      {/* Link form section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Link</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <LinkForm
            onSubmit={handleSubmit}
            initialData={(editingLink ? {
              url: (editingLink as any).url,
              title: (editingLink as any).title,
              description: (editingLink as any).description,
              prompt: (editingLink as any).prompt,
              imageData: (editingLink as any).imageData,
              imageMimeType: (editingLink as any).imageMimeType,
              thumbnailData: (editingLink as any).thumbnailData,
              thumbnailMimeType: (editingLink as any).thumbnailMimeType
            } : undefined) as any}
          />
        </Suspense>
      </div>

      {/* Search section */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-white"
        />
      </div>

      {/* Links list */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Links</h2>
        {isLoading ? (
          <div>Loading links...</div>
        ) : linksError ? (
          <div className="text-red-500">{linksError.message}</div>
        ) : (
          <Suspense fallback={<div>Loading list...</div>}>
            <LinkList
              links={links as any}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onShare={handleShare}
            />
          </Suspense>
        )}
      </div>

      {/* Ideas section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Ideas</h2>
        <div className="mb-8">
          <IdeaForm
            onSubmit={handleIdeaSubmit}
            initialData={(editingIdea ? {
              title: editingIdea.title,
              description: editingIdea.description,
              status: editingIdea.status
            } : undefined) as any}
            onCancel={() => setEditingIdea(null)}
          />
        </div>
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{idea.title}</h3>
                <div className="flex gap-2">
                  {/* ZACHOWUJEMY wszystkie oryginalne gradienty! */}
                  <button
                    onClick={() => handleEditIdea(idea as any)}
                    className="gradient-button edit-gradient px-3 py-1 text-white rounded hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIdea(idea.id.toString())}
                    className="gradient-button delete-gradient px-3 py-1 text-white rounded hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mb-2">{idea.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className={`px-2 py-1 rounded ${
                  (idea.status as any) === 'completed' ? 'bg-green-900 text-green-200' :
                  (idea.status as any) === 'in_progress' ? 'bg-blue-900 text-blue-200' :
                  (idea.status as any) === 'rejected' ? 'bg-red-900 text-red-200' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {(idea.status as any) === 'completed' ? 'Completed' :
                   (idea.status as any) === 'in_progress' ? 'In Progress' :
                   (idea.status as any) === 'rejected' ? 'Rejected' :
                   'Pending'}
                </span>
                <span>
                  Created: {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('en-US') : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}