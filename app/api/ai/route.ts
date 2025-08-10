import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'AI functionality is temporarily disabled' },
    { status: 501 }
  );
} 