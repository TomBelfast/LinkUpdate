import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/ideas/[id] - aktualizuj pomysł
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const database = await db();
    await database
      .update(ideas)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ideas.id, id));

    const updatedIdea = await database
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const database = await db();
    await database.delete(ideas).where(eq(ideas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas usuwania pomysłu:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć pomysłu' },
      { status: 500 }
    );
  }
} 