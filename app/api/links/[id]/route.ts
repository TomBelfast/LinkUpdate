import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { getDbInstance } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateLinkData, LinkResponse, ErrorResponse } from '@/app/types/api';

// Funkcja pomocnicza do walidacji ID
const validateId = (id: string): number | null => {
  const parsedId = parseInt(id);
  return !isNaN(parsedId) ? parsedId : null;
};

// Funkcja pomocnicza do weryfikacji właścicielstwa
const checkOwnership = async (linkId: number, userId: string) => {
  const db = await getDbInstance();
  const [link] = await db.select()
    .from(links)
    .where(eq(links.id, linkId));
  
  if (!link) {
    return { error: 'Link nie został znaleziony', status: 404 };
  }
  
  if (link.userId && link.userId !== userId) {
    return { error: 'Nie masz uprawnień do tej operacji', status: 403 };
  }
  
  return { link };
};

export async function GET(
  request: Request,
  { params }: any
): Promise<NextResponse<LinkResponse | ErrorResponse>> {
  const resolvedId = await Promise.resolve(params.id);
  
  const id = validateId(resolvedId);
  if (id === null) {
    return NextResponse.json({ error: 'Nieprawidłowe ID', status: 400 });
  }

  try {
    const db = await getDbInstance();
    const [link] = await db.select()
      .from(links)
      .where(eq(links.id, id));

    if (!link) {
      return NextResponse.json({ error: 'Link nie został znaleziony', status: 404 });
    }

    console.log(`Pobrano link o ID ${id}`);
    return NextResponse.json({ data: link });
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred', status: 500 },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: any
): Promise<NextResponse<LinkResponse | ErrorResponse>> {
  const resolvedId = await Promise.resolve(params.id);
  
  const id = validateId(resolvedId);
  if (id === null) {
    return NextResponse.json({ error: 'Nieprawidłowe ID', status: 400 });
  }

  try {
    const db = await getDbInstance();
    // Sprawdzenie autoryzacji
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany aby edytować link', status: 401 },
        { status: 401 }
      );
    }

    // Sprawdzenie właścicielstwa
    const ownershipCheck = await checkOwnership(id, session.user.id);
    if ('error' in ownershipCheck) {
      return NextResponse.json(ownershipCheck, { status: ownershipCheck.status });
    }

    const data = await request.json() as UpdateLinkData;

    console.log('Otrzymane dane do aktualizacji:', {
      id,
      title: data.title,
      hasDescription: !!data.description,
      hasPrompt: !!data.prompt,
      hasImage: !!data.imageData,
      hasThumbnail: !!data.thumbnailData,
      imageMimeType: data.imageMimeType,
      thumbnailMimeType: data.thumbnailMimeType
    });

    // Przygotuj dane do aktualizacji
    const updateData: UpdateLinkData = {
      url: data.url, 
      title: data.title, 
      description: data.description || null,
      prompt: data.prompt || null,
      updatedAt: new Date()
    };

    // Dodaj dane obrazu tylko jeśli zostały przesłane
    if (data.imageData && data.imageMimeType) {
      updateData.imageData = data.imageData;
      updateData.imageMimeType = data.imageMimeType;
    }

    if (data.thumbnailData && data.thumbnailMimeType) {
      updateData.thumbnailData = data.thumbnailData;
      updateData.thumbnailMimeType = data.thumbnailMimeType;
    }

    console.log('Aktualizacja danych:', {
      id,
      title: data.title,
      hasImage: !!updateData.imageData,
      hasThumbnail: !!updateData.thumbnailData
    });

    await db.update(links)
      .set(updateData)
      .where(eq(links.id, id))
      .execute();
    
    // Pobierz zaktualizowany link
    const [updatedLink] = await db.select()
      .from(links)
      .where(eq(links.id, id));
    
    console.log('Link zaktualizowany:', {
      id: updatedLink.id,
      title: updatedLink.title,
      hasImage: !!updatedLink.imageData,
      hasThumbnail: !!updatedLink.thumbnailData
    });

    return NextResponse.json({ data: updatedLink });
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred', status: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: any
): Promise<NextResponse<LinkResponse | ErrorResponse>> {
  const resolvedId = await Promise.resolve(params.id);
  
  const id = validateId(resolvedId);
  if (id === null) {
    return NextResponse.json({ error: 'Nieprawidłowe ID', status: 400 });
  }

  try {
    const db = await getDbInstance();
    // Sprawdzenie autoryzacji
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany aby usunąć link', status: 401 },
        { status: 401 }
      );
    }

    // Sprawdzenie właścicielstwa
    const ownershipCheck = await checkOwnership(id, session.user.id);
    if ('error' in ownershipCheck) {
      return NextResponse.json(ownershipCheck, { status: ownershipCheck.status });
    }

    await db.delete(links)
      .where(eq(links.id, id))
      .execute();
    
    console.log(`Link o id ${id} został usunięty.`);
    return NextResponse.json({ message: 'Link został usunięty', status: 200 });
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred', status: 500 },
      { status: 500 }
    );
  }
}
