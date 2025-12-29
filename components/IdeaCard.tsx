'use client';

import React, { memo } from 'react';
import { Idea as IdeaType } from '@/db/schema';

interface IdeaCardProps {
  idea: IdeaType;
  onEdit: (idea: IdeaType) => void;
  onDelete: (id: string) => void;
}

type IdeaStatus = 'completed' | 'in_progress' | 'rejected' | 'pending';

const statusConfig: Record<IdeaStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-900', text: 'text-green-200', label: 'Completed' },
  in_progress: { bg: 'bg-blue-900', text: 'text-blue-200', label: 'In Progress' },
  rejected: { bg: 'bg-red-900', text: 'text-red-200', label: 'Rejected' },
  pending: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'Pending' },
};

function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  const status = statusConfig[idea.status as IdeaStatus] || statusConfig.pending;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-white">{idea.title}</h3>
        <div className="flex gap-2">
          {/* ZACHOWUJEMY wszystkie oryginalne gradienty! */}
          <button
            onClick={() => onEdit(idea)}
            className="gradient-button edit-gradient px-3 py-1 text-white rounded hover:opacity-90"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(idea.id.toString())}
            className="gradient-button delete-gradient px-3 py-1 text-white rounded hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-gray-300 mb-2">{idea.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span className={`px-2 py-1 rounded ${status.bg} ${status.text}`}>
          {status.label}
        </span>
        <span>
          Created: {new Date(idea.createdAt).toLocaleDateString('en-US')}
        </span>
      </div>
    </div>
  );
}

// memo dla optymalizacji - nie re-renderuj jeśli props się nie zmieniły
export default memo(IdeaCard);
