import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface ImageViewerProps {
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  prompt?: string;
}

export default function ImageViewer({ imageUrl, thumbnailUrl, title, prompt }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full relative group"
      >
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover rounded-lg transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-lg">
          <span>Kliknij, aby powiększyć</span>
        </div>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-2xl font-bold">
                {title}
              </Dialog.Title>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Zamknij</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative aspect-video w-full mb-4">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>

            {prompt && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Prompt:</h3>
                <p className="whitespace-pre-wrap">{prompt}</p>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 