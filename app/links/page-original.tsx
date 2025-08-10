'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Link as LinkType } from '@/db/schema';
import dynamic from 'next/dynamic';
import Image from 'next/image';

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

// Rozszerzamy typ LinkType o opcjonalny timestamp
type LinkWithTimestamp = LinkType & { _timestamp?: number };

export default function Links() {
  const { data: session, status } = useSession();
  const [links, setLinks] = useState<LinkWithTimestamp[]>([]);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkWithTimestamp | null>(null);
  const [editFormData, setEditFormData] = useState({
    url: '',
    title: '',
    description: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setLinks((prevLinks) => [...prevLinks, data]);
        setFormData({ url: '', title: '', description: '' });
        setToast({ type: 'success', message: 'Link added successfully' });
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setToast({ type: 'error', message: 'Musisz być zalogowany aby dodać link' });
        } else {
          setToast({ type: 'error', message: errorData.error || 'Failed to add link' });
        }
      }
    } catch (error) {
      console.error('Error adding link:', error);
      setToast({ type: 'error', message: 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (link: LinkWithTimestamp) => {
    setEditingLink(link);
    setEditFormData({
      url: link.url,
      title: link.title,
      description: link.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/links/${editingLink?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setLinks((prevLinks) =>
          prevLinks.map((link) => (link.id === data.data.id ? {
            ...data.data,
            _timestamp: Date.now()
          } : link))
        );
        setEditingLink(null);
        setEditFormData({ url: '', title: '', description: '' });
        setToast({ type: 'success', message: 'Link updated successfully' });
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setToast({ type: 'error', message: 'Musisz być zalogowany aby edytować link' });
        } else if (response.status === 403) {
          setToast({ type: 'error', message: 'Nie masz uprawnień do edycji tego linku' });
        } else {
          setToast({ type: 'error', message: errorData.error || 'Failed to update link' });
        }
      }
    } catch (error) {
      console.error('Error updating link:', error);
      setToast({ type: 'error', message: 'An error occurred' });
    } finally {
      setIsEditModalOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
        setToast({ type: 'success', message: 'Link deleted successfully' });
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setToast({ type: 'error', message: 'Musisz być zalogowany aby usunąć link' });
        } else if (response.status === 403) {
          setToast({ type: 'error', message: 'Nie masz uprawnień do usunięcia tego linku' });
        } else {
          setToast({ type: 'error', message: errorData.error || 'Failed to delete link' });
        }
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      setToast({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleCopy = async (link: LinkWithTimestamp) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setToast({ type: 'success', message: 'Link skopiowany do schowka!' });
    } catch (error) {
      console.error('Error copying link:', error);
      setToast({ type: 'error', message: 'Błąd podczas kopiowania linku' });
    }
  };

  const handleShare = async (link: LinkWithTimestamp) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: link.title,
          text: link.description || '',
          url: link.url,
        });
      } else {
        throw new Error('Web Share API nie jest wspierane');
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      setToast({ type: 'error', message: 'Błąd podczas udostępniania linku' });
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditFormData({ url: '', title: '', description: '' });
  };

  const filteredLinks = links.filter((link) =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/links');
        if (!response.ok) {
          throw new Error('Failed to fetch links');
        }
        const data = await response.json();
        setLinks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching links:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1216] text-gray-100 p-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1216] text-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1216] text-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-[#0f1216] text-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-8">Link Manager</h1>
          
          {session ? (
            <div className="mb-8 bg-[#1a1d24] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="URL"
                required
                className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                required
                className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Description"
                className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[100px]"
              />
              <button 
                type="submit"
                className="px-6 py-1.5 rounded-full bg-[#1a1d24] text-blue-400 border border-blue-400 hover:bg-blue-400 hover:text-black transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span className="ml-1 text-sm font-medium">{isSubmitting ? 'Dodawanie...' : 'Dodaj link'}</span>
              </button>
            </form>
          </div>
          ) : (
            <div className="mb-8 bg-[#1a1d24] p-4 rounded-lg border border-yellow-500">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">Logowanie wymagane</h2>
              <p className="text-gray-300 mb-4">
                Aby dodawać nowe linki, musisz się zalogować.
              </p>
              <a 
                href="/auth/signin" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Zaloguj się
              </a>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Links</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj linków..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 px-4 py-2 rounded-lg bg-black text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div 
                key={link.id} 
                className="bg-[#e43c3c] rounded-lg p-6 border border-[#3a4149] hover:border-[#4a5169] transition-colors"
              >
                <h3 className="text-black text-xl font-bold mb-3 leading-tight">{link.title}</h3>
                {link.thumbnailData && link.thumbnailMimeType ? (
                  <div className="relative aspect-[16/9] w-full mb-4 bg-[#262b36] rounded-lg overflow-hidden">
                    <Image
                      src={`/api/links/${link.id}/thumbnail?t=${link._timestamp || Date.now()}`}
                      alt={link.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  </div>
                ) : null}
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 break-all mb-3 block text-base"
                >
                  {link.url}
                </a>
                {link.description && (
                  <p className="text-gray-600 mb-4 text-base">{link.description}</p>
                )}
                <div className="flex gap-2 mt-4">
                  {session && session.user?.id === link.userId && (
                    <>
                      <button
                        onClick={() => handleEdit(link)}
                        className="px-6 py-1.5 rounded-full bg-[#1a1d24] text-green-400 border border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span className="ml-1 text-sm font-medium">EDIT</span>
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="px-6 py-1.5 rounded-full bg-[#1a1d24] text-red-400 border border-red-400 hover:bg-red-400 hover:text-black transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span className="ml-1 text-sm font-medium">DELETE</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleCopy(link)}
                    className="px-6 py-1.5 rounded-full bg-[#1a1d24] text-blue-400 border border-blue-400 hover:bg-blue-400 hover:text-black transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span className="ml-1 text-sm font-medium">COPY</span>
                  </button>
                  <button
                    onClick={() => handleShare(link)}
                    className="px-6 py-1.5 rounded-full bg-[#1a1d24] text-orange-400 border border-orange-400 hover:bg-orange-400 hover:text-black transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    <span className="ml-1 text-sm font-medium">SHARE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <DialogRoot
            open={isEditModalOpen}
            onClose={handleCloseModal}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-2xl bg-[#1a1d24] rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-xl font-semibold text-gray-100">
                    Edit Link
                  </DialogTitle>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {editingLink && (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <input
                      type="url"
                      name="url"
                      value={editFormData.url}
                      onChange={handleEditChange}
                      placeholder="URL"
                      required
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      placeholder="Title"
                      required
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <textarea
                      name="description"
                      value={editFormData.description || ''}
                      onChange={handleEditChange}
                      placeholder="Description"
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1d24] text-gray-100 border border-[#3a4149] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[100px]"
                    />
                    <button 
                      type="submit"
                      className="gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-blue-400"
                      disabled={isSubmitting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span className="ml-1">{isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
                    </button>
                  </form>
                )}
              </DialogPanel>
            </div>
          </DialogRoot>

          {toast && (
            <div 
              className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-gray-200 transition-opacity duration-300 ease-in-out`}
              role="alert"
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
} 