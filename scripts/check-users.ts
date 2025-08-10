import mysql from 'mysql2/promise';
import crypto from 'crypto';

async function checkUsers() {
  try {
    // Sprawdź konfigurację bazy
    if (!process.env.DATABASE_HOST) {
      console.log('Brak konfiguracji bazy danych. Sprawdź zmienne środowiskowe:');
      console.log('DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_PORT');
      return;
    }

    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT)
    });

    console.log('Połączono z bazą danych.');

    // Sprawdź czy tabela users istnieje
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('Tabela "users" nie istnieje.');
      
      // Sprawdź alternatywną nazwę "user"
      const [userTable] = await connection.execute('SHOW TABLES LIKE "user"');
      if (Array.isArray(userTable) && userTable.length === 0) {
        console.log('Tabela "user" też nie istnieje.');
        await connection.end();
        return;
      } else {
        console.log('Znaleziono tabelę "user".');
      }
    }

    // Sprawdź użytkowników w tabeli users
    try {
      const [users] = await connection.execute('SELECT id, email, name, role FROM users LIMIT 10');
      console.log('Użytkownicy w tabeli "users":', users);
    } catch (e) {
      // Spróbuj z tabelą "user"
      try {
        const [users] = await connection.execute('SELECT id, email, name FROM user LIMIT 10');
        console.log('Użytkownicy w tabeli "user":', users);
      } catch (e2) {
        console.log('Błąd przy pobieraniu użytkowników:', e2);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Błąd:', error);
  }
}

// Funkcja do dodania użytkownika testowego
async function addTestUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT)
    });

    // Hasło: test123
    const password = 'test123';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(salt + password);
    const hashedPassword = salt + '$' + hash.digest('hex');

    const userId = crypto.randomUUID();
    
    try {
      await connection.execute(
        'INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)',
        [userId, 'test@test.com', 'Test User', hashedPassword, 'user']
      );
      console.log('Dodano użytkownika testowego: test@test.com / test123');
    } catch (e) {
      // Spróbuj z tabelą "user"
      await connection.execute(
        'INSERT INTO user (id, email, name, password) VALUES (?, ?, ?, ?)',
        [userId, 'test@test.com', 'Test User', hashedPassword]
      );
      console.log('Dodano użytkownika testowego do tabeli "user": test@test.com / test123');
    }

    await connection.end();
  } catch (error) {
    console.error('Błąd przy dodawaniu użytkownika:', error);
  }
}

if (process.argv.includes('--add-user')) {
  addTestUser();
} else {
  checkUsers();
}