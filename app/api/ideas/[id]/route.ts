import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getDb } from '@/lib/db';
import { ideas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/ideas/[id] - aktualizuj pomysł
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Weryfikacja sesji
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const db = await getDb();
    await db
      .update(ideas)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ideas.id, id));

    const updatedIdea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
      .then(res => res[0]);

    return NextResponse.json(updatedIdea);
  } catch (error) {
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
    // Weryfikacja sesji
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = await getDb();
    await db.delete(ideas).where(eq(ideas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Nie udało się usunąć pomysłu' },
      { status: 500 }
    );
  }
}
