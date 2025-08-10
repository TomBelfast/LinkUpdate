import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.250',
      user: 'testToDo',
      password: 'testToDo',
      database: 'ToDo',
      port: 3306
    });
    
    console.log('✅ Połączenie z bazą danych działa');
    
    // Sprawdź istniejące tabele
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tabele w bazie:', tables);
    
    // Sprawdź strukturę tabeli links jeśli istnieje
    try {
      const [structure] = await connection.execute('DESCRIBE links');
      console.log('Struktura tabeli links:', structure);
    } catch (err) {
      console.log('Tabela links nie istnieje:', err.message);
    }
    
    await connection.end();
    console.log('Połączenie zamknięte');
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

testConnection();