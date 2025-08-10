import React from 'react';
import Image from 'next/image';
import { Link } from '@/db/schema';
import { EditIcon, DeleteIcon, CopyIcon, ShareIcon } from '@/components/Icons';

interface VideoCardProps {
  link: Link;
  videoId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onShare: () => void;
}

export default function VideoCard({ link, videoId, onEdit, onDelete, onCopy, onShare }: VideoCardProps) {
  if (!videoId) return null;

  // Funkcja otwierająca film na YouTube po kliknięciu w miniaturkę
  const handleThumbnailClick = () => {
    window.open(link.url, '_blank');
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg flex flex-col">
      {/* Thumbnail container */}
      <div 
        className="relative w-full pt-[56.25%] cursor-pointer group"
        onClick={handleThumbnailClick}
      >
        <Image
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={link.title}
          fill
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        {/* Overlay z ikoną odtwarzania */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            {/* Logo YouTube zamiast ikony play */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-white">
              <path
                fill="currentColor"
                d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Informacje o filmie */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 
          className="text-xl font-semibold text-white mb-2 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors duration-300"
          onClick={handleThumbnailClick}
        >
          {link.title}
        </h2>
        {link.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {link.description}
          </p>
        )}
        
        {/* Przyciski akcji */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <button
            onClick={onEdit}
            className="gradient-button edit-gradient text-xs py-1 px-2 flex items-center gap-1"
          >
            <EditIcon className="w-4 h-4" />
            <span>EDIT</span>
          </button>
          
          <button
            onClick={onDelete}
            className="gradient-button delete-gradient text-xs py-1 px-2 flex items-center gap-1"
          >
            <DeleteIcon className="w-4 h-4" />
            <span>DELETE</span>
          </button>
          
          <button
            onClick={onCopy}
            className="gradient-button copy-gradient text-xs py-1 px-2 flex items-center gap-1"
          >
            <CopyIcon className="w-4 h-4" />
            <span>COPY</span>
          </button>
          
          <button
            onClick={onShare}
            className="gradient-button share-gradient text-xs py-1 px-2 flex items-center gap-1"
          >
            <ShareIcon className="w-4 h-4" />
            <span>OPEN</span>
          </button>
        </div>
      </div>
    </div>
  );
} 