import mysql from 'mysql2/promise';

async function checkUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Sprawdź strukturę tabeli users
    try {
      const [structure] = await connection.execute('DESCRIBE users');
      console.log('Struktura tabeli users:', structure);
      
      // Sprawdź czy są jacyś użytkownicy
      const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 5');
      console.log('Użytkownicy w bazie:', users);
      
    } catch (err) {
      console.log('Błąd przy sprawdzaniu tabeli users:', err.message);
    }
    
    await connection.end();
    console.log('Połączenie zamknięte');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

checkUsersTable();