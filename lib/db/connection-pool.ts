import mysql from 'mysql2/promise';

/**
 * Database Connection Pool Manager
 * Provides efficient connection reuse and management
 */
class DatabasePool {
  private pool: mysql.Pool | null = null;
  private static instance: DatabasePool;
  
  /**
   * Singleton pattern to ensure single pool instance
   */
  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }
  
  /**
   * Get or create the database connection pool
   */
  async getPool(): Promise<mysql.Pool> {
    if (!this.pool) {
      console.log('🔄 Creating database connection pool...');
      
      this.pool = mysql.createPool({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'testToDo',
        password: process.env.DATABASE_PASSWORD || 'testToDo',
        database: process.env.DATABASE_NAME || 'ToDo',
        port: Number(process.env.DATABASE_PORT) || 3306,
        
        // Connection pool settings
        waitForConnections: true,
        connectionLimit: 10,        // Maximum 10 concurrent connections
        queueLimit: 0,             // No limit on queued requests
        
        // Connection health settings  
        idleTimeout: 300000,       // Close idle connections after 5 minutes
        maxIdle: 5,                // Keep max 5 idle connections
        
        // Security and performance
        ssl: false,                // Disable SSL for local development
        multipleStatements: false, // Security: prevent multiple statement attacks
        
        // Connection validation
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      
      // Event listeners for monitoring
      this.pool.on('connection', (connection) => {
        console.log(`📡 New connection established as id ${connection.threadId}`);
      });
      
      this.pool.on('error', (err) => {
        console.error('❌ Database pool error:', err);
      });
      
      console.log('✅ Database connection pool created successfully');
    }
    
    return this.pool;
  }
  
  /**
   * Execute a query using the connection pool
   */
  async execute(query: string, values: any[] = []): Promise<any> {
    try {
      const start = Date.now();
      const pool = await this.getPool();
      const [results] = await pool.execute(query, values);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗄️ Query executed in ${duration}ms: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
      }
      
      return results;
    } catch (error) {
      console.error('❌ Database query error:', {
        query: query.substring(0, 100),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  /**
   * Execute a query and return first row
   */
  async queryFirst(query: string, values: any[] = []): Promise<any> {
    const results = await this.execute(query, values);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
  
  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Get pool statistics for monitoring
   */
  async getPoolStats(): Promise<{
    totalConnections: number;
    allConnections: number;
    acquiringConnections: number;
    freeConnections: number;
  }> {
    const pool = await this.getPool();
    
    return {
      totalConnections: (pool as any)._allConnections?.length || 0,
      allConnections: (pool as any)._allConnections?.length || 0,
      acquiringConnections: (pool as any)._acquiringConnections?.length || 0,
      freeConnections: (pool as any)._freeConnections?.length || 0,
    };
  }
  
  /**
   * Close the connection pool (for cleanup)
   */
  async close(): Promise<void> {
    if (this.pool) {
      console.log('🔄 Closing database connection pool...');
      await this.pool.end();
      this.pool = null;
      console.log('✅ Database connection pool closed');
    }
  }
  
  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.execute('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dbPool = DatabasePool.getInstance();

// Export class for testing
export { DatabasePool };

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  connectionTime: number;
  poolStats: any;
}> {
  const start = Date.now();
  
  try {
    const isConnected = await dbPool.testConnection();
    const connectionTime = Date.now() - start;
    const poolStats = await dbPool.getPoolStats();
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (!isConnected) {
      status = 'unhealthy';
    } else if (connectionTime > 1000 || poolStats.freeConnections === 0) {
      status = 'degraded'; 
    } else {
      status = 'healthy';
    }
    
    return {
      status,
      connectionTime,
      poolStats
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connectionTime: Date.now() - start,
      poolStats: {}
    };
  }
}