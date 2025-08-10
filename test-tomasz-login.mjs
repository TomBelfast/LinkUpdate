import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Funkcja porównująca hasło z haszem - poprawiona wersja
async function comparePassword(password, hash) {
  const [salt, hashedValue] = hash.split('$');
  if (!salt || !hashedValue) return false;
  const compareHash = crypto.createHash('sha256');
  compareHash.update(salt + password);
  const compareValue = compareHash.digest('hex');
  return compareValue === hashedValue;
}

async function testTomaszLogin() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo_Test',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Sprawdź użytkownika Tomasz
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Użytkownik tomaszpasiekauk@gmail.com nie istnieje');
      return;
    }
    
    const user = users[0];
    console.log('Znaleziony użytkownik:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    console.log('Hash hasła w bazie:', user.password);
    
    // Testuj poprawne hasło
    const correctPassword = 'Swiat1976@#$';
    console.log(`\nTestuję poprawne hasło: "${correctPassword}"`);
    
    const isValid = await comparePassword(correctPassword, user.password);
    console.log(`Wynik: ${isValid ? '✅ POPRAWNE' : '❌ NIEPOPRAWNE'}`);
    
    // Testuj błędne hasło
    const wrongPassword = 'wrongpassword';
    console.log(`\nTestuję błędne hasło: "${wrongPassword}"`);
    
    const isWrongValid = await comparePassword(wrongPassword, user.password);
    console.log(`Wynik: ${isWrongValid ? '✅ POPRAWNE' : '❌ NIEPOPRAWNE'}`);
    
    await connection.end();
    console.log('\nPołączenie zamknięte');
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testTomaszLogin();