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
    const data = await request.json();
    await db
      .update(ideas)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ideas.id, (await params).id));
    
    const updatedIdea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, (await params).id))
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
    await db.delete(ideas).where(eq(ideas.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas usuwania pomysłu:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć pomysłu' },
      { status: 500 }
    );
  }
} 