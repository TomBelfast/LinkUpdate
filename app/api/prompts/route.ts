import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { desc, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Weryfikacja sesji
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDbInstance();
    const prompts = await db.select()
      .from(links)
      .where(
        isNotNull(links.prompt)
      )
      .orderBy(desc(links.createdAt));

    return NextResponse.json(prompts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania promptów' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Weryfikacja sesji
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const db = await getDbInstance();

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
      } catch (error) {
        // Błąd konwersji obrazu - kontynuuj bez obrazu
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
      } catch (error) {
        // Błąd konwersji miniatury - kontynuuj bez miniatury
      }
    }

    await db.insert(links).values(insertData);

    // Pobierz ostatnio dodany prompt
    const [newPrompt] = await db.select()
      .from(links)
      .orderBy(desc(links.id))
      .limit(1);

    return NextResponse.json(newPrompt);
  } catch (error) {
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania promptu' },
      { status: 500 }
    );
  }
}
