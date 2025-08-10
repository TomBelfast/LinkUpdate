'use client';

import React from 'react';
import { Link } from '@/db/schema';
import { getYouTubeVideoId } from '@/utils/youtube';
import { EditIcon, DeleteIcon, CopyIcon, ShareIcon } from '@/components/Icons';

interface LinkListProps {
  links: Link[] | null | undefined;
  onEdit: (link: Link) => void;
  onDelete: (id: number) => void;
  onCopy: (link: Link) => void;
  onShare: (link: Link) => void;
}

export default function LinkList({ links, onEdit, onDelete, onCopy, onShare }: LinkListProps) {
  if (!links || links.length === 0) {
    return <p>No links to display.</p>;
  }

  const nonYoutubeLinks = links.filter(link => !getYouTubeVideoId(link.url));

  if (nonYoutubeLinks.length === 0) {
    return <p>No regular links to display. All links are YouTube videos.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {nonYoutubeLinks.map((link) => (
        <div key={link.id} className="p-4 bg-[#1a1d24] rounded-lg shadow border border-[#3a4149] break-words">
          <h2 className="text-xl font-bold mb-2 text-gray-100 break-words">{link.title}</h2>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-500 hover:text-orange-600 hover:underline break-all"
          >
            {link.url}
          </a>
          {link.description && (
            <p className="mt-2 text-gray-300 break-all whitespace-pre-wrap">{link.description}</p>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(link)}
              className="gradient-button edit-gradient text-white"
            >
              <EditIcon className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="gradient-button delete-gradient text-white"
            >
              <DeleteIcon className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => onCopy(link)}
              className="gradient-button copy-gradient text-white"
            >
              <CopyIcon className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={() => onShare(link)}
              className="gradient-button share-gradient text-white"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
