import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testLoginSystem() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT)
  });
  
  try {
    console.log('=== TESTING LOGIN SYSTEM ===');
    
    // 1. Sprawdź użytkowników w bazie
    const [users] = await connection.execute('SELECT id, name, email, password FROM users');
    console.log('\n1. Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
    });
    
    // 2. Test hasła dla Tomasz
    const testEmail = 'tomaszpasiekauk@gmail.com';
    const testPassword = 'Swiat1976@#';
    
    const [tomaszUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (tomaszUsers.length === 0) {
      console.log('\n❌ User not found!');
      return;
    }
    
    const user = tomaszUsers[0];
    console.log(`\n2. Testing login for: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password hash in DB: ${user.password}`);
    
    // 3. Test bcrypt comparison
    try {
      const isPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log(`\n3. Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isPasswordValid) {
        console.log('Password comparison failed. Let me create a new hash...');
        
        // Create new hash
        const newHash = await bcrypt.hash(testPassword, 12);
        console.log(`New hash: ${newHash}`);
        
        // Update in database
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, testEmail]
        );
        
        console.log('✅ Password updated in database');
        
        // Test again
        const isNewPasswordValid = await bcrypt.compare(testPassword, newHash);
        console.log(`New password verification: ${isNewPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      }
      
    } catch (error) {
      console.error('❌ Error during password comparison:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testLoginSystem();