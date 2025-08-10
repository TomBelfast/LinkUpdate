import { executeQuery } from './lib/db-pool.ts';

async function testDbPool() {
  try {
    console.log('=== TESTING DB POOL ===');
    
    // Test basic query
    console.log('\n1. Testing basic query...');
    const result = await executeQuery('SELECT 1 as test');
    console.log('Basic query result:', result);
    
    // Test user query
    console.log('\n2. Testing user query...');
    const users = await executeQuery(
      'SELECT id, name, email FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    console.log('User query result:', users);
    
    // Test password query (like in NextAuth)
    console.log('\n3. Testing full user query with password...');
    const fullUsers = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    console.log('Full user query result:', fullUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      hasPassword: !!u.password,
      passwordLength: u.password ? u.password.length : 0
    })));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDbPool();