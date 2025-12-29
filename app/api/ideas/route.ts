import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getDb } from '@/lib/db';
import { ideas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/ideas - pobierz wszystkie pomysły
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

    const db = await getDb();
    const allIdeas = await db.select().from(ideas).orderBy(ideas.createdAt);

    return NextResponse.json(allIdeas);
  } catch (error) {
    return NextResponse.json(
      { error: 'Nie udało się pobrać pomysłów' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - dodaj nowy pomysł
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

    // Generuj nowe UUID dla pomysłu
    const newId = uuidv4();

    const db = await getDb();

    // Dodaj pomysł do bazy
    await db.insert(ideas).values({
      id: newId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Pobierz dodany pomysł
    const newIdea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, newId))
      .then(res => res[0]);

    if (!newIdea) {
      throw new Error('Nie udało się pobrać utworzonego pomysłu');
    }

    return NextResponse.json(newIdea);
  } catch (error) {
    return NextResponse.json(
      { error: 'Nie udało się dodać pomysłu' },
      { status: 500 }
    );
  }
}
