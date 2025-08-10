import { getDb } from '../db';
import mysql from 'mysql2/promise';

async function testRealDatabaseConnection() {
  console.log('🔍 Sprawdzam rzeczywiste połączenie z bazą...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || '192.168.0.250',
      user: process.env.DATABASE_USER || 'test1',
      password: process.env.DATABASE_PASSWORD || 'test1',
      database: process.env.DATABASE_NAME || 'BOLT',
      port: parseInt(process.env.DATABASE_PORT || '3306')
    });

    // Test 1: Sprawdź tabele w bazie
    console.log('1️⃣ Sprawdzam dostępne tabele:');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Znalezione tabele:', tables);

    // Test 2: Sprawdź przykładowe rekordy z każdej tabeli
    console.log('\n2️⃣ Sprawdzam zawartość tabel:');
    for (const table of Object.values(tables)) {
      const tableName = Object.values(table)[0] as string;
      console.log(`\nTabela: ${tableName}`);
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 3`);
      console.log(`Przykładowe rekordy:`, rows);
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`) as any[];
      console.log(`Liczba wszystkich rekordów: ${count[0].count}`);
    }

    // Test 3: Sprawdź uprawnienia
    console.log('\n3️⃣ Sprawdzam uprawnienia użytkownika:');
    const [grants] = await connection.query('SHOW GRANTS');
    console.log('Uprawnienia:', grants);

    // Test 4: Sprawdź status połączenia
    console.log('\n4️⃣ Sprawdzam status połączenia:');
    const [status] = await connection.query('SHOW STATUS WHERE Variable_name LIKE "Conn%" OR Variable_name LIKE "Uptime"');
    console.log('Status połączenia:', status);

    await connection.end();
    console.log('\n✅ Testy zakończone. Sprawdź logi powyżej, aby zobaczyć szczegóły połączenia i danych.');

  } catch (error) {
    console.error('\n❌ BŁĄD KRYTYCZNY:', error);
    console.log('\n🔍 Szczegóły diagnostyczne:');
    console.log('- Host:', process.env.DATABASE_HOST || '192.168.0.250');
    console.log('- Port:', process.env.DATABASE_PORT || '3306');
    console.log('- Baza:', process.env.DATABASE_NAME || 'BOLT');
    console.log('- User:', process.env.DATABASE_USER || 'test1');
    process.exit(1);
  }
}

testRealDatabaseConnection(); 