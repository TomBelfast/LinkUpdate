'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkType } from '@/db/schema';
import dynamic from 'next/dynamic';
import { EditIcon, DeleteIcon, CopyIcon, ShareIcon, buttonStyles } from '@/components/Icons';
import { commonStyles } from '@/styles/common';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';

const PromptForm = dynamic(() => import('@/components/PromptForm'), {
  loading: () => <div className="animate-pulse bg-gray-700 h-32 rounded-lg"></div>,
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
        console.error('Błąd odpowiedzi:', errorData);
        throw new Error(`Nie udało się pobrać promptów: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('Pobrane prompty:', data.map((p: LinkType) => ({
        ...p,
        imageData: p.imageData ? `[${p.imageData.length} bajtów]` : null,
        thumbnailData: p.thumbnailData ? `[${p.thumbnailData.length} bajtów]` : null
      })));
      setPrompts(data);
    } catch (error) {
      console.error('Błąd podczas pobierania promptów:', error);
      setPrompts([]);
    }
  };

  const handleSubmit = async (data: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => {
    try {
      const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';
      
      console.log('=== Rozpoczęcie wysyłania żądania ===');
      console.log('Konfiguracja żądania:', {
        url,
        method,
        editingPromptId: editingPrompt?.id,
        isEdit: !!editingPrompt
      });
      
      console.log('Dane do wysłania:', {
        ...data,
        imageData: data.imageData ? `[${data.imageData.length} bajtów]` : null,
        thumbnailData: data.thumbnailData ? `[${data.thumbnailData.length} bajtów]` : null,
        imageMimeType: data.imageMimeType,
        thumbnailMimeType: data.thumbnailMimeType
      });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Otrzymano odpowiedź:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseData = await response.json();
      console.log('Odpowiedź JSON:', responseData);

      if (!response.ok) {
        console.error('Odpowiedź nie jest OK:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData.error
        });
        throw new Error(responseData.error || `Błąd serwera: ${response.status}`);
      }

      console.log('Odświeżanie listy promptów po udanej operacji');
      await fetchPrompts();
      
      setToast({
        message: 'Prompt został pomyślnie zapisany!',
        type: 'success'
      });
      
      console.log('Czyszczenie stanu edycji');
      setEditingPrompt(null);
      setIsEditModalOpen(false);

    } catch (error) {
      console.error('=== Błąd podczas zapisywania promptu ===');
      console.error('Szczegóły błędu:', {
        error,
        message: error instanceof Error ? error.message : 'Nieznany błąd',
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error('Stan komponentu w momencie błędu:', {
        isEditModalOpen,
        editingPromptId: editingPrompt?.id,
        hasToast: !!toast
      });
      
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
    console.error(`Błąd ładowania obrazu dla promptu ${promptId}`);
    setImageErrors(prev => ({ ...prev, [promptId]: true }));
  };

  return (
    <div className={`${commonStyles.container} text-gray-100 max-w-[1600px]`}>
      <h1 className={`${commonStyles.pageTitle} text-orange-500`}>Baza Promptów</h1>
      
      <div className={`${commonStyles.section} bg-[#1a1d24] rounded-lg p-6 shadow-lg`}>
        <h2 className={commonStyles.secondaryTitle}>
          Dodaj Nowy Prompt
        </h2>
        <PromptForm onSubmit={handleSubmit} />
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {prompts.map((prompt) => (
          <div key={prompt.id} className={`${commonStyles.card} flex flex-col h-full bg-[#1a1d24] shadow-lg hover:shadow-xl transition-shadow p-5`}>
            {prompt.thumbnailData && prompt.thumbnailMimeType && !imageErrors[prompt.id] ? (
              <div className="relative aspect-[16/9] w-full mb-5 bg-[#262b36] rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`/api/media/${prompt.id}/thumbnail`}
                    alt={prompt.title}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    onError={() => handleImageError(prompt.id)}
                    unoptimized
                  />
                </div>
              </div>
            ) : prompt.imageData && prompt.imageMimeType && !imageErrors[prompt.id] ? (
              <div className="relative aspect-[16/9] w-full mb-5 bg-[#262b36] rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`/api/media/${prompt.id}`}
                    alt={prompt.title}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    onError={() => handleImageError(prompt.id)}
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full mb-5 bg-[#262b36] rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Brak obrazu</span>
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-3 line-clamp-1">{prompt.title}</h3>
            {prompt.description && (
              <p className="text-gray-300 mb-4 line-clamp-2 text-base">{prompt.description}</p>
            )}
            {prompt.prompt && (
              <div className="bg-[#262b36] p-4 rounded-lg mb-5 overflow-auto max-h-[120px]">
                <pre className="whitespace-pre-wrap text-base line-clamp-3">{prompt.prompt}</pre>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button 
                onClick={() => handleEdit(prompt)} 
                className={`${buttonStyles.edit} text-sm py-2`}
              >
                <EditIcon className="w-4 h-4" />
                <span>Edytuj</span>
              </button>
              <button 
                onClick={() => handleDelete(prompt.id)} 
                className={`${buttonStyles.delete} text-sm py-2`}
              >
                <DeleteIcon className="w-4 h-4" />
                <span>Usuń</span>
              </button>
              <button 
                onClick={() => handleCopy(prompt)} 
                className={`${buttonStyles.copy} text-sm py-2`}
              >
                <CopyIcon className="w-4 h-4" />
                <span>Kopiuj</span>
              </button>
              <button 
                onClick={() => handleShare(prompt)} 
                className={`${buttonStyles.share} text-sm py-2`}
              >
                <ShareIcon className="w-4 h-4" />
                <span>Udostępnij</span>
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
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-[#1a1d24] rounded-xl shadow-xl p-6 border border-[#3a4149]">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-2xl font-bold text-gray-100">
                Edytuj Prompt
              </Dialog.Title>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-200 transition-colors"
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
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white transition-opacity duration-300 ease-in-out`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
} 