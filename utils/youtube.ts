// Funkcje pomocnicze do obsługi YouTube

/**
 * Sprawdza, czy podany URL jest linkiem do YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

/**
 * Pobiera ID filmu z URL YouTube
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!isYouTubeUrl(url)) return null;
  
  // Obsługa youtu.be
  if (url.includes('youtu.be')) {
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  }
  
  // Obsługa youtube.com/watch?v=
  const urlParams = new URL(url).searchParams;
  return urlParams.get('v');
}

/**
 * Tworzy URL do miniatury filmu YouTube
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Tworzy URL do osadzenia filmu YouTube
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Pobiera informacje o filmie YouTube (wymaga API YouTube)
 * Uwaga: Ta funkcja jest zaślepką i powinna być zaimplementowana z użyciem API YouTube
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<any> {
  // Tutaj powinna być implementacja z użyciem API YouTube
  return {
    id: videoId,
    title: 'Tytuł filmu',
    description: 'Opis filmu',
    thumbnail: getYouTubeThumbnailUrl(videoId)
  };
} 