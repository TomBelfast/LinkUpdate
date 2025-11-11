import mysql from 'mysql2/promise';
import { env } from './env';

// Database connection pool configuration
// SECURITY: All credentials come from validated environment variables
// No fallback values - application will fail fast if configuration is invalid
const POOL_CONFIG = {
  host: env.DATABASE_HOST,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  port: env.DATABASE_PORT,

  // Connection pool settings (optimized for production)
  connectionLimit: 50, // Increased for production load
  queueLimit: 100, // Prevent memory exhaustion
  acquireTimeout: 10000, // 10 seconds (reduced from 60s)
  timeout: 10000, // 10 seconds
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