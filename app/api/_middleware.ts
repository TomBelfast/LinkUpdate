import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Zwiększ limit dla body parsera
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB
    return new NextResponse('Rozmiar pliku jest zbyt duży', { status: 413 });
  }

  // Ustaw odpowiednie nagłówki
  const response = NextResponse.next();
  response.headers.set('Accept', 'multipart/form-data');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 