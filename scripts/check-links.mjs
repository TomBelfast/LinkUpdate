import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Załaduj zmienne środowiskowe z .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function checkLinks() {
  const config = {
    host: process.env.DATABASE_HOST || '192.168.0.250',
    user: process.env.DATABASE_USER || 'test1',
    password: process.env.DATABASE_PASSWORD || 'test1',
    database: process.env.DATABASE_NAME || 'BOLT',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Połączenie udane!');
    
    // Sprawdź strukturę tabeli
    console.log('\n📋 Struktura tabeli links:');
    const [columns] = await connection.execute('DESCRIBE links');
    console.log(columns);
    
    // Pobierz liczbę rekordów
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM links');
    console.log('\n📊 Liczba linków w bazie:', count[0].count);
    
    // Pobierz przykładowe rekordy
    if (count[0].count > 0) {
      console.log('\n📝 Przykładowe linki:');
      const [links] = await connection.execute('SELECT * FROM links LIMIT 5');
      console.log(links);
    }
    
    await connection.end();
    console.log('\n✅ Sprawdzanie zakończone');
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

checkLinks(); 