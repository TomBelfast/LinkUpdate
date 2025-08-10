import mysql from 'mysql2/promise';

async function addUserIdColumn() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Sprawdź czy kolumna user_id już istnieje
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ToDo' 
      AND TABLE_NAME = 'links' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Kolumna user_id już istnieje');
    } else {
      console.log('➕ Dodaję kolumnę user_id...');
      
      // Dodaj kolumnę user_id
      await connection.execute(`
        ALTER TABLE links 
        ADD COLUMN user_id VARCHAR(36) NULL 
        AFTER prompt
      `);
      
      // Dodaj indeks
      await connection.execute(`
        CREATE INDEX idx_links_user_id ON links(user_id)
      `);
      
      console.log('✅ Kolumna user_id została dodana pomyślnie');
    }
    
    // Sprawdź nową strukturę
    const [newStructure] = await connection.execute('DESCRIBE links');
    console.log('Nowa struktura tabeli links:');
    newStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    await connection.end();
    console.log('Migracja zakończona pomyślnie');
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

addUserIdColumn();