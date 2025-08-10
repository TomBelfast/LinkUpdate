import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

export default {
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST || '192.168.0.250',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'testToDo',
    password: process.env.DB_PASSWORD || 'testToDo',
    database: process.env.DB_NAME || 'ToDo'
  }
} satisfies Config; 