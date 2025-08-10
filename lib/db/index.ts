import { drizzle } from 'drizzle-orm/mysql2';
import mysql, { RowDataPacket, Pool } from 'mysql2/promise';
import * as schema from './schema';
import fs from 'fs/promises';
import path from 'path';

// Stałe konfiguracyjne
const CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 2000,
  CONNECTION_TIMEOUT: 60000,
  KEEPALIVE_DELAY: 10000,
  MAX_PREPARED_STATEMENTS: 16000,
  BATCH_SIZE: 10,
  POOL: {
    MIN_CONNECTIONS: 5,
    MAX_CONNECTIONS: 20,
    ACQUIRE_TIMEOUT: 30000,
    IDLE_TIMEOUT: 10000,
    MAX_QUEUE_SIZE: 100,
    QUEUE_TIMEOUT: 5000
  }
} as const;

// Flaga wskazująca czy migracja została już wykonana
let migrationCompleted = false;

// Interfejsy dla typów
interface Migration extends RowDataPacket {
  name: string;
  executed_at: Date;
}

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// Funkcja do pobierania konfiguracji bazy danych
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DATABASE_HOST || '192.168.0.250',
    user: process.env.DATABASE_USER || 'test1',
    password: process.env.DATABASE_PASSWORD || 'test1',
    database: process.env.DATABASE_NAME || 'BOLT',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  };
}

// Funkcja do wykonywania migracji
async function runMigrations(connection: mysql.Connection) {
  try {
    const migrationsPath = path.join(process.cwd(), 'drizzle');
    const migrationFiles = await fs.readdir(migrationsPath);
    const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql'));

    // Tworzenie tabeli migracji jeśli nie istnieje
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS _drizzle_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pobieranie wykonanych migracji
    const [executedMigrations] = await connection.execute<Migration[]>(
      'SELECT name FROM _drizzle_migrations'
    );
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

    // Wykonywanie nowych migracji
    for (const file of sqlFiles) {
      if (!executedMigrationNames.has(file)) {
        const migrationContent = await fs.readFile(
          path.join(migrationsPath, file),
          'utf8'
        );

        await connection.beginTransaction();
        try {
          await connection.execute(migrationContent);
          await connection.execute(
            'INSERT INTO _drizzle_migrations (name) VALUES (?)',
            [file]
          );
          await connection.commit();
          console.log(`✅ Migracja ${file} wykonana pomyślnie`);
        } catch (error) {
          await connection.rollback();
          throw error;
        }
      }
    }

    migrationCompleted = true;
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania migracji:', error);
    throw error;
  }
}

// Klasa do zarządzania pulą połączeń
class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;
  private isInitialized: boolean = false;

  private constructor() {
    const config = getDatabaseConfig();
    this.pool = mysql.createPool({
      ...config,
      connectionLimit: CONFIG.POOL.MAX_CONNECTIONS,
      queueLimit: CONFIG.POOL.MAX_QUEUE_SIZE,
      waitForConnections: true,
      multipleStatements: true,
      charset: 'utf8mb4',
      connectTimeout: CONFIG.CONNECTION_TIMEOUT,
      enableKeepAlive: true,
      keepAliveInitialDelay: CONFIG.KEEPALIVE_DELAY,
      maxPreparedStatements: CONFIG.MAX_PREPARED_STATEMENTS,
      namedPlaceholders: true,
      dateStrings: true,
      acquireTimeout: CONFIG.POOL.ACQUIRE_TIMEOUT,
      idleTimeout: CONFIG.POOL.IDLE_TIMEOUT,
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
    });

    // Obsługa zdarzeń puli
    this.pool.on('acquire', (connection) => {
      console.debug('Połączenie pobrane z puli');
    });

    this.pool.on('connection', (connection) => {
      console.debug('Nowe połączenie utworzone');
    });

    this.pool.on('release', (connection) => {
      console.debug('Połączenie zwrócone do puli');
    });

    this.pool.on('enqueue', () => {
      console.warn('Oczekiwanie na dostępne połączenie');
    });

    this.pool.on('error', (err) => {
      console.error('Błąd puli połączeń:', err);
    });
  }

  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test połączenia i wykonanie migracji
      const connection = await this.pool.getConnection();
      try {
        await connection.execute('SELECT 1');
        console.log('✅ Połączenie z bazą danych działa poprawnie');

        if (!migrationCompleted) {
          await runMigrations(connection);
        }

        this.isInitialized = true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('❌ Błąd podczas inicjalizacji puli:', error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }
}

// Singleton dla instancji Drizzle
let dbInstance: ReturnType<typeof drizzle> | null = null;

// Funkcja do pobierania instancji bazy danych
export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (!dbInstance) {
    try {
      const pool = DatabasePool.getInstance();
      await pool.initialize();
      dbInstance = drizzle(pool.getPool(), { schema, mode: 'default' });
    } catch (error) {
      console.error('Błąd podczas tworzenia połączenia:', error);
      throw error;
    }
  }
  return dbInstance;
}

// Funkcja do zamykania połączenia
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await DatabasePool.getInstance().end();
    dbInstance = null;
  }
}

// Eksport typów
export type Database = typeof db; 