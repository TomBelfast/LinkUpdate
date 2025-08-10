import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixUserPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT)
  });
  
  try {
    console.log('Fixing user password to use bcrypt...');
    
    const plainPassword = 'Swiat1976@#$';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    console.log('New bcrypt hash:', hashedPassword);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'tomaszpasiekauk@gmail.com']
    );
    
    console.log('✅ Password updated for tomaszpasiekauk@gmail.com');
    
    // Test the password
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    if (users.length > 0) {
      const isValid = await bcrypt.compare(plainPassword, users[0].password);
      console.log('Password verification test:', isValid ? '✅ PASS' : '❌ FAIL');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixUserPassword();