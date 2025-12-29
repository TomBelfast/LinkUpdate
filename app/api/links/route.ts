import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const rawSearch = url.searchParams.get('search') ?? '';
    const userId = url.searchParams.get('userId') ?? '';

    // Parametry paginacji
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    const search = rawSearch.trim();

    const conditions: any[] = [];
    if (search.length > 0) {
      conditions.push(
        or(
          like(links.title, `%${search}%`),
          like(links.url, `%${search}%`),
          like(links.description, `%${search}%`),
          like(links.prompt, `%${search}%`)
        )
      );
    }
    if (userId) {
      conditions.push(eq(links.userId, userId));
    }

    // Pobierz dane i łączną liczbę równolegle
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db.select()
        .from(links)
        .where(whereClause)
        .orderBy(desc(links.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(links)
        .where(whereClause)
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
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
      userId: session.user.id,
      imageData: null,
      imageMimeType: null,
      thumbnailData: null,
      thumbnailMimeType: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

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

    return NextResponse.json(insertedLink, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania linku' },
      { status: 500 }
    );
  }
}
