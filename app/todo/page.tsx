'use client';

import { useState, useEffect } from 'react';
import IdeaForm from '@/components/IdeaForm';
import { useRouter } from 'next/navigation';
import { Idea } from '@/types/idea';
import { toast } from 'react-hot-toast';

export default function TodoPage({ ideas: initialIdeas = [] }: { ideas?: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ideas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Convert dates back to Date objects
      const ideasWithDates = data.map((idea: any) => ({
        ...idea,
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt)
      }));
      
      setIdeas(ideasWithDates);
    } catch (error) {
      console.error('Error while fetching ideas:', error);
      toast.error('Failed to fetch ideas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleAddIdea = async (data: Omit<Idea, 'id'>) => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add idea');
      }

      await fetchIdeas();
      toast.success('Idea added successfully!');
    } catch (error) {
      console.error('Error while adding idea:', error);
      toast.error('Failed to add idea');
    }
  };

  const handleEditIdea = async (data: Omit<Idea, 'id'>) => {
    if (!editingIdea) return;

    try {
      const response = await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update idea');
      }

      await fetchIdeas();
      setEditingIdea(null);
      toast.success('Idea updated successfully!');
    } catch (error) {
      console.error('Error while updating idea:', error);
      toast.error('Failed to update idea');
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
        throw new Error('Failed to delete idea');
      }

      await fetchIdeas();
      toast.success('Idea deleted successfully!');
    } catch (error) {
      console.error('Error while deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Ideas List</h1>
      
      {editingIdea ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Edit Idea</h2>
          <IdeaForm
            onSubmit={handleEditIdea}
            initialData={editingIdea}
            onCancel={() => setEditingIdea(null)}
          />
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Add New Idea</h2>
          <IdeaForm onSubmit={handleAddIdea} />
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-white">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-gray-400">No ideas yet. Add your first idea above!</div>
        ) : (
          ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-gray-800 rounded-lg p-4 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-white">{idea.title}</h3>
              <p className="text-gray-300 mb-4">{idea.description}</p>
              <div className="flex justify-between items-center">
                <span className={`gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium ${
                  idea.status === 'pending' ? 'text-amber-400' :
                  idea.status === 'in_progress' ? 'text-blue-400' :
                  idea.status === 'completed' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {idea.status === 'pending' ? 'Pending' :
                   idea.status === 'in_progress' ? 'In Progress' :
                   idea.status === 'completed' ? 'Completed' :
                   'Rejected'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingIdea(idea)}
                    className="gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-emerald-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="ml-1">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-rose-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span className="ml-1">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 