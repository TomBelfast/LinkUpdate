import { NextResponse } from 'next/server';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);
    console.log(`Pobieranie miniatury dla ID: ${id}`);
    
    if (isNaN(id)) {
      console.error('Nieprawidłowe ID:', params.id);
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }
    
    const db = await getDbInstance();
    const [prompt] = await db.select()
      .from(links)
      .where(eq(links.id, id));
    
    if (!prompt) {
      console.error(`Nie znaleziono promptu o ID: ${id}`);
      return NextResponse.json({ error: 'Prompt nie został znaleziony' }, { status: 404 });
    }

    if (!prompt.thumbnailData || !prompt.thumbnailMimeType) {
      console.error(`Brak danych miniatury dla promptu ID: ${id}`);
      return NextResponse.json({ error: 'Miniaturka nie została znaleziona' }, { status: 404 });
    }
    
    let imageBuffer: Buffer;
    try {
      // Dane z DB mogą być Buffer lub string base64 (z prefixem lub bez)
      if (Buffer.isBuffer(prompt.thumbnailData)) {
        imageBuffer = prompt.thumbnailData as Buffer;
      } else if (typeof prompt.thumbnailData === 'string') {
        const asString = prompt.thumbnailData as string;
        const base64 = asString.startsWith('data:') ? asString.split(',')[1] ?? '' : asString;
        imageBuffer = Buffer.from(base64, 'base64');
      } else {
        const fallback = String(prompt.thumbnailData ?? '');
        imageBuffer = Buffer.from(fallback, 'binary');
      }
      
      console.log('Pomyślnie utworzono bufor obrazu:', {
        bufferLength: imageBuffer.length,
        isBuffer: Buffer.isBuffer(imageBuffer)
      });

      // Zwróć miniaturkę z odpowiednimi nagłówkami
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': prompt.thumbnailMimeType,
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': imageBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'X-Content-Type-Options': 'nosniff'
        },
      });
    } catch (error) {
      console.error('Błąd podczas konwersji danych obrazu:', error);
      // Nie logujemy szczegółów danych binarnych, by uniknąć błędów dostępu
      return NextResponse.json(
        { error: 'Błąd podczas przetwarzania danych obrazu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Błąd podczas pobierania miniatury:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania miniaturki' },
      { status: 500 }
    );
  }
}
