import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function resetDatabase() {
  console.log('Rozpoczynanie resetowania bazy danych...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '31.104.221.233',
    user: process.env.DATABASE_USER || 'test1',
    password: process.env.DATABASE_PASSWORD || 'test1',
    database: process.env.DATABASE_NAME || 'BOLT',
    multipleStatements: true
  });

  try {
    // Usuwamy starą tabelę
    await connection.execute('DROP TABLE IF EXISTS `links`;');
    console.log('Stara tabela została usunięta');

    // Tworzymy nową tabelę
    await connection.execute(`
      CREATE TABLE links (
        id int NOT NULL AUTO_INCREMENT,
        url varchar(255) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        prompt text,
        image_data longtext,
        image_mime_type varchar(100),
        thumbnail_data mediumtext,
        thumbnail_mime_type varchar(100),
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('Nowa tabela została utworzona');

  } catch (error) {
    console.error('Błąd podczas resetowania bazy danych:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('Połączenie z bazą danych zostało zamknięte');
  }
}

resetDatabase().catch(console.error);
