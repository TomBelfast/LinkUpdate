import { Link } from '@/db/schema';

export interface UpdateLinkData {
  url?: string;
  title?: string;
  description?: string | null;
  prompt?: string | null;
  imageData?: Buffer | string | null;
  imageMimeType?: string | null;
  thumbnailData?: Buffer | string | null;
  thumbnailMimeType?: string | null;
  updatedAt?: Date;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface LinkResponse extends ApiResponse {
  data?: Link;
}

export interface LinksResponse extends ApiResponse {
  data?: Link[];
}

export interface ErrorResponse {
  error: string;
  status: number;
  details?: unknown;
} 