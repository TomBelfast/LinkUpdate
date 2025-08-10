'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkType } from '@/db/schema';
import { commonStyles } from '@/styles/common';
import { toast } from 'react-hot-toast';
import IdeaForm from '@/components/IdeaForm';
import { v4 as uuidv4 } from 'uuid';

// Dynamiczne importowanie komponentów
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
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allLinks, setAllLinks] = useState<LinkType[]>([]);
  const [shouldError, setShouldError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      console.log('Rozpoczynam pobieranie pomysłów...');
      const response = await fetch('/api/ideas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Pobrane dane z API:', data);
      
      // Konwertuj daty z powrotem na obiekty Date
      const ideasWithDates = data.map((idea: any) => ({
        ...idea,
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt)
      }));
      console.log('Przetworzone pomysły z datami:', ideasWithDates);
      
      setIdeas(ideasWithDates);
    } catch (error) {
      console.error('Błąd podczas pobierania pomysłów:', error);
      toast.error('Nie udało się pobrać pomysłów');
    }
  };

  useEffect(() => {
    if (shouldError) {
      throw new Error('Test błędu aplikacji');
    }
  }, [shouldError]);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    // Sprawdź czy komponent jest zamontowany po stronie klienta
    if (!mounted) return;
    
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
  }, [mounted, links]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Pobieranie linków...');
      const response = await fetch('/api/links');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Pobrane dane z API:', data);
      
      const filteredLinks = data.filter((link: LinkType) => {
        console.log('Sprawdzanie linku:', {
          id: link.id,
          title: link.title,
          url: link.url,
          prompt: link.prompt,
        });
        
        return !link.prompt;
      });
      
      const sortedLinks = [...filteredLinks].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log('Przefiltrowane i posortowane linki:', sortedLinks);
      setAllLinks(sortedLinks);
      setLinks(sortedLinks);
    } catch (error) {
      console.error('Błąd podczas pobierania linków:', error);
      setError(error instanceof Error ? error.message : 'Nie udało się pobrać linków');
      setLinks([]);
      setAllLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setLinks(allLinks);
    } else {
      const filtered = allLinks.filter(link => 
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setLinks(filtered);
    }
  }, [searchTerm, allLinks]);

  const handleSubmit = async (data: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links';
      const method = editingLink ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          const existingLink = errorData.existingLink;
          toast.error(
            <div>
              <p>Link already exists in database!</p>
              <p>Title: {existingLink.title}</p>
              <p>URL: {existingLink.url}</p>
            </div>
          );
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchLinks();
      setEditingLink(null);
      
      if (method === 'POST') {
        const form = document.querySelector('form');
        if (form) {
          form.reset();
        }
      }
      
      toast.success(editingLink ? 'Link has been updated!' : 'Link has been added!');
    } catch (error) {
      console.error('Error while adding/editing link:', error);
      toast.error('An error occurred while saving the link');
    }
  };

  const handleEdit = (link: LinkType) => {
    setEditingLink(link);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchLinks();
    } catch (error) {
      console.error('Błąd podczas usuwania linku:', error);
    }
  };

  const handleCopy = (link: LinkType) => {
    navigator.clipboard.writeText(link.url);
    alert('Link copied to clipboard!');
  };

  const handleShare = (link: LinkType) => {
    if (navigator.share) {
      navigator.share({
        title: link.title,
        text: link.description ?? 'No description available',
        url: link.url,
      });
    } else {
      alert('Sharing is not supported in this browser');
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
      console.log('Wysyłanie nowego pomysłu:', newIdea);
      
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIdea),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Błąd odpowiedzi:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Odpowiedź z serwera:', responseData);

      await fetchIdeas();
      toast.success('Pomysł został dodany!');
    } catch (error) {
      console.error('Błąd podczas dodawania pomysłu:', error);
      toast.error('Nie udało się dodać pomysłu');
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchIdeas();
      toast.success('Idea deleted!');
    } catch (error) {
      console.error('Error while deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    try {
      const ideaToUpdate = ideas.find(idea => idea.id === id);
      if (!ideaToUpdate) return;

      const response = await fetch(`/api/ideas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ideaToUpdate,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchIdeas();
      toast.success('Status pomysłu został zaktualizowany!');
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error);
      toast.error('Nie udało się zaktualizować statusu');
    }
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    const formElement = document.querySelector('#ideaForm');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIdeaSubmit = async (data: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'rejected' }) => {
    try {
      const url = editingIdea ? `/api/ideas/${editingIdea.id}` : '/api/ideas';
      const method = editingIdea ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchIdeas();
      setEditingIdea(null);
      toast.success(editingIdea ? 'Idea updated!' : 'Idea added!');
    } catch (error) {
      console.error('Error while saving idea:', error);
      toast.error('Failed to save idea');
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-700 rounded mb-8"></div>
          <div className="h-12 bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-white"
        />
      </div>

      {/* Links list */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Links</h2>
        {isLoading ? (
          <div>Loading links...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Suspense fallback={<div>Loading list...</div>}>
            <LinkList
              links={links}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onShare={() => {}}
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
            <div key={idea.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{idea.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditIdea(idea)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mb-2">{idea.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className={`px-2 py-1 rounded ${
                  idea.status === 'completed' ? 'bg-green-900 text-green-200' :
                  idea.status === 'in_progress' ? 'bg-blue-900 text-blue-200' :
                  idea.status === 'rejected' ? 'bg-red-900 text-red-200' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {idea.status === 'completed' ? 'Completed' :
                   idea.status === 'in_progress' ? 'In Progress' :
                   idea.status === 'rejected' ? 'Rejected' :
                   'Pending'}
                </span>
                <span>
                  Created: {new Date(idea.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 