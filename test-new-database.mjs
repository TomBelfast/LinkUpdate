import mysql from 'mysql2/promise';

async function testNewDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo_Test',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą testową działa');
    
    // Sprawdź tabele
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tabele w bazie testowej:', tables);
    
    // Sprawdź użytkowników
    const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 5');
    console.log('Użytkownicy w bazie testowej:', users);
    
    // Sprawdź inne tabele
    const [links] = await connection.execute('SELECT COUNT(*) as count FROM links');
    console.log('Liczba linków:', links[0].count);
    
    const [ideas] = await connection.execute('SELECT COUNT(*) as count FROM ideas');
    console.log('Liczba pomysłów:', ideas[0].count);
    
    await connection.end();
    console.log('✅ Baza testowa jest gotowa do użycia!');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testNewDatabase();