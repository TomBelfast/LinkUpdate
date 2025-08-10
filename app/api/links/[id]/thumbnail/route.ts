import { NextResponse } from 'next/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    const [link] = await db.select()
      .from(links)
      .where(eq(links.id, id));

    if (!link || !link.thumbnailData || !link.thumbnailMimeType) {
      return NextResponse.json({ error: 'Miniatura nie została znaleziona' }, { status: 404 });
    }

    // Konwertuj dane binarne na bufor
    const imageBuffer = Buffer.from(link.thumbnailData);

    // Zwróć miniaturkę z odpowiednimi nagłówkami
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': link.thumbnailMimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': imageBuffer.length.toString()
      },
    });
  } catch (error) {
    console.error('Błąd podczas pobierania miniatury:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania miniatury' },
      { status: 500 }
    );
  }
} 