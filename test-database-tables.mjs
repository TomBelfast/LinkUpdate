import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function testDatabaseTables() {
  let connection;
  
  try {
    console.log('=== TESTING DATABASE TABLES ===');
    
    const config = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT)
    };
    
    console.log('Connecting to database:', {
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port
    });
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Sprawdź wszystkie tabele
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables);
    
    // Sprawdź strukturę tabeli ideas
    try {
      const [ideasStructure] = await connection.execute('DESCRIBE ideas');
      console.log('📊 Ideas table structure:', ideasStructure);
    } catch (error) {
      console.log('❌ Ideas table does not exist:', error.message);
    }
    
    // Sprawdź strukturę tabeli links
    try {
      const [linksStructure] = await connection.execute('DESCRIBE links');
      console.log('📊 Links table structure:', linksStructure);
    } catch (error) {
      console.log('❌ Links table does not exist:', error.message);
    }
    
    // Sprawdź strukturę tabeli users
    try {
      const [usersStructure] = await connection.execute('DESCRIBE users');
      console.log('📊 Users table structure:', usersStructure);
    } catch (error) {
      console.log('❌ Users table does not exist:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testDatabaseTables();