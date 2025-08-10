import mysql from 'mysql2/promise';

// Database connection pool configuration
const POOL_CONFIG = {
  host: process.env.DATABASE_HOST || '192.168.0.250',
  user: process.env.DATABASE_USER || 'testToDo', 
  password: process.env.DATABASE_PASSWORD || 'testToDo',
  database: process.env.DATABASE_NAME || 'ToDo_Test',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  // Connection pool settings
  connectionLimit: 10, // Maximum number of connections in pool
  queueLimit: 0, // No queue limit
  acquireTimeout: 60000, // 60 seconds
  timeout: 60000, // 60 seconds
  reconnect: true,
  multipleStatements: true,
  charset: 'utf8mb4',
  // Keep connections alive
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true,
  // Connection flags for MySQL
  flags: [
    '-FOUND_ROWS',
    '-IGNORE_SPACE', 
    '+LONG_FLAG',
    '+LONG_PASSWORD',
    '+PROTOCOL_41',
    '+TRANSACTIONS',
    '+MULTI_RESULTS',
    '+PS_MULTI_RESULTS',
    '+SECURE_CONNECTION',
    '+CONNECT_WITH_DB'
  ],
};

// Create the connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(POOL_CONFIG);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Pool will automatically reconnect
        console.log('Database connection lost, pool will reconnect...');
      }
    });
  }
  
  return pool;
}

// Execute query with connection pool
export async function executeQuery(query: string, values: any[] = []) {
  const pool = getPool();
  
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error: any) {
    console.error("Database query execution failed:", { 
      code: error.code, 
      sqlState: error.sqlState,
      message: error.message 
    });
    throw error;
  }
}

// Execute transaction with connection pool
export async function executeTransaction(queries: Array<{ query: string, values?: any[] }>) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, values = [] } of queries) {
      const [result] = await connection.execute(query, values);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});