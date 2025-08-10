import { NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_DIMENSION = 3840; // 4K resolution
const THUMBNAIL_SIZE = 600; // Maksymalny wymiar miniatury
const COMPRESSION_QUALITY = 85;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nie przesłano pliku' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Plik jest zbyt duży (max 50MB)' },
        { status: 400 }
      );
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Niedozwolony typ pliku' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pobierz wymiary oryginalnego obrazu
    const metadata = await sharp(buffer).metadata();
    const aspectRatio = metadata.width! / metadata.height!;

    // Optymalizacja głównego obrazu z zachowaniem proporcji
    const optimizedBuffer = await sharp(buffer)
      .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: COMPRESSION_QUALITY })
      .toBuffer();

    // Oblicz wymiary miniatury zachowując proporcje
    let thumbnailWidth = THUMBNAIL_SIZE;
    let thumbnailHeight = THUMBNAIL_SIZE;
    
    if (aspectRatio > 1) {
      // Obraz poziomy
      thumbnailHeight = Math.round(THUMBNAIL_SIZE / aspectRatio);
    } else {
      // Obraz pionowy
      thumbnailWidth = Math.round(THUMBNAIL_SIZE * aspectRatio);
    }

    // Generowanie miniatury z zachowaniem proporcji
    const thumbnailBuffer = await sharp(buffer)
      .resize(thumbnailWidth, thumbnailHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Przezroczyste tło
      })
      .webp({ quality: 80 })
      .toBuffer();

    return NextResponse.json({ 
      imageData: optimizedBuffer.toString('base64'),
      imageMimeType: 'image/webp',
      thumbnailData: thumbnailBuffer.toString('base64'),
      thumbnailMimeType: 'image/webp'
    }, { status: 201 });

  } catch (error) {
    console.error('Błąd podczas przetwarzania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania obrazu' },
      { status: 500 }
    );
  }
}
