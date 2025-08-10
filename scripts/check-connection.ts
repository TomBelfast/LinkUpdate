import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../lib/db/schema';

async function main() {
  const connection = await mysql.createConnection({
    host: '192.168.0.250',
    user: 'testToDo',
    password: 'testToDo',
    database: 'ToDo'
  });

  const db = drizzle(connection);

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Połączenie udane!');
    console.log('Tabele w bazie danych:');
    console.log(tables);
  } catch (error) {
    console.error('Błąd połączenia:', error);
  } finally {
    await connection.end();
  }
}

main(); 