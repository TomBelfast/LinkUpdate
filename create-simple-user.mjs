import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createSimpleUser() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT)
  });
  
  try {
    console.log('Creating simple test user...');
    
    const email = 'test@example.com';
    const password = 'test123';
    const name = 'Test User';
    
    // Delete if exists
    await connection.execute('DELETE FROM users WHERE email = ?', [email]);
    
    // Create new user
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await connection.execute(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, 'user']
    );
    
    console.log('✅ Simple test user created:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // Test the password
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(`Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createSimpleUser();