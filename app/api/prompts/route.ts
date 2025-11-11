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
    
    // Przygotuj dane do zapisu
    const insertData: any = {
      title: data.title,
      url: '#prompt',
      description: data.description || null,
      prompt: data.prompt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Konwertuj dane obrazu z base64 na bufor jeśli są dostępne
    if (data.imageData && data.imageMimeType) {
      try {
        // Usuń prefix data:image/...;base64, jeśli istnieje
        const base64Data = data.imageData.startsWith('data:') 
          ? data.imageData.split(',')[1] ?? data.imageData
          : data.imageData;
        
        const imageBuffer = Buffer.from(base64Data, 'base64');
        insertData.imageData = imageBuffer;
        insertData.imageMimeType = data.imageMimeType;
        console.log('Przygotowano dane obrazu:', {
          bufferLength: imageBuffer.length,
          mimeType: data.imageMimeType
        });
      } catch (error) {
        console.error('Błąd konwersji danych obrazu:', error);
      }
    }

    // Konwertuj dane miniatury z base64 na bufor jeśli są dostępne
    if (data.thumbnailData && data.thumbnailMimeType) {
      try {
        // Usuń prefix data:image/...;base64, jeśli istnieje
        const base64Thumbnail = data.thumbnailData.startsWith('data:') 
          ? data.thumbnailData.split(',')[1] ?? data.thumbnailData
          : data.thumbnailData;
        
        const thumbnailBuffer = Buffer.from(base64Thumbnail, 'base64');
        insertData.thumbnailData = thumbnailBuffer;
        insertData.thumbnailMimeType = data.thumbnailMimeType;
        console.log('Przygotowano dane miniatury:', {
          bufferLength: thumbnailBuffer.length,
          mimeType: data.thumbnailMimeType
        });
      } catch (error) {
        console.error('Błąd konwersji danych miniatury:', error);
      }
    }

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
      id: newPrompt.id,
      title: newPrompt.title,
      hasImage: !!newPrompt.imageData,
      hasThumbnail: !!newPrompt.thumbnailData,
      imageData: newPrompt.imageData ? `[${Buffer.isBuffer(newPrompt.imageData) ? newPrompt.imageData.length : 'nie-Buffer'] bajtów]` : null,
      thumbnailData: newPrompt.thumbnailData ? `[${Buffer.isBuffer(newPrompt.thumbnailData) ? newPrompt.thumbnailData.length : 'nie-Buffer'] bajtów]` : null
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