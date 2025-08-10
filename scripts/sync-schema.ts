import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface MySQLError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

async function syncSchema() {
  console.log('Rozpoczynanie synchronizacji schematu...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '192.168.0.250',
    user: process.env.DATABASE_USER || 'testToDo',
    password: process.env.DATABASE_PASSWORD || 'testToDo',
    database: process.env.DATABASE_NAME || 'ToDo_Test',
    multipleStatements: true
  });

  try {
    // 1. Pobierz aktualny schemat tabeli
    const [tableInfo] = await connection.execute('SHOW CREATE TABLE `links`');
    console.log('Aktualny schemat tabeli:', tableInfo);

    // 2. Tworzymy nową tabelę z poprawną strukturą
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`links_new\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`url\` varchar(255) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text,
        \`prompt\` text,
        \`image_data\` LONGBLOB,
        \`image_mime_type\` varchar(100),
        \`thumbnail_data\` LONGBLOB,
        \`thumbnail_mime_type\` varchar(100),
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Utworzono nową tabelę');

    // 3. Kopiujemy dane ze starej tabeli do nowej
    await connection.execute(`
      INSERT INTO \`links_new\` (
        id, url, title, description, prompt, 
        image_data, image_mime_type, 
        thumbnail_data, thumbnail_mime_type, 
        created_at, updated_at
      )
      SELECT 
        id, url, title, description, prompt,
        image_data, image_mime_type,
        thumbnail_data, thumbnail_mime_type,
        created_at, updated_at
      FROM \`links\`;
    `);
    console.log('Skopiowano dane');

    // 4. Usuwamy starą tabelę i zmieniamy nazwę nowej
    await connection.execute('DROP TABLE `links`;');
    await connection.execute('RENAME TABLE `links_new` TO `links`;');
    console.log('Zaktualizowano strukturę tabeli');

    // 5. Sprawdzamy końcowy schemat
    const [finalSchema] = await connection.execute('SHOW CREATE TABLE `links`');
    console.log('Końcowy schemat tabeli:', finalSchema);

  } catch (error) {
    const mysqlError = error as MySQLError;
    console.error('Błąd podczas synchronizacji schematu:', mysqlError);
    
    // Próba wycofania zmian w przypadku błędu
    try {
      await connection.execute('DROP TABLE IF EXISTS `links_new`;');
    } catch (rollbackError) {
      console.error('Błąd podczas wycofywania zmian:', rollbackError);
    }
    
    throw error;
  } finally {
    await connection.end();
    console.log('Połączenie z bazą danych zostało zamknięte');
  }
}

syncSchema().catch(console.error);
