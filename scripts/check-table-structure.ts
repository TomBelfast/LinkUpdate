import mysql from 'mysql2/promise';

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT)
    });

    console.log('Struktura tabeli "user":');
    const [columns] = await connection.execute('DESCRIBE user');
    console.log(columns);

    await connection.end();
  } catch (error) {
    console.error('Błąd:', error);
  }
}

checkTableStructure();