import { useState, useEffect } from 'react';

interface IdeaFormProps {
  onSubmit: (data: { title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'rejected' }) => void;
  initialData?: {
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  };
  onCancel?: () => void;
}

export default function IdeaForm({ onSubmit, initialData, onCancel }: IdeaFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'pending');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setStatus(initialData.status);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, status });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setStatus('pending');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input"
          placeholder="Enter idea title"
        />
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="form-textarea"
          rows={4}
          placeholder="Describe your idea"
        />
      </div>

      <div>
        <label htmlFor="status" className="form-label">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed' | 'rejected')}
          className="form-select"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button 
          type="submit" 
          className="gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-blue-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span className="ml-1">{initialData ? 'Save' : 'Add'}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="gradient-button py-2 px-3 text-sm rounded-full flex items-center justify-center font-medium text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="ml-1">Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
} 