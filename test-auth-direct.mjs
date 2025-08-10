import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Skopiuj funkcję executeQuery z lib/db-pool.ts
let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST || '192.168.0.250',
      user: process.env.DATABASE_USER || 'testToDo', 
      password: process.env.DATABASE_PASSWORD || 'testToDo',
      database: process.env.DATABASE_NAME || 'ToDo_Test',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      multipleStatements: true,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

async function executeQuery(query, values = []) {
  const pool = getPool();
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error("Database query execution failed:", error);
    throw error;
  }
}

async function testAuthFlow() {
  try {
    console.log('=== TESTING AUTH FLOW (like NextAuth) ===');
    
    const email = 'tomaszpasiekauk@gmail.com';
    const password = 'Swiat1976@#';
    
    console.log(`\n1. Looking for user: ${email}`);
    
    // Exactly like in NextAuth
    const users = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    console.log(`Found ${users.length} users`);
    
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    const user = users[0];
    console.log(`\n2. User found: ${user.name}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Has password: ${!!user.password}`);
    
    if (!user.password || typeof user.password !== 'string') {
      console.log('❌ Invalid password field');
      return;
    }
    
    console.log(`\n3. Testing password comparison...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
    
    if (isPasswordValid) {
      console.log('\n4. ✅ AUTH SUCCESS - User should be able to log in');
      console.log('Returned user object would be:', {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: 'user',
      });
    } else {
      console.log('\n4. ❌ AUTH FAILED - Password mismatch');
    }
    
  } catch (error) {
    console.error('❌ Auth flow error:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testAuthFlow();