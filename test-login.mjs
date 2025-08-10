import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Funkcja porównująca hasło z haszem - taka sama jak w aplikacji
async function comparePassword(password, hash) {
  const [salt, hashedValue] = hash.split('$');
  if (!salt || !hashedValue) return false;
  const compareHash = crypto.createHash('sha256');
  compareHash.update(salt + password);
  const compareValue = compareHash.digest('hex');
  return compareValue === hashedValue;
}

async function testLogin() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Sprawdź użytkownika test@test.com
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test@test.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Użytkownik test@test.com nie istnieje');
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
    console.log('Długość hashu:', user.password.length);
    console.log('Czy zawiera $:', user.password.includes('$'));
    
    // Testuj różne hasła
    const testPasswords = ['test', 'test123', 'password', '123456'];
    
    for (const testPassword of testPasswords) {
      console.log(`\nTestuję hasło: "${testPassword}"`);
      try {
        const isValid = await comparePassword(testPassword, user.password);
        console.log(`Wynik: ${isValid ? '✅ POPRAWNE' : '❌ NIEPOPRAWNE'}`);
      } catch (error) {
        console.log(`Błąd przy testowaniu hasła: ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\nPołączenie zamknięte');
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testLogin();