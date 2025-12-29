'use client';

import React, { Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkType, Idea as IdeaType } from '@/db/schema';
import IdeaForm from '@/components/IdeaForm';
import IdeaCard from '@/components/IdeaCard';
import { v4 as uuidv4 } from 'uuid';

// Modern state management
import { useAppStore } from '@/lib/store/app-store';
import { useLinksSearch, useCreateLink, useUpdateLink, useDeleteLink } from '@/lib/query/use-links';
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
  // useLinksSearch z 300ms debounce dla optymalizacji
  const {
    data: links = [],
    isLoading: linksLoading,
    error: linksError
  } = useLinksSearch(searchQuery, 300);

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

  // Handlers z useCallback dla optymalizacji re-renderów
  const handleSubmit = useCallback(async (data: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      if (editingLink) {
        const { createdAt, updatedAt, userId, ...updateData } = data as any;
        await updateLink.mutateAsync({ ...updateData, id: editingLink.id });
        setEditingLink(null);
      } else {
        await createLink.mutateAsync(data);
        const form = document.querySelector('form');
        if (form) {
          form.reset();
        }
      }
    } catch (error) {
      // Error handling is automatic through mutations
    }
  }, [editingLink, updateLink, createLink, setEditingLink]);

  const handleEdit = useCallback((link: LinkType) => {
    setEditingLink(link);
  }, [setEditingLink]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }
    try {
      await deleteLink.mutateAsync(id);
    } catch (error) {
      // Error handling is automatic through mutations
    }
  }, [deleteLink]);

  const handleCopy = useCallback((link: LinkType) => {
    navigator.clipboard.writeText(link.url);
    addToast('Link copied to clipboard!', 'success');
  }, [addToast]);

  const handleShare = useCallback((link: LinkType) => {
    if (navigator.share) {
      navigator.share({
        title: link.title,
        text: link.description ?? 'No description available',
        url: link.url,
      });
    } else {
      addToast('Sharing is not supported in this browser', 'warning');
    }
  }, [addToast]);

  const handleDeleteIdea = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }
    try {
      await deleteIdea.mutateAsync(id);
    } catch (error) {
      // Error handling is automatic through mutations
    }
  }, [deleteIdea]);

  const handleEditIdea = useCallback((idea: IdeaType) => {
    setEditingIdea(idea);
    const formElement = document.querySelector('#ideaForm');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  }, [setEditingIdea]);

  const handleIdeaSubmit = useCallback(async (data: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'rejected' }) => {
    try {
      if (editingIdea) {
        await updateIdea.mutateAsync({
          id: editingIdea.id,
          ...data,
        });
        setEditingIdea(null);
      } else {
        await createIdea.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is automatic through mutations
    }
  }, [editingIdea, updateIdea, createIdea, setEditingIdea]);

  // Loading states
  const isLoading = linksLoading || ideasLoading;

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-red-500 text-white p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 tracking-tight">Link Manager</h1>

      {/* Link form section */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Link</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <LinkForm
            onSubmit={handleSubmit}
            initialData={editingLink ? {
              url: editingLink.url,
              title: editingLink.title,
              description: editingLink.description,
              prompt: editingLink.prompt,
              imageData: editingLink.imageData,
              imageMimeType: editingLink.imageMimeType,
              thumbnailData: editingLink.thumbnailData,
              thumbnailMimeType: editingLink.thumbnailMimeType
            } : undefined}
          />
        </Suspense>
      </div>

      {/* Search section */}
      <div className="mb-8 sm:mb-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3.5 rounded-xl border-2 border-transparent bg-card text-foreground shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none sm:text-lg"
          />
        </div>
      </div>

      {/* Links list */}
      <div className="mb-10 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Links</h2>
        {isLoading ? (
          <div>Loading links...</div>
        ) : linksError ? (
          <div className="text-red-500">{linksError.message}</div>
        ) : (
          <Suspense fallback={<div>Loading list...</div>}>
            <LinkList
              links={links}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onShare={handleShare}
            />
          </Suspense>
        )}
      </div>

      {/* Ideas section */}
      <div className="mb-10 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Ideas</h2>
        <div className="mb-6 sm:mb-8">
          <IdeaForm
            onSubmit={handleIdeaSubmit}
            initialData={editingIdea ? {
              title: editingIdea.title,
              description: editingIdea.description,
              status: editingIdea.status
            } : undefined}
            onCancel={() => setEditingIdea(null)}
          />
        </div>
        <div className="space-y-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={handleEditIdea}
              onDelete={handleDeleteIdea}
            />
          ))}
        </div>
      </div>
    </div>
  );
}