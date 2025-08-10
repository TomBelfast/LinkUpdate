import { NextResponse } from 'next/server';
import { db } from '@/db';
import { runMigrations } from '@/db';

export async function GET() {
  try {
    // Pobierz połączenie z bazy danych
    const connection = (db as any).connection;
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Nie można uzyskać połączenia z bazą danych' },
        { status: 500 }
      );
    }

    // Wykonaj migrację
    await runMigrations(connection);

    return NextResponse.json({ message: 'Migracja wykonana pomyślnie' });
  } catch (error: unknown) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred during migration' },
      { status: 500 }
    );
  }
} 