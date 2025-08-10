import { NextResponse } from 'next/server';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { desc, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDbInstance();
    const prompts = await db.select()
      .from(links)
      .where(
        isNotNull(links.prompt)
      )
      .orderBy(desc(links.createdAt));
    
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Błąd podczas pobierania promptów:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania promptów' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDbInstance();
    
    // Sprawdź czy mamy dane obrazu
    if (!data.imageData || !data.imageMimeType) {
      console.warn('Brak danych obrazu w żądaniu');
    } else {
      console.log('Otrzymane dane obrazu:', {
        imageSize: data.imageData.length,
        thumbnailSize: data.thumbnailData?.length,
        imageMimeType: data.imageMimeType,
        thumbnailMimeType: data.thumbnailMimeType
      });
    }
    
    // Dodaj nowy prompt
    const insertData = {
      title: data.title,
      url: '#prompt',
      description: data.description || null,
      prompt: data.prompt || null,
      imageData: data.imageData || null,
      imageMimeType: data.imageMimeType || null,
      thumbnailData: data.thumbnailData || null,
      thumbnailMimeType: data.thumbnailMimeType || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Zapisywanie danych:', {
      ...insertData,
      imageData: insertData.imageData ? `[${insertData.imageData.length} bajtów]` : null,
      thumbnailData: insertData.thumbnailData ? `[${insertData.thumbnailData.length} bajtów]` : null
    });

    await db.insert(links).values(insertData);

    // Pobierz ostatnio dodany prompt
    const [newPrompt] = await db.select()
      .from(links)
      .orderBy(desc(links.id))
      .limit(1);

    console.log('Zapisany prompt:', {
      ...newPrompt,
      imageData: newPrompt.imageData ? `[${newPrompt.imageData.length} bajtów]` : null,
      thumbnailData: newPrompt.thumbnailData ? `[${newPrompt.thumbnailData.length} bajtów]` : null
    });

    return NextResponse.json(newPrompt);
  } catch (error) {
    console.error('Błąd podczas dodawania promptu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania promptu' },
      { status: 500 }
    );
  }
} 