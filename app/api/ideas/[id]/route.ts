import { NextResponse } from 'next/server';
import { getDbInstance } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/ideas/[id] - aktualizuj pomysł
export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const data = await request.json();
    const db = await getDbInstance();
    await db
      .update(ideas)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ideas.id, await Promise.resolve(params.id)));
    
    const updatedIdea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, params.id))
      .then(res => res[0]);
    
    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error('Błąd podczas aktualizacji pomysłu:', error);
    return NextResponse.json(
      { error: 'Nie udało się zaktualizować pomysłu' },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - usuń pomysł
export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const resolvedId = await Promise.resolve(params.id);
    const db = await getDbInstance();
    await db.delete(ideas).where(eq(ideas.id, resolvedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas usuwania pomysłu:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć pomysłu' },
      { status: 500 }
    );
  }
} 