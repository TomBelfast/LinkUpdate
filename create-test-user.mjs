import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Funkcja hashowania hasła - poprawiona wersja
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256');
  hash.update(salt + password);
  const hashedValue = salt + '$' + hash.digest('hex');
  return hashedValue;
}

async function createTestUser() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Usuń istniejącego użytkownika testowego jeśli istnieje
    await connection.execute('DELETE FROM users WHERE email = ?', ['testuser@example.com']);
    
    // Stwórz nowego użytkownika z poprawnym hasłem
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword('test123');
    
    console.log('Tworzę użytkownika z hasłem: test123');
    console.log('Hash hasła:', hashedPassword);
    
    await connection.execute(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'Test User', 'testuser@example.com', hashedPassword, 'user']
    );
    
    console.log('✅ Użytkownik testowy został utworzony:');
    console.log('Email: testuser@example.com');
    console.log('Hasło: test123');
    
    await connection.end();
    console.log('Połączenie zamknięte');
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

createTestUser();