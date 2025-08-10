'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
  currentImageUrl: string | null;
}

export default function ImageDropzone({ onImageUpload, currentImageUrl }: ImageDropzoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);

  useEffect(() => {
    console.log('ImageDropzone currentImageUrl changed:', currentImageUrl);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div 
      {...getRootProps()} 
      className="border-2 border-dashed border-[#262b36] rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-gray-500 bg-[#1a1d24]"
    >
      <input {...getInputProps()} />
      
      {previewUrl ? (
        <div className="relative aspect-[16/9] w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-[#262b36] rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Podgląd zdjęcia"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/70 text-white rounded-lg">
              <p className="text-center">
                Kliknij lub upuść nowe zdjęcie, aby zmienić
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-300">
          {isDragActive ? (
            <p className="text-lg">Upuść zdjęcie tutaj...</p>
          ) : (
            <>
              <p className="text-lg mb-2">Kliknij lub upuść zdjęcie tutaj</p>
              <p className="text-sm text-gray-400">
                Obsługiwane formaty: PNG, JPG, GIF
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
