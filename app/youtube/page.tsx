'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Link } from '@/db/schema';
import { getYouTubeVideoId } from '@/utils/youtube';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Komponent dla karty filmu
const VideoCard = dynamic(() => import('@/components/VideoCard'), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg animate-pulse border border-border">
      <div className="w-full pt-[56.25%] bg-muted"></div>
      <div className="p-4">
        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  )
});

export default function YouTubeLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchYouTubeLinks();
  }, []);

  const fetchYouTubeLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/links');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error fetching links');
      }
      const allLinks = await response.json();
      const youtubeLinks = allLinks.filter((link: Link) => getYouTubeVideoId(link.url));
      setLinks(youtubeLinks);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten film?')) return;

    try {
      const response = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting link');
      }
      await fetchYouTubeLinks();
      toast.success('Film został usunięty');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Nie udało się usunąć filmu');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">YouTube Videos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-[300px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">YouTube Videos</h1>
        <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">YouTube Videos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-[300px]"></div>
          ))}
        </div>
      </div>
    }>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">YouTube Videos</h1>
        {links.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 text-lg">Nie znaleziono żadnych filmów z YouTube</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {links.map((link) => {
              const videoId = getYouTubeVideoId(link.url);
              return (
                <VideoCard
                  key={link.id}
                  link={link}
                  videoId={videoId}
                  onEdit={() => router.push(`/?edit=${link.id}`)}
                  onDelete={() => handleDelete(link.id)}
                  onCopy={() => {
                    navigator.clipboard.writeText(link.url);
                    toast.success('Link skopiowany do schowka');
                  }}
                  onShare={() => window.open(link.url, '_blank')}
                />
              );
            })}
          </div>
        )}
      </div>
    </Suspense>
  );
} 