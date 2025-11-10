import { NextResponse } from 'next/server';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    const db = await getDbInstance();
    const [prompt] = await db.select()
      .from(links)
      .where(eq(links.id, id));
    
    if (!prompt || !prompt.imageData || !prompt.imageMimeType) {
      return NextResponse.json({ error: 'Obraz nie został znaleziony' }, { status: 404 });
    }
    
    // Ustal właściwy bufor obrazu niezależnie od formatu zwracanego przez DB
    let imageBuffer: Buffer;
    if (Buffer.isBuffer(prompt.imageData)) {
      imageBuffer = prompt.imageData as Buffer;
    } else if (typeof prompt.imageData === 'string') {
      // jeśli trzymane jako base64 (z lub bez prefixu)
      const base64 = prompt.imageData.startsWith('data:')
        ? prompt.imageData.split(',')[1] ?? ''
        : prompt.imageData;
      imageBuffer = Buffer.from(base64, 'base64');
    } else {
      // ostateczny fallback
      imageBuffer = Buffer.from(String(prompt.imageData ?? ''), 'binary');
    }
    
    // Zwróć obraz z odpowiednim typem MIME
    return new NextResponse(imageBuffer as any, {
      headers: {
        'Content-Type': prompt.imageMimeType,
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': imageBuffer.length.toString(),
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
