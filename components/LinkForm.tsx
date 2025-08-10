'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/db/schema';
import { commonStyles } from '@/styles/common';

interface LinkFormProps {
  onSubmit: (data: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>;
}

export default function LinkForm({ onSubmit, initialData }: LinkFormProps) {
  const [formData, setFormData] = useState(() => 
    initialData || { 
      url: '', 
      title: '', 
      description: null, 
      prompt: null,
      imageData: null,
      imageMimeType: null,
      thumbnailData: null,
      thumbnailMimeType: null
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ url: '', title: '', description: null, prompt: null, imageData: null, imageMimeType: null, thumbnailData: null, thumbnailMimeType: null });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Wysyłanie danych:', formData);
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className={commonStyles.section}>
      <input
        type="text"
        name="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="URL"
        className={commonStyles.input}
        required
      />
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        className={commonStyles.input}
        required
      />
      <textarea
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        placeholder="Description"
        className={commonStyles.textarea}
      />
      <button 
        type="submit" 
        className="gradient-button w-full py-2 px-4 rounded-md text-white font-medium transition-all duration-300"
      >
        {initialData ? 'Update Link' : 'Add Link'}
      </button>
    </form>
  );
}
