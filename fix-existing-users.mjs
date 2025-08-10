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

async function fixExistingUsers() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Pobierz wszystkich użytkowników z błędnymi hasłami
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE email IN (?, ?)',
      ['test@test.com', 'test1@test.com']
    );
    
    console.log(`Znaleziono ${users.length} użytkowników do naprawy`);
    
    for (const user of users) {
      console.log(`\nNaprawiam użytkownika: ${user.email}`);
      
      // Ustaw domyślne hasło na podstawie emaila
      let defaultPassword;
      if (user.email === 'test@test.com') {
        defaultPassword = 'test123';
      } else if (user.email === 'test1@test.com') {
        defaultPassword = 'test123';
      }
      
      const hashedPassword = await hashPassword(defaultPassword);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`✅ Zaktualizowano hasło dla ${user.email} na: ${defaultPassword}`);
    }
    
    await connection.end();
    console.log('\n✅ Wszystkie hasła zostały naprawione');
    console.log('\nMożesz teraz zalogować się używając:');
    console.log('test@test.com / test123');
    console.log('test1@test.com / test123');
    console.log('testuser@example.com / test123');
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

fixExistingUsers();