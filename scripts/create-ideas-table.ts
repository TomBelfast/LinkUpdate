import { getDb } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function createIdeasTable() {
  try {
    console.log('Tworzenie tabeli ideas...');
    
    const db = await getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ideas (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Tabela ideas została utworzona pomyślnie!');
  } catch (error) {
    console.error('Błąd podczas tworzenia tabeli ideas:', error);
  } finally {
    process.exit(0);
  }
}

createIdeasTable(); 