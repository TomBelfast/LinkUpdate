'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h2 className='text-2xl font-bold mb-4'>404 - Nie znaleziono strony</h2>
      <p className='mb-4'>Przepraszamy, ale strona której szukasz nie istnieje.</p>
      <Link href='/' className='text-blue-500 hover:text-blue-700'>
        Wróć do strony głównej
      </Link>
    </div>
  );
}