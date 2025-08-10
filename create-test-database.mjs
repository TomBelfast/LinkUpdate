import mysql from 'mysql2/promise';

async function createTestDatabase() {
  try {
    // Połącz się z serwerem MySQL (bez określonej bazy)
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z serwerem MySQL działa');
    
    // Utwórz nową bazę danych testową
    const testDbName = 'ToDo_Test';
    
    console.log(`Tworzę bazę danych: ${testDbName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testDbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ Baza danych ${testDbName} została utworzona`);
    
    // Przełącz się na nową bazę
    await connection.execute(`USE ${testDbName}`);
    
    // Skopiuj strukturę i dane z oryginalnej bazy
    console.log('Kopiuję strukturę i dane z oryginalnej bazy...');
    
    // Pobierz listę tabel z oryginalnej bazy
    const [tables] = await connection.execute('SHOW TABLES FROM ToDo');
    console.log('Tabele do skopiowania:', tables.map(t => Object.values(t)[0]));
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`\nKopiuję tabelę: ${tableName}`);
      
      // Pobierz strukturę tabeli
      const [createTableResult] = await connection.execute(`SHOW CREATE TABLE ToDo.${tableName}`);
      const createTableSQL = createTableResult[0]['Create Table'];
      
      // Utwórz tabelę w nowej bazie
      await connection.execute(createTableSQL);
      console.log(`  ✅ Struktura tabeli ${tableName} skopiowana`);
      
      // Skopiuj dane
      await connection.execute(`INSERT INTO ${tableName} SELECT * FROM ToDo.${tableName}`);
      
      // Sprawdź ile rekordów skopiowano
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const recordCount = countResult[0].count;
      console.log(`  ✅ Skopiowano ${recordCount} rekordów`);
    }
    
    await connection.end();
    console.log(`\n🎉 Baza testowa ${testDbName} została utworzona i wypełniona danymi!`);
    console.log('\nAby używać bazy testowej, zmień DATABASE_NAME w .env.local na: ToDo_Test');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

createTestDatabase();