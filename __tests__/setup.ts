import { beforeAll } from 'vitest';
import * as dotenv from 'dotenv';

beforeAll(() => {
  // Wczytanie zmiennych środowiskowych
  dotenv.config({ path: '.env.development.local' });
}); 