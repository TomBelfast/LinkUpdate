import { NextResponse } from 'next/server';
import { getDbInstance } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/ideas - pobierz wszystkie pomysły
export async function GET() {
  try {
    console.log('Pobieranie wszystkich pomysłów...');
    
    const db = await getDbInstance();
    
    // Sprawdź połączenie z bazą danych
    try {
      await db.execute(sql`SELECT 1`);
      console.log('✅ Połączenie z bazą danych działa poprawnie');
    } catch (error) {
      console.error('❌ Problem z połączeniem z bazą danych:', error);
      throw error;
    }

    // Sprawdź czy tabela ideas istnieje
    try {
      const tables = await db.execute(sql`SHOW TABLES LIKE 'ideas'`);
      console.log('Znalezione tabele:', tables);
    } catch (error) {
      console.error('❌ Problem podczas sprawdzania tabeli ideas:', error);
    }

    const allIdeas = await db.select().from(ideas).orderBy(ideas.createdAt);
    console.log('Pobrane pomysły:', JSON.stringify(allIdeas, null, 2));
    
    return NextResponse.json(allIdeas);
  } catch (error) {
    console.error('Błąd podczas pobierania pomysłów:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać pomysłów' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - dodaj nowy pomysł
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Otrzymane dane:', data);
    
    // Generuj nowe UUID dla pomysłu
    const newId = uuidv4();
    
    const db = await getDbInstance();
    
    // Dodaj pomysł do bazy
    const insertResult = await db.insert(ideas).values({
      id: newId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Wynik insertu:', insertResult);
    
    // Pobierz dodany pomysł
    const newIdea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, newId))
      .then(res => res[0]);
    
    console.log('Pobrany pomysł:', newIdea);
    
    if (!newIdea) {
      throw new Error('Nie udało się pobrać utworzonego pomysłu');
    }
    
    return NextResponse.json(newIdea);
  } catch (error) {
    console.error('Błąd podczas dodawania pomysłu:', error);
    return NextResponse.json(
      { error: 'Nie udało się dodać pomysłu' },
      { status: 500 }
    );
  }
} 