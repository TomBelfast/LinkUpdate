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

async function addTomaszUser() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo_Test',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą testową działa');
    
    // Sprawdź czy użytkownik już istnieje
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('Użytkownik już istnieje, aktualizuję hasło...');
      
      const hashedPassword = await hashPassword('Swiat1976@#$');
      
      await connection.execute(
        'UPDATE users SET password = ?, name = ? WHERE email = ?',
        [hashedPassword, 'Tomasz Pasieka', 'tomaszpasiekauk@gmail.com']
      );
      
      console.log('✅ Hasło użytkownika zostało zaktualizowane');
    } else {
      // Stwórz nowego użytkownika
      const userId = crypto.randomUUID();
      const hashedPassword = await hashPassword('Swiat1976@#$');
      
      console.log('Tworzę nowego użytkownika...');
      console.log('Email: tomaszpasiekauk@gmail.com');
      console.log('Hasło: Swiat1976@#$');
      console.log('Hash hasła:', hashedPassword);
      
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Tomasz Pasieka', 'tomaszpasiekauk@gmail.com', hashedPassword, 'user']
      );
      
      console.log('✅ Nowy użytkownik został utworzony');
    }
    
    // Sprawdź czy użytkownik został dodany/zaktualizowany
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    console.log('Dane użytkownika w bazie:', users[0]);
    
    await connection.end();
    console.log('\n✅ Użytkownik tomaszpasiekauk@gmail.com jest gotowy do logowania!');
    console.log('Hasło: Swiat1976@#$');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

addTomaszUser();