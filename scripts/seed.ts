import { db } from '@/db';
import { links } from '@/db/schema';

async function seed() {
  console.log('Rozpoczynanie procesu seedowania...');

  try {
    await db.insert(links).values([
      {
        url: 'https://nextjs.org',
        title: 'Next.js Documentation',
        description: 'Official Next.js documentation',
        prompt: 'How to use Next.js',
      },
      {
        url: 'https://react.dev',
        title: 'React Documentation',
        description: 'Official React documentation',
        prompt: 'React best practices',
      },
    ]);
    console.log('Dane seedowe wstawione pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas seedowania danych:', error);
  }
}

seed().catch(console.error);
