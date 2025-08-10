'use client';

import React, { useState, useEffect } from 'react';
import { commonStyles } from '@/styles/common';
import { Link } from '@/db/schema';
import ImageDropzone from './ImageDropzone';

interface FormData {
  title: string;
  description: string | null;
  prompt: string | null;
  imageData: string | null;
  imageMimeType: string | null;
  thumbnailData: string | null;
  thumbnailMimeType: string | null;
}

interface PromptFormProps {
  onSubmit: (data: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => Promise<void>;
  initialData?: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'url'>;
  currentImageUrl?: string | null;
}

export default function PromptForm({ onSubmit, initialData, currentImageUrl = null }: PromptFormProps) {
  const [formData, setFormData] = useState<FormData>(() => 
    initialData ? {
      title: initialData.title,
      description: initialData.description,
      prompt: initialData.prompt,
      imageData: initialData.imageData,
      imageMimeType: initialData.imageMimeType,
      thumbnailData: initialData.thumbnailData,
      thumbnailMimeType: initialData.thumbnailMimeType
    } : {
      title: '',
      description: null,
      prompt: null,
      imageData: null,
      imageMimeType: null,
      thumbnailData: null,
      thumbnailMimeType: null
    }
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('currentImageUrl changed:', currentImageUrl);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  useEffect(() => {
    if (initialData) {
      console.log('Ustawianie danych początkowych:', {
        title: initialData.title,
        hasImage: !!initialData.imageData,
        description: initialData.description,
        prompt: initialData.prompt,
        currentImageUrl
      });
      setFormData({
        title: initialData.title,
        description: initialData.description,
        prompt: initialData.prompt,
        imageData: initialData.imageData,
        imageMimeType: initialData.imageMimeType,
        thumbnailData: initialData.thumbnailData,
        thumbnailMimeType: initialData.thumbnailMimeType
      });
      
      if (initialData.imageData && initialData.imageMimeType) {
        setPreviewUrl(`data:${initialData.imageMimeType};base64,${initialData.imageData}`);
      }
    }
  }, [initialData, currentImageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Rozpoczęcie procesu zapisu formularza ===');
    if (isSubmitting) {
      console.log('Formularz jest już w trakcie wysyłania - przerywam');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Dane formularza przed wysłaniem:', {
        ...formData,
        imageData: formData.imageData ? `[${formData.imageData.length} bajtów]` : null,
        thumbnailData: formData.thumbnailData ? `[${formData.thumbnailData.length} bajtów]` : null
      });
      
      await onSubmit(formData);
      console.log('Pomyślnie wykonano onSubmit');
      
      if (!initialData) {
        console.log('Czyszczenie formularza po dodaniu nowego promptu');
        setFormData({
          title: '',
          description: null,
          prompt: null,
          imageData: null,
          imageMimeType: null,
          thumbnailData: null,
          thumbnailMimeType: null
        });
        setPreviewUrl(null);
      } else {
        console.log('Zachowanie danych formularza w trybie edycji');
      }
      
      setUploadMessage('Prompt został pomyślnie zapisany!');
      
    } catch (error) {
      console.error('=== Błąd podczas przesyłania formularza ===');
      console.error('Szczegóły błędu:', error);
      console.error('Stan formularza w momencie błędu:', {
        isSubmitting,
        hasInitialData: !!initialData,
        formDataState: {
          ...formData,
          imageData: formData.imageData ? '[obecne]' : '[brak]',
          thumbnailData: formData.thumbnailData ? '[obecne]' : '[brak]'
        }
      });
      setUploadMessage(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
      throw error;
    } finally {
      console.log('=== Zakończenie procesu zapisu formularza ===');
      setIsSubmitting(false);
      setTimeout(() => {
        setUploadMessage(null);
      }, 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File) => {
    if (isSubmitting) return;

    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      console.log('Rozpoczęcie uploadu pliku:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formDataWithImage = new FormData();
      formDataWithImage.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataWithImage,
      });
      
      if (!uploadResponse.ok) {
        URL.revokeObjectURL(objectUrl);
        const errorData = await uploadResponse.json();
        console.error('Błąd odpowiedzi z /api/upload:', errorData);
        throw new Error(errorData.error || 'Błąd podczas przesyłania zdjęcia');
      }

      const uploadData = await uploadResponse.json();
      console.log('Otrzymano odpowiedź z /api/upload:', {
        imageMimeType: uploadData.imageMimeType,
        imageDataLength: uploadData.imageData?.length,
        thumbnailDataLength: uploadData.thumbnailData?.length
      });

      setFormData(prev => ({
        ...prev,
        imageData: uploadData.imageData,
        imageMimeType: uploadData.imageMimeType,
        thumbnailData: uploadData.thumbnailData,
        thumbnailMimeType: uploadData.thumbnailMimeType
      }));

      setUploadMessage(`Plik ${file.name} został pomyślnie przesłany`);
      
    } catch (error: unknown) {
      console.error('Błąd podczas uploadu:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      setUploadMessage(`Błąd: ${errorMessage}`);
      throw error;
    } finally {
      setTimeout(() => {
        setUploadMessage(null);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageDropzone 
        onImageUpload={handleImageUpload}
        currentImageUrl={currentImageUrl}
      />
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Tytuł promptu"
        className={commonStyles.input}
        required
      />
      <textarea
        name="prompt"
        value={formData.prompt || ''}
        onChange={handleChange}
        placeholder="Treść promptu"
        className={`${commonStyles.textarea} min-h-[300px]`}
        style={{ height: 'auto', minHeight: '300px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
        required
      />
      <textarea
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        placeholder="Opis (opcjonalnie)"
        className={commonStyles.textarea}
      />
      <button 
        type="submit" 
        className={`gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-blue-400 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isSubmitting}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        <span className="ml-1">{isSubmitting ? 'Zapisywanie...' : (initialData ? 'Zaktualizuj prompt' : 'Dodaj prompt')}</span>
      </button>
      
      {uploadMessage && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            uploadMessage.includes('Błąd') ? 'bg-red-500' : 'bg-green-500'
          } text-white animate-fade-in-out`}
          style={{
            animation: 'fadeInOut 5s ease-in-out'
          }}
        >
          {uploadMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </form>
  );
} 