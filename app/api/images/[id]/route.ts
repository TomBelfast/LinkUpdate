import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    if (isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    const [image] = await db.select({
      imageData: links.imageData,
      imageMimeType: links.imageMimeType,
    })
    .from(links)
    .where(eq(links.id, parseInt(id)));

    if (!image || !image.imageData) {
      return NextResponse.json({ error: 'Obraz nie został znaleziony' }, { status: 404 });
    }

    // Zwróć obraz z odpowiednimi nagłówkami
    return new NextResponse(image.imageData, {
      headers: {
        'Content-Type': image.imageMimeType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Błąd podczas pobierania obrazu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania obrazu' },
      { status: 500 }
    );
  }
}
