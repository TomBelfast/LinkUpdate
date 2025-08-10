import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';

async function main() {
  console.log('Rozpoczynanie inicjalizacji bazy danych...');
  
  console.log('Próba połączenia z bazą danych...');
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  console.log('Połączenie z bazą danych ustanowione.');
  
  const db = drizzle(connection);
  console.log('Obiekt drizzle utworzony.');

  console.log('Rozpoczynanie migracji...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migracja zakończona pomyślnie.');

  await connection.end();
  console.log('Połączenie z bazą danych zamknięte.');
}

main().catch((error) => {
  console.error('Błąd podczas inicjalizacji bazy danych:', error);
  process.exit(1);
});
