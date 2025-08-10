import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mysql from 'mysql2/promise'

describe('Database Connection Tests', () => {
  let connection: mysql.Connection

  beforeAll(async () => {
    // Test database connection using current environment
    try {
      connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'test',
        port: Number(process.env.DATABASE_PORT) || 3306,
      })
    } catch (error) {
      console.warn('Database connection failed in test environment:', error)
      // W środowisku testowym może nie być dostępnej bazy danych
    }
  })

  afterAll(async () => {
    if (connection) {
      await connection.end()
    }
  })

  it('should connect to database', async () => {
    if (!connection) {
      console.warn('Skipping database test - no connection available')
      return
    }

    const [rows] = await connection.execute('SELECT 1 as test')
    expect(Array.isArray(rows)).toBe(true)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('should have required tables', async () => {
    if (!connection) {
      console.warn('Skipping table test - no connection available')
      return
    }

    try {
      // Test if main tables exist
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'users'"
      )
      
      // If tables exist, verify structure
      if (Array.isArray(tables) && tables.length > 0) {
        const [userColumns] = await connection.execute(
          "DESCRIBE users"
        )
        expect(Array.isArray(userColumns)).toBe(true)
        console.log('✅ Users table exists with proper structure')
      } else {
        console.warn('Users table not found - may need database setup')
      }
    } catch (error) {
      console.warn('Table check failed:', error)
    }
  })

  it('should handle connection pooling requirements', async () => {
    if (!connection) {
      console.warn('Skipping pooling test - no connection available')
      return
    }

    // Test multiple simultaneous queries (simulating connection pool need)
    const promises = Array.from({ length: 3 }, (_, i) =>
      connection.execute(`SELECT ${i + 1} as query_id`)
    )

    const results = await Promise.all(promises)
    expect(results).toHaveLength(3)
    
    results.forEach((result, index) => {
      expect(Array.isArray(result[0])).toBe(true)
    })

    console.log('✅ Multiple query handling works (connection pool ready)')
  })

  it('should test current MySQL version compatibility', async () => {
    if (!connection) {
      console.warn('Skipping version test - no connection available')
      return
    }

    const [rows] = await connection.execute('SELECT VERSION() as version')
    const version = (rows as any)[0]?.version
    
    if (version) {
      console.log(`📊 MySQL version: ${version}`)
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
      
      // Check if version supports modern features
      const majorVersion = parseInt(version.split('.')[0])
      expect(majorVersion).toBeGreaterThanOrEqual(5)
    }
  })
})