import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Załaduj zmienne środowiskowe z .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
  const config = {
    host: process.env.DATABASE_HOST || '192.168.0.250',
    user: process.env.DATABASE_USER || 'test1',
    password: process.env.DATABASE_PASSWORD || 'test1',
    database: process.env.DATABASE_NAME || 'BOLT',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  };

  console.log('Próba połączenia z bazą danych używając konfiguracji:');
  console.log({
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Połączenie udane!');
    
    // Test zapytania
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Zapytanie testowe wykonane pomyślnie:', result);
    
    // Sprawdź tabele
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Dostępne tabele:', tables);
    
    await connection.end();
    console.log('✅ Połączenie zakończone poprawnie');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error);
    process.exit(1);
  }
}

testConnection(); 