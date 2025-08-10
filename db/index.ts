import { drizzle } from 'drizzle-orm/mysql2';
import mysql, { RowDataPacket } from 'mysql2/promise';
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
  BATCH_SIZE: 10, // Liczba zapytań wykonywanych w jednej transakcji
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

// Cache dla plików migracji
const migrationFileCache = new Map<string, string>();

// Pobierz konfigurację bazy danych
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DATABASE_HOST || '192.168.0.250',
    user: process.env.DATABASE_USER || 'testToDo',
    password: process.env.DATABASE_PASSWORD || 'testToDo',
    database: process.env.DATABASE_NAME || 'ToDo_Test',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  };
}

// Funkcja do wykonywania migracji z obsługą transakcji
export async function runMigrations(connection: mysql.Connection): Promise<void> {
  // Sprawdź czy migracja już została wykonana
  if (migrationCompleted) {
    console.log('Migracja została już wykonana w tej sesji.');
    return;
  }

  try {
    console.log('Rozpoczynam migrację...');
    
    await connection.beginTransaction();
    
    try {
      // Utwórz tabelę migracji jeśli nie istnieje
      await connection.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Pobierz listę wykonanych migracji
      const [executedMigrations] = await connection.query<Migration[]>('SELECT name, executed_at FROM migrations');
      const executedMigrationSet = new Set(executedMigrations.map(m => m.name));

      // Odczytaj i przygotuj pliki migracji
      const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
      const migrationFiles = (await fs.readdir(migrationsDir))
        .filter(file => file.endsWith('.sql'))
        .sort((a, b) => {
          const numA = parseInt(a.split('_')[0]);
          const numB = parseInt(b.split('_')[0]);
          return numA - numB;
        });

      let migrationsExecuted = false;

      // Wykonaj migracje sekwencyjnie
      for (const migrationFile of migrationFiles) {
        if (!executedMigrationSet.has(migrationFile)) {
          console.log(`Wykonuję migrację: ${migrationFile}`);
          
          // Użyj cache'u dla plików migracji
          let migrationSql = migrationFileCache.get(migrationFile);
          if (!migrationSql) {
            const migrationPath = path.join(migrationsDir, migrationFile);
            migrationSql = await fs.readFile(migrationPath, 'utf8');
            migrationFileCache.set(migrationFile, migrationSql);
          }

          const queries = migrationSql
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

          // Wykonaj zapytania sekwencyjnie
          for (const query of queries) {
            if (query.toLowerCase().startsWith('set ') || query.toLowerCase().startsWith('-- ')) {
              await connection.query(query);
            } else {
              await connection.execute(query);
            }
          }

          await connection.execute(
            'INSERT INTO migrations (name) VALUES (?) ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP',
            [migrationFile]
          );

          migrationsExecuted = true;
          console.log(`Migracja ${migrationFile} zakończona pomyślnie`);
        }
      }

      await connection.commit();
      
      if (migrationsExecuted) {
        console.log('Wykonano nowe migracje!');
      } else {
        console.log('Brak nowych migracji do wykonania.');
      }

      // Ustaw flagę, że migracja została wykonana
      migrationCompleted = true;

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    throw error;
  }
}

// Funkcja do tworzenia połączenia z obsługą ponownych prób
async function createConnection(retryCount = 0): Promise<ReturnType<typeof drizzle>> {
  try {
    const config = getDatabaseConfig();
    const connection = await mysql.createConnection({
      ...config,
      multipleStatements: true,
      charset: 'utf8mb4',
      connectTimeout: CONFIG.CONNECTION_TIMEOUT,
      enableKeepAlive: true,
      keepAliveInitialDelay: CONFIG.KEEPALIVE_DELAY,
      maxPreparedStatements: CONFIG.MAX_PREPARED_STATEMENTS,
      namedPlaceholders: true,
      dateStrings: true,
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

    // Obsługa zdarzeń połączenia
    connection.on('error', async (err: mysql.QueryError) => {
      console.error('Błąd połączenia z bazą danych:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('Próba ponownego połączenia...');
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return createConnection(retryCount + 1);
      }
      throw err;
    });

    // Test połączenia
    await connection.execute('SELECT 1');
    console.log('✅ Połączenie z bazą danych działa poprawnie');

    // Wykonaj migrację tylko jeśli nie została jeszcze wykonana
    if (!migrationCompleted) {
      await runMigrations(connection);
    }

    return drizzle(connection, { schema, mode: 'default' });

  } catch (err) {
    console.error('❌ Błąd podczas inicjalizacji połączenia:', err);
    
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`Ponowna próba połączenia (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return createConnection(retryCount + 1);
    }
    
    throw new Error(`Nie udało się połączyć z bazą danych po ${CONFIG.MAX_RETRIES} próbach`);
  }
}

// Singleton dla instancji bazy danych
let dbInstance: ReturnType<typeof drizzle> | null = null;

// Funkcja do pobierania instancji bazy danych
export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (!dbInstance) {
    try {
      dbInstance = await createConnection();
    } catch (error) {
      console.error('Błąd podczas tworzenia połączenia:', error);
      throw error;
    }
  }
  return dbInstance;
}

export async function getDbInstance(): Promise<ReturnType<typeof drizzle>> {
  if (!dbInstance) {
    dbInstance = await getDb();
  }
  return dbInstance;
}

// Eksportujemy bezpośrednio funkcję getDb dla kompatybilności
export { getDb as db };

// Obsługa zamykania połączenia
process.on('SIGINT', async () => {
  if (dbInstance) {
    try {
      console.log('Zamykanie połączenia z bazą danych...');
      const connection = (dbInstance as any).connection;
      if (connection?.end) {
        await connection.end();
        console.log('Połączenie z bazą danych zostało zamknięte');
      }
    } catch (error) {
      console.error('Błąd podczas zamykania połączenia:', error);
    }
  }
  process.exit(0);
});

// Obsługa nieoczekiwanych błędów
process.on('unhandledRejection', (error) => {
  console.error('Nieobsłużony błąd Promise:', error);
  if (dbInstance) {
    const connection = (dbInstance as any).connection;
    if (connection?.end) {
      connection.end().catch(console.error);
    }
  }
});
