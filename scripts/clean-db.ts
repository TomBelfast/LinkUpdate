import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function cleanDatabase() {
  console.log('Rozpoczynanie czyszczenia bazy danych...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '31.104.221.233',
    user: process.env.DATABASE_USER || 'test1',
    password: process.env.DATABASE_PASSWORD || 'test1',
    database: process.env.DATABASE_NAME || 'BOLT',
    multipleStatements: true
  });

  try {
    // Najpierw usuwamy wszystkie tabele i indeksy - każda komenda w osobnej linii
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.execute('DROP TABLE IF EXISTS `links`;');
    await connection.execute('DROP TABLE IF EXISTS `_drizzle_migrations`;');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Stare tabele zostały usunięte');

    // Tworzymy nową tabelę z jednym kluczem głównym
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`links\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`url\` varchar(255) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text,
        \`prompt\` text,
        \`image_data\` longtext,
        \`image_mime_type\` varchar(100),
        \`thumbnail_data\` mediumtext,
        \`thumbnail_mime_type\` varchar(100),
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Nowa tabela została utworzona');

    // Sprawdzamy strukturę tabeli
    const [rows] = await connection.execute('SHOW CREATE TABLE `links`;');
    console.log('Struktura nowej tabeli:', rows);

  } catch (error) {
    console.error('Błąd podczas czyszczenia bazy danych:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('Połączenie z bazą danych zostało zamknięte');
  }
}

cleanDatabase().catch(console.error);
