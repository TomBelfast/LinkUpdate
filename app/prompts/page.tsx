'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkType } from '@/db/schema';
import dynamic from 'next/dynamic';
import { EditIcon, DeleteIcon, CopyIcon, ShareIcon } from '@/components/Icons';
import { commonStyles, buttonStyles } from '@/styles/common';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';

const PromptForm = dynamic(() => import('@/components/PromptForm'), {
  loading: () => <div className="animate-pulse bg-muted h-32 rounded-2xl"></div>,
  ssr: false
});

export default function Prompts() {
  const [prompts, setPrompts] = useState<LinkType[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<LinkType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Nie udało się pobrać promptów: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Błąd podczas pobierania promptów:', error);
      setPrompts([]);
    }
  };

  const handleSubmit = async (data: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt' | 'url' | 'userId'>) => {
    try {
      const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Błąd serwera: ${response.status}`);
      }

      await fetchPrompts();

      setToast({
        message: 'Prompt został pomyślnie zapisany!',
        type: 'success'
      });

      setEditingPrompt(null);
      setIsEditModalOpen(false);

    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Wystąpił nieznany błąd',
        type: 'error'
      });
    }
  };

  const handleEdit = (prompt: LinkType) => {
    setEditingPrompt(prompt);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingPrompt(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten prompt?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Błąd HTTP! status: ${response.status}`);
      }
      await fetchPrompts();
      setToast({
        message: 'Prompt został usunięty!',
        type: 'success'
      });
    } catch (error) {
      console.error('Błąd podczas usuwania promptu:', error);
      setToast({
        message: 'Wystąpił błąd podczas usuwania promptu',
        type: 'error'
      });
    }
  };

  const handleCopy = (prompt: LinkType) => {
    navigator.clipboard.writeText(prompt.prompt || '');
    setToast({
      message: 'Prompt skopiowany do schowka!',
      type: 'success'
    });
  };

  const handleShare = (prompt: LinkType) => {
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: prompt.prompt || '',
        url: window.location.href,
      }).catch(error => {
        console.error('Błąd podczas udostępniania:', error);
      });
    } else {
      setToast({
        message: 'Udostępnianie nie jest obsługiwane w tej przeglądarce',
        type: 'error'
      });
    }
  };

  const handleImageError = (promptId: number) => {
    setImageErrors(prev => ({ ...prev, [promptId]: true }));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px]">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">Baza Promptów</h1>

      <div className="mb-10 bg-card rounded-2xl p-6 shadow-lg border border-border">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Dodaj Nowy Prompt</h2>
        <PromptForm onSubmit={handleSubmit} />
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="group bg-card text-foreground rounded-2xl shadow-sm border border-border transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full overflow-hidden p-5">
            {prompt.thumbnailData && prompt.thumbnailMimeType && !imageErrors[prompt.id] ? (
              <div className="relative aspect-[16/9] w-full mb-5 bg-muted rounded-xl overflow-hidden shadow-inner">
                <Image
                  src={`/api/media/${prompt.id}/thumbnail`}
                  alt={prompt.title}
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => handleImageError(prompt.id)}
                  unoptimized
                />
              </div>
            ) : prompt.imageData && prompt.imageMimeType && !imageErrors[prompt.id] ? (
              <div className="relative aspect-[16/9] w-full mb-5 bg-muted rounded-xl overflow-hidden shadow-inner">
                <Image
                  src={`/api/media/${prompt.id}`}
                  alt={prompt.title}
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => handleImageError(prompt.id)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full mb-5 bg-muted rounded-xl flex items-center justify-center border border-dashed border-border">
                <span className="text-muted-foreground font-medium">Brak obrazu</span>
              </div>
            )}

            <h3 className="text-lg font-bold mb-2 line-clamp-1">{prompt.title}</h3>
            {prompt.description && (
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">{prompt.description}</p>
            )}
            {prompt.prompt && (
              <div className="bg-muted/50 p-4 rounded-xl mb-5 overflow-auto max-h-[120px] scrollbar-thin">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{prompt.prompt}</pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button
                onClick={() => handleEdit(prompt)}
                className="gradient-button edit-gradient text-xs py-2"
              >
                <EditIcon className="w-4 h-4" />
                <span>Edytuj</span>
              </button>
              <button
                onClick={() => handleDelete(prompt.id)}
                className="gradient-button delete-gradient text-xs py-2"
              >
                <DeleteIcon className="w-4 h-4" />
                <span>Usuń</span>
              </button>
              <button
                onClick={() => handleCopy(prompt)}
                className="gradient-button copy-gradient text-xs py-2"
              >
                <CopyIcon className="w-4 h-4" />
                <span>Kopiuj</span>
              </button>
              <button
                onClick={() => handleShare(prompt)}
                className="gradient-button share-gradient text-xs py-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-2xl font-bold tracking-tight">
                Edytuj Prompt
              </Dialog.Title>
              <button
                onClick={handleCloseModal}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
              >
                <span className="sr-only">Zamknij</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editingPrompt && (
              <PromptForm
                onSubmit={handleSubmit}
                initialData={{
                  title: editingPrompt.title,
                  description: editingPrompt.description,
                  prompt: editingPrompt.prompt,
                  imageData: editingPrompt.imageData,
                  imageMimeType: editingPrompt.imageMimeType,
                  thumbnailData: editingPrompt.thumbnailData,
                  thumbnailMimeType: editingPrompt.thumbnailMimeType
                }}
                currentImageUrl={
                  editingPrompt.thumbnailData && editingPrompt.thumbnailMimeType
                    ? `/api/media/${editingPrompt.id}/thumbnail`
                    : editingPrompt.imageData && editingPrompt.imageMimeType
                      ? `/api/media/${editingPrompt.id}`
                      : null
                }
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
            } text-white font-medium`}
          role="alert"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? '✅' : '❌'}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
} 