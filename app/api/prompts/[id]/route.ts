import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedId = await Promise.resolve(params.id);
    const id = parseInt(resolvedId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    const db = await getDb();
    const [prompt] = await db.select()
      .from(links)
      .where(eq(links.id, id));

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt nie został znaleziony' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Błąd podczas pobierania promptu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania promptu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json();
    const db = await getDb();
    const resolvedId = await Promise.resolve(params.id);
    const id = parseInt(resolvedId);
    
    console.log('Aktualizacja promptu - otrzymane dane:', {
      id,
      title: data.title,
      hasDescription: !!data.description,
      hasPrompt: !!data.prompt,
      hasImage: !!data.imageData,
      hasThumbnail: !!data.thumbnailData
    });
    
    if (isNaN(id)) {
      console.error('Nieprawidłowe ID:', resolvedId);
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    // Sprawdź czy prompt istnieje przed aktualizacją
    const [existingPrompt] = await db.select()
      .from(links)
      .where(eq(links.id, id));

    if (!existingPrompt) {
      console.error(`Prompt o ID ${id} nie istnieje`);
      return NextResponse.json({ error: 'Prompt nie został znaleziony' }, { status: 404 });
    }

    // Przygotuj podstawowe dane do aktualizacji
    const updateData: any = {
      title: data.title,
      description: data.description || null,
      prompt: data.prompt || null,
      updatedAt: new Date()
    };

    // Konwertuj dane obrazu z base64 na bufor jeśli są dostępne
    if (data.imageData && data.imageMimeType) {
      try {
        const imageBuffer = Buffer.from(data.imageData, 'base64');
        updateData.imageData = imageBuffer;
        updateData.imageMimeType = data.imageMimeType;
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
        const thumbnailBuffer = Buffer.from(data.thumbnailData, 'base64');
        updateData.thumbnailData = thumbnailBuffer;
        updateData.thumbnailMimeType = data.thumbnailMimeType;
        console.log('Przygotowano dane miniatury:', {
          bufferLength: thumbnailBuffer.length,
          mimeType: data.thumbnailMimeType
        });
      } catch (error) {
        console.error('Błąd konwersji danych miniatury:', error);
      }
    }

    console.log('Aktualizacja danych w bazie:', {
      id,
      title: updateData.title,
      hasImage: !!updateData.imageData,
      hasThumbnail: !!updateData.thumbnailData
    });

    try {
      await db.update(links)
        .set(updateData)
        .where(eq(links.id, id));
      
      console.log('Aktualizacja wykonana pomyślnie');
    } catch (dbError) {
      console.error('Błąd podczas aktualizacji w bazie danych:', dbError);
      throw dbError;
    }
    
    const [updatedPrompt] = await db.select()
      .from(links)
      .where(eq(links.id, id));
    
    if (!updatedPrompt) {
      console.error(`Nie znaleziono promptu o ID ${id} po aktualizacji`);
      return NextResponse.json({ error: 'Prompt nie został znaleziony po aktualizacji' }, { status: 500 });
    }

    console.log('Prompt zaktualizowany pomyślnie:', {
      id: updatedPrompt.id,
      title: updatedPrompt.title,
      hasImage: !!updatedPrompt.imageData,
      hasThumbnail: !!updatedPrompt.thumbnailData
    });

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Błąd podczas aktualizacji promptu:', error);
    if (error instanceof Error) {
      console.error('Szczegóły błędu:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji promptu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedId = await Promise.resolve(params.id);
    const db = await getDb();
    const id = parseInt(resolvedId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Nieprawidłowe ID' }, { status: 400 });
    }

    await db.delete(links)
      .where(eq(links.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas usuwania promptu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania promptu' },
      { status: 500 }
    );
  }
} 