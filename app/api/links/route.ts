import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { desc, eq, or } from 'drizzle-orm';

export async function GET() {
  console.log('🔍 GET /api/links - Rozpoczynam obsługę żądania');
  
  try {
    console.log('📊 Próba pobrania linków z bazy danych...');
    const db = await getDbInstance();
    const allLinks = await db.select()
      .from(links)
      .orderBy(desc(links.createdAt));
    
    console.log(`✅ Pobrano ${allLinks.length} linków`);
    console.log('Przykładowy link:', allLinks[0]);
    
    return NextResponse.json(allLinks);
  } catch (error) {
    console.error('❌ Błąd podczas pobierania linków:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania linków' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Sprawdzenie autoryzacji
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany aby dodać link' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Otrzymane dane:', data);

    // Podstawowa walidacja
    if (!data.url || !data.title) {
      return NextResponse.json(
        { error: 'URL i tytuł są wymagane' },
        { status: 400 }
      );
    }
    
    // Sprawdź czy link już istnieje
    const db = await getDbInstance();
    const [existingLink] = await db.select()
      .from(links)
      .where(or(
        eq(links.url, data.url),
        eq(links.title, data.title)
      ));

    if (existingLink) {
      console.log('Znaleziono istniejący link:', existingLink);
      return NextResponse.json(
        { 
          error: 'Link już istnieje w bazie',
          existingLink: {
            title: existingLink.title,
            url: existingLink.url
          }
        },
        { status: 409 }
      );
    }

    // Przygotuj dane do zapisu
    const newLink = {
      url: data.url.trim(),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      prompt: null,
      userId: session.user.id, // Przypisanie do zalogowanego użytkownika
      imageData: null,
      imageMimeType: null,
      thumbnailData: null,
      thumbnailMimeType: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Dodawanie nowego linku:', {
      ...newLink,
      url: newLink.url.substring(0, 50) + '...',
      description: newLink.description?.substring(0, 50) + '...'
    });

    const [result] = await db.insert(links)
      .values(newLink)
      .execute();

    // Pobierz dodany link
    const [insertedLink] = await db.select()
      .from(links)
      .where(eq(links.id, result.insertId));

    if (!insertedLink) {
      throw new Error('Nie udało się pobrać dodanego linku');
    }

    console.log('Dodany link:', {
      id: insertedLink.id,
      title: insertedLink.title,
      url: insertedLink.url.substring(0, 50) + '...'
    });

    return NextResponse.json(insertedLink, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas dodawania linku:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania linku' },
      { status: 500 }
    );
  }
}
