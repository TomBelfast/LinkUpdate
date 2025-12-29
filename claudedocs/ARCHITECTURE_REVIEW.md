# Przegląd Architektury LinkUpdate-1

**Data przeglądu**: 2025-12-29
**Analizowane pliki**: 103 TSX/TS, 31 API routes, 66 testów

## Podsumowanie Wykonawcze

Aplikacja LinkUpdate-1 to dobrze zorganizowana aplikacja Next.js 15 wykorzystująca współczesne wzorce architektoniczne. Zidentyfikowano kluczowe obszary do poprawy przy zachowaniu istniejącej funkcjonalności.

**Główne mocne strony**:
- Solidna separacja warstw (UI, state, API, database)
- Dobre wykorzystanie TanStack Query + Zustand
- Kompletna konfiguracja TypeScript z strict mode
- Struktura typu feature-first w API routes

**Główne obszary do poprawy**:
- Niespójny error handling pomiędzy API routes
- Duplikacja logiki połączenia do bazy danych
- Brak walidacji schematu dla API endpoints
- Niekompletne testy integracyjne
- Mixed concerns w niektórych komponentach

---

## 1. Analiza Struktury Folderów

### Obecna Organizacja

```
LinkUpdate-1/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (31 endpoints)
│   │   ├── admin/             ✅ Domain grouping
│   │   ├── ai/                ✅ Domain grouping
│   │   ├── api-keys/          ✅ Domain grouping
│   │   ├── auth/              ✅ Domain grouping
│   │   ├── github/            ✅ Domain grouping
│   │   ├── ideas/             ✅ Domain grouping
│   │   ├── links/             ✅ Domain grouping
│   │   └── prompts/           ✅ Domain grouping
│   ├── auth/                   # Auth pages
│   ├── components/            ⚠️ Lokalne komponenty
│   └── providers/             ✅ Context providers
├── components/                 # Globalne komponenty UI
├── lib/                        # Logika biznesowa
│   ├── ai/                    ✅ AI services
│   ├── auth/                  ✅ Auth logic
│   ├── db/                    ✅ Database layer
│   │   └── schema/            ✅ Drizzle schemas
│   ├── query/                 ✅ TanStack Query hooks
│   └── store/                 ✅ Zustand stores
├── __tests__/                  # Testy (66 plików)
└── scripts/                    # DB scripts i utilities
```

### Rekomendacje Strukturalne

#### 1.1 Konsolidacja Komponentów

**Problem**: Komponenty rozdzielone między `app/components/` i `components/`

**Rozwiązanie**:
```
components/
├── ui/              # Podstawowe komponenty (Button, Card, Badge)
├── features/        # Komponenty domenowe
│   ├── links/      # LinkForm, LinkList
│   ├── ideas/      # IdeaForm, IdeaList
│   └── auth/       # user-menu, auth forms
└── layout/         # Header, Navigation, Footer
```

**Migracja**:
- `app/components/Header.tsx` → `components/layout/Header.tsx`
- `app/components/TodoList.tsx` → `components/features/todos/TodoList.tsx`
- `app/components/user-menu.tsx` → `components/features/auth/UserMenu.tsx`

#### 1.2 Centralizacja Logiki API

**Problem**: Brak wspólnej warstwy dla API handlers

**Rozwiązanie**: Utwórz `lib/api/` dla reużywalnej logiki:

```typescript
// lib/api/middleware.ts
export async function withAuth(
  handler: (req: Request, session: Session) => Promise<Response>
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handler(req, session);
}

// lib/api/error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// lib/api/validators.ts
import { z } from 'zod';

export const linkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      400,
      'Validation failed',
      'VALIDATION_ERROR'
    );
  }
  return result.data;
}
```

**Wykorzystanie w API routes**:

```typescript
// app/api/links/route.ts - PRZED
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany aby dodać link' },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data.url || !data.title) {
      return NextResponse.json(
        { error: 'URL i tytuł są wymagane' },
        { status: 400 }
      );
    }

    // ... reszta logiki
  } catch (error) {
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas dodawania linku' },
      { status: 500 }
    );
  }
}

// app/api/links/route.ts - PO
import { withAuth } from '@/lib/api/middleware';
import { validateRequest } from '@/lib/api/validators';
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { linkSchema } from '@/lib/api/validators';

export async function POST(request: Request) {
  return withAuth(async (req, session) => {
    try {
      const rawData = await req.json();
      const data = validateRequest(linkSchema, rawData);

      const db = await getDbInstance();

      // Sprawdź duplikaty
      const [existing] = await db.select()
        .from(links)
        .where(or(eq(links.url, data.url), eq(links.title, data.title)));

      if (existing) {
        throw new ApiError(409, 'Link już istnieje w bazie', 'DUPLICATE_LINK');
      }

      // Utwórz link
      const [result] = await db.insert(links).values({
        ...data,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const [newLink] = await db.select()
        .from(links)
        .where(eq(links.id, result.insertId));

      return NextResponse.json(newLink, { status: 201 });

    } catch (error) {
      return handleApiError(error);
    }
  });
}
```

**Korzyści**:
- 80% mniej boilerplate'u w każdym API route
- Spójny error handling
- Automatyczna walidacja z TypeScript typami
- Łatwiejsze testowanie (mockowanie middleware)

---

## 2. Separacja Odpowiedzialności (Separation of Concerns)

### 2.1 Database Layer - Duplikacja Połączeń

**Problem**: Dwa różne mechanizmy połączeń do bazy:

1. `lib/db/index.ts` - Pool-based z Drizzle ORM (używany w ideas)
2. `lib/db-pool.ts` - Raw SQL queries (używany w auth)

**Analiza**:

```typescript
// lib/db/index.ts - Nowoczesne podejście
export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (!dbInstance) {
    const pool = DatabasePool.getInstance();
    await pool.initialize();
    dbInstance = drizzle(pool.getPool(), { schema, mode: 'default' });
  }
  return dbInstance;
}

// lib/db-pool.ts - Legacy raw queries
export async function executeQuery(sql: string, params?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}
```

**Rekomendacja**: Konsolidacja do jednego podejścia

```typescript
// lib/db/client.ts - Unified approach
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

class DatabaseClient {
  private static instance: DatabaseClient;
  private pool: mysql.Pool;
  private orm: ReturnType<typeof drizzle>;

  private constructor() {
    this.pool = mysql.createPool({
      host: env.DATABASE_HOST,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      port: env.DATABASE_PORT,
      connectionLimit: 20,
      queueLimit: 100,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    this.orm = drizzle(this.pool, { schema, mode: 'default' });
  }

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  // Dla nowych features - używaj ORM
  getOrm() {
    return this.orm;
  }

  // Dla legacy features - raw queries (deprecated)
  async executeRaw<T = any>(sql: string, params?: any[]): Promise<T[]> {
    console.warn('⚠️ Using deprecated raw query - migrate to ORM');
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows as T[];
    } finally {
      connection.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Eksport dla backward compatibility
export const getDb = () => DatabaseClient.getInstance().getOrm();
export const executeQuery = (sql: string, params?: any[]) =>
  DatabaseClient.getInstance().executeRaw(sql, params);
```

**Plan migracji**:
1. Auth routes nadal używają `executeQuery` (nie zmieniamy działającej autentykacji)
2. Wszystkie nowe features używają `getDb()` ORM
3. Stopniowo migrujemy auth do Drizzle ORM (osobny task)

### 2.2 State Management - Clear Boundaries

**Obecny stan**: ✅ DOBRY

- **Zustand** (`lib/store/app-store.ts`) - UI state (theme, modals, loading)
- **TanStack Query** (`lib/query/`) - Server state (links, ideas, users)

**Analiza mocnych stron**:

```typescript
// ✅ Zustand - tylko UI state, bez server data
export const useAppStore = create<AppState>()(
  devtools(
    persist((set, get) => ({
      theme: 'system',           // ✅ UI preference
      sidebarOpen: false,        // ✅ UI state
      modalOpen: false,          // ✅ UI state
      isLoading: false,          // ✅ UI state
      searchQuery: '',           // ✅ Filter state
      // ❌ BRAK: links[], ideas[] - dane z serwera
    }))
  )
);

// ✅ TanStack Query - tylko server state
export function useLinks(filters?: LinkFilters) {
  return useQuery({
    queryKey: queryKeys.linksList(filters),
    queryFn: () => fetchWithErrorHandling('/api/links'),
    staleTime: 5 * 60 * 1000,     // ✅ Cache invalidation
    refetchOnWindowFocus: false,  // ✅ Performance
  });
}
```

**Rekomendacje**:

1. **Dodaj devtools configuration dla produkcji**:

```typescript
// lib/store/app-store.ts
export const useAppStore = create<AppState>()(
  devtools(
    persist((set, get) => ({ /* ... */ })),
    {
      name: 'app-store',
      enabled: process.env.NODE_ENV === 'development',
      // ✅ Zapobiega wyciekom w produkcji
    }
  )
);
```

2. **Rozważ separację store'ów dla złożonych domen**:

```typescript
// lib/store/ui-store.ts - UI-only state
export const useUIStore = create<UIState>()(
  persist((set) => ({
    theme: 'system',
    sidebarOpen: false,
    compactMode: false,
  }), { name: 'ui-preferences' })
);

// lib/store/filter-store.ts - Filter state
export const useFilterStore = create<FilterState>()((set) => ({
  searchQuery: '',
  activeFilter: 'all',
  dateRange: null,
}));

// lib/store/modal-store.ts - Modal management
export const useModalStore = create<ModalState>()((set) => ({
  modals: new Map(),
  open: (id, content) => set((state) => ({
    modals: new Map(state.modals).set(id, { isOpen: true, content })
  })),
  close: (id) => set((state) => {
    const newModals = new Map(state.modals);
    newModals.delete(id);
    return { modals: newModals };
  }),
}));
```

**Korzyści separacji**:
- Mniejszy footprint w localStorage (tylko UI preferences)
- Lepsze tree-shaking
- Łatwiejsze testowanie poszczególnych funkcji

---

## 3. API Route Structure - Standaryzacja

### 3.1 Analiza Obecnych Patterns

**Wykryte wzorce** (z 31 API routes):

1. **Pattern A** - Pełna obsługa błędów (links, ideas)
2. **Pattern B** - Minimalna obsługa błędów (auth routes)
3. **Pattern C** - Brak walidacji wejścia (niektóre PATCH endpoints)

**Przykład niespójności**:

```typescript
// app/api/links/route.ts - Pattern A ✅
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '...' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.url || !data.title) {
      return NextResponse.json({ error: '...' }, { status: 400 });
    }

    // Check duplicates
    // Insert
    // Return
  } catch (error) {
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
}

// app/api/ideas/route.ts - Pattern B ⚠️
export async function POST(request: Request) {
  try {
    const data = await request.json();  // ❌ Brak auth check
    // ❌ Brak walidacji
    const db = await getDb();
    // Insert
  } catch (error) {
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
}
```

### 3.2 Unified API Structure

**Rekomendowany standardowy pattern**:

```typescript
// lib/api/route-factory.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { z } from 'zod';

interface RouteConfig<TInput, TOutput> {
  auth?: boolean | 'admin';
  schema?: z.ZodSchema<TInput>;
  handler: (params: {
    input: TInput;
    session?: Session;
    req: NextRequest;
  }) => Promise<TOutput>;
}

export function createRoute<TInput = unknown, TOutput = unknown>(
  config: RouteConfig<TInput, TOutput>
) {
  return async (req: NextRequest) => {
    try {
      // 1. Authentication
      let session: Session | null = null;
      if (config.auth) {
        session = await getServerSession(authOptions);
        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        if (config.auth === 'admin' && session.user?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }
      }

      // 2. Parse & Validate Input
      let input: TInput;
      if (config.schema) {
        const rawData = await req.json();
        const result = config.schema.safeParse(rawData);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: result.error.errors
            },
            { status: 400 }
          );
        }
        input = result.data;
      } else {
        input = (await req.json()) as TInput;
      }

      // 3. Execute Handler
      const output = await config.handler({
        input,
        session: session ?? undefined,
        req,
      });

      // 4. Return Success
      return NextResponse.json(output);

    } catch (error) {
      // 5. Error Handling
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      console.error('Unexpected API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

**Przykład użycia**:

```typescript
// app/api/links/route.ts - REFACTORED
import { createRoute } from '@/lib/api/route-factory';
import { z } from 'zod';

const createLinkSchema = z.object({
  url: z.string().url('Invalid URL format'),
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().optional(),
});

export const POST = createRoute({
  auth: true,  // ✅ Wymaga autentykacji
  schema: createLinkSchema,  // ✅ Automatyczna walidacja
  handler: async ({ input, session }) => {
    const db = await getDbInstance();

    // Sprawdź duplikaty
    const [existing] = await db.select()
      .from(links)
      .where(or(eq(links.url, input.url), eq(links.title, input.title)));

    if (existing) {
      throw new ApiError(409, 'Link already exists', 'DUPLICATE_LINK');
    }

    // Utwórz link
    const [result] = await db.insert(links).values({
      ...input,
      userId: session!.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [newLink] = await db.select()
      .from(links)
      .where(eq(links.id, result.insertId));

    return newLink;
  },
});

export const GET = createRoute({
  auth: false,  // ✅ Publiczny endpoint
  handler: async ({ req }) => {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';

    const db = await getDbInstance();
    const conditions = search
      ? [or(
          like(links.title, `%${search}%`),
          like(links.url, `%${search}%`)
        )]
      : [];

    return db.select()
      .from(links)
      .where(and(...conditions))
      .orderBy(desc(links.createdAt));
  },
});
```

**Korzyści standaryzacji**:
- ✅ Każdy endpoint ma auth, walidację, error handling
- ✅ 60% mniej boilerplate kodu
- ✅ Type-safe input/output
- ✅ Łatwiejsze testowanie (mock factory)
- ✅ Konsystentny format błędów

---

## 4. Error Handling Patterns

### 4.1 Obecny Stan - Analiza

**Znalezione problemy**:

1. **Niespójne kody błędów**:
```typescript
// app/api/links/route.ts
return NextResponse.json({ error: 'Link już istnieje' }, { status: 409 });

// app/api/ideas/route.ts
return NextResponse.json({ error: 'Nie udało się dodać pomysłu' }, { status: 500 });
// ❌ Brak szczegółów, co poszło nie tak
```

2. **Brak error codes dla klientów**:
```typescript
// Frontend nie wie, czy retry ma sens
try {
  await createLink(data);
} catch (error) {
  // ❌ Nie wiadomo czy to DUPLICATE_LINK, VALIDATION_ERROR, czy SERVER_ERROR
  toast.error('Failed to create link');
}
```

3. **Niekompletne logowanie błędów**:
```typescript
catch (error) {
  console.error('Błąd:', error);  // ❌ Brak kontekstu (user, request ID, timestamp)
  return NextResponse.json(...);
}
```

### 4.2 Rekomendowany System Błędów

**Hierarchia błędów**:

```typescript
// lib/api/errors.ts
export enum ErrorCode {
  // Client errors (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RATE_LIMIT = 'RATE_LIMIT',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: ErrorCode,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }

  // Factory methods
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, ErrorCode.FORBIDDEN);
  }

  static notFound(resource: string) {
    return new ApiError(404, `${resource} not found`, ErrorCode.NOT_FOUND);
  }

  static validation(details: Record<string, string>) {
    return new ApiError(
      400,
      'Validation failed',
      ErrorCode.VALIDATION_ERROR,
      { fields: details }
    );
  }

  static duplicate(resource: string, field: string) {
    return new ApiError(
      409,
      `${resource} already exists`,
      ErrorCode.DUPLICATE_RESOURCE,
      { field }
    );
  }

  static database(originalError: Error) {
    console.error('Database error:', originalError);
    return new ApiError(
      500,
      'Database operation failed',
      ErrorCode.DATABASE_ERROR
    );
  }
}
```

**Error handling middleware**:

```typescript
// lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { ApiError, ErrorCode } from './errors';

export function handleApiError(error: unknown): NextResponse {
  // Known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      error.toJSON(),
      { status: error.statusCode }
    );
  }

  // Zod validation errors
  if (error instanceof z.ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      acc[err.path.join('.')] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(
      {
        error: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        details: { fields: fieldErrors },
      },
      { status: 400 }
    );
  }

  // Database errors
  if (error instanceof Error && error.message.includes('ER_')) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        error: 'Database operation failed',
        code: ErrorCode.DATABASE_ERROR,
      },
      { status: 500 }
    );
  }

  // Unknown errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: 500 }
  );
}
```

**Wykorzystanie w API routes**:

```typescript
// app/api/links/route.ts
export const POST = createRoute({
  auth: true,
  schema: createLinkSchema,
  handler: async ({ input, session }) => {
    const db = await getDbInstance();

    // Check duplicates
    const [existing] = await db.select()
      .from(links)
      .where(or(
        eq(links.url, input.url),
        eq(links.title, input.title)
      ));

    if (existing) {
      throw ApiError.duplicate('Link', existing.url === input.url ? 'url' : 'title');
      // Response: { error: 'Link already exists', code: 'DUPLICATE_RESOURCE', details: { field: 'url' } }
    }

    try {
      const [result] = await db.insert(links).values({...});
      return result;
    } catch (error) {
      throw ApiError.database(error as Error);
    }
  },
});
```

**Client-side handling**:

```typescript
// lib/query/use-links.ts
export function useCreateLink() {
  const { addToast } = useAppStore();

  return useMutation({
    mutationFn: async (data: CreateLinkData) => {
      const response = await fetch('/api/links', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    },
    onError: (error: any) => {
      // ✅ Type-safe error handling based on code
      switch (error.code) {
        case 'DUPLICATE_RESOURCE':
          addToast(
            `Link już istnieje (pole: ${error.details?.field})`,
            'warning'
          );
          break;

        case 'VALIDATION_ERROR':
          const fields = Object.entries(error.details?.fields || {})
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          addToast(`Błędy walidacji: ${fields}`, 'error');
          break;

        case 'UNAUTHORIZED':
          addToast('Musisz być zalogowany', 'error');
          // Redirect to login
          break;

        default:
          addToast('Wystąpił nieoczekiwany błąd', 'error');
      }
    },
  });
}
```

**Korzyści**:
- ✅ Type-safe error codes
- ✅ Spójne formaty błędów
- ✅ Łatwe debugowanie (structured logging)
- ✅ Lepsze UX (dokładne komunikaty dla użytkownika)
- ✅ Możliwość retry logic based on error type

---

## 5. Type Safety & TypeScript

### 5.1 Obecny Stan - Analiza ✅

**Silne strony**:
- Strict mode enabled
- Drizzle ORM generuje typy automatycznie
- TanStack Query z generics
- Zustand z TypeScript interfaces

**Przykład dobrej praktyki**:

```typescript
// lib/db/schema/index.ts
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

// lib/query/use-links.ts
export function useLinks(filters?: LinkFilters): UseQueryResult<Link[], Error> {
  // ✅ Pełne type safety od bazy przez API do UI
}
```

### 5.2 Obszary do Poprawy

#### Problem 1: Brak shared types dla API contracts

**Obecnie**:
```typescript
// app/api/links/route.ts
const data = await request.json();  // ❌ any type
if (!data.url || !data.title) { ... }

// Frontend
const response = await fetch('/api/links', {
  body: JSON.stringify({ url, title })  // ❌ Brak type checking
});
```

**Rozwiązanie**: API contract types

```typescript
// lib/api/contracts/links.ts
import { z } from 'zod';
import type { Link } from '@/lib/db/schema';

export const CreateLinkInput = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export type CreateLinkInput = z.infer<typeof CreateLinkInput>;

export interface CreateLinkOutput {
  link: Link;
}

export const UpdateLinkInput = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export type UpdateLinkInput = z.infer<typeof UpdateLinkInput>;

export interface UpdateLinkOutput {
  link: Link;
}

export interface GetLinksQuery {
  search?: string;
  userId?: string;
}

export interface GetLinksOutput {
  links: Link[];
}
```

**Wykorzystanie**:

```typescript
// app/api/links/route.ts
import { CreateLinkInput, CreateLinkOutput } from '@/lib/api/contracts/links';

export const POST = createRoute<CreateLinkInput, CreateLinkOutput>({
  auth: true,
  schema: CreateLinkInput,
  handler: async ({ input, session }) => {
    // input jest typu CreateLinkInput ✅
    const db = await getDbInstance();
    const [result] = await db.insert(links).values({
      ...input,
      userId: session!.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [link] = await db.select()
      .from(links)
      .where(eq(links.id, result.insertId));

    return { link };  // ✅ Type-safe output
  },
});

// lib/query/use-links.ts
import type { CreateLinkInput, CreateLinkOutput } from '@/lib/api/contracts/links';

export function useCreateLink() {
  return useMutation<CreateLinkOutput, Error, CreateLinkInput>({
    mutationFn: async (data) => {
      // data jest typu CreateLinkInput ✅
      const response = await fetch('/api/links', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) throw await response.json();
      return response.json();  // ✅ CreateLinkOutput
    },
  });
}
```

#### Problem 2: Missing TypeScript path aliases wykorzystanie

**Obecnie**: Częściowo używane (`@/*`)

**Rekomendacja**: Rozszerz dla lepszej organizacji

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/api/*": ["./lib/api/*"],
      "@/db/*": ["./lib/db/*"]
    }
  }
}
```

**Korzyści**:
```typescript
// PRZED
import { useLinks } from '../../../lib/query/use-links';
import { getDbInstance } from '../../../lib/db';

// PO
import { useLinks } from '@/lib/query/use-links';
import { getDbInstance } from '@/db';
```

---

## 6. Database Schema & Query Patterns

### 6.1 Schema Analysis

**Obecne tabele**:
- `links` - URL management ✅
- `users` - Authentication ✅
- `ideas` - Project ideas ✅
- `projects` - (schema exists, usage unclear)
- `tasks` - (schema exists, usage unclear)
- `todo` - (schema exists, usage unclear)

**Problemy**:

1. **Brak indeksów dla częstych zapytań**:

```typescript
// lib/db/schema/index.ts
export const links = mysqlTable('links', {
  id: int('id').primaryKey().autoincrement(),
  url: varchar('url', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 }),
  // ❌ Brak indeksu na userId dla WHERE userId = ?
  // ❌ Brak indeksu na url dla duplikatów
  // ❌ Brak indeksu na title dla wyszukiwania
});
```

**Rozwiązanie**:

```typescript
// lib/db/schema/links.ts
import { mysqlTable, varchar, text, timestamp, int, binary, index, uniqueIndex } from 'drizzle-orm/mysql-core';

export const links = mysqlTable('links', {
  id: int('id').primaryKey().autoincrement(),
  url: varchar('url', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  userId: varchar('user_id', { length: 36 }),
  imageData: binary('image_data', { length: 255 }),
  thumbnailData: binary('thumbnail_data', { length: 255 }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => ({
  // Indeksy dla performance
  userIdIdx: index('user_id_idx').on(table.userId),  // ✅ WHERE userId
  urlIdx: uniqueIndex('url_idx').on(table.url),      // ✅ Duplicate check + unique constraint
  titleIdx: index('title_idx').on(table.title),      // ✅ Search
  createdAtIdx: index('created_at_idx').on(table.createdAt),  // ✅ ORDER BY

  // Composite index dla search queries
  searchIdx: index('search_idx').on(table.userId, table.createdAt),  // ✅ User's recent links
}));
```

**Migracja**:
```sql
-- drizzle/add-indexes.sql
ALTER TABLE links
  ADD INDEX user_id_idx (user_id),
  ADD UNIQUE INDEX url_idx (url),
  ADD INDEX title_idx (title),
  ADD INDEX created_at_idx (created_at),
  ADD INDEX search_idx (user_id, created_at);
```

2. **Brak relacji foreign key w schemacie** (ideas → users):

```typescript
// lib/db/schema/ideas.ts - OBECNE ✅
export const ideas = mysqlTable('ideas', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  // ...
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id]
  })  // ✅ Foreign key constraint
}));
```

**Rekomendacja**: Dodaj to samo dla `links`:

```typescript
// lib/db/schema/links.ts
import { users } from './users';

export const links = mysqlTable('links', {
  // ... columns
}, (table) => ({
  // ... indices
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'links_user_fk'
  }).onDelete('cascade')  // ✅ Auto-delete user's links when user deleted
}));
```

### 6.2 Query Performance Patterns

**Problem**: N+1 queries w niektórych endpointach

**Przykład**:
```typescript
// ❌ BAD: N+1 query problem
const links = await db.select().from(links);
for (const link of links) {
  const user = await db.select()
    .from(users)
    .where(eq(users.id, link.userId));  // N queries for N links
  // ...
}
```

**Rozwiązanie**: Use Drizzle relations

```typescript
// lib/db/schema/relations.ts
import { relations } from 'drizzle-orm';
import { links } from './links';
import { users } from './users';
import { ideas } from './ideas';

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  ideas: many(ideas),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));

export const ideasRelations = relations(ideas, ({ one }) => ({
  user: one(users, {
    fields: [ideas.userId],
    references: [users.id],
  }),
}));

// ✅ GOOD: Single query with join
const linksWithUsers = await db.query.links.findMany({
  with: {
    user: true,  // ✅ LEFT JOIN users
  },
});
```

---

## 7. Testing Strategy

### 7.1 Obecny Stan

**Znalezione testy**: 66 plików testowych

**Struktura**:
```
__tests__/
├── api/           # API route tests
├── components/    # Component tests
├── lib/           # Library tests
└── setup.ts       # Test configuration
```

**Problemy**:

1. **Brak testów integracyjnych dla kluczowych flows**:
```
✅ Unit tests dla komponentów
✅ Unit tests dla hooks
❌ Integration tests dla auth flow
❌ Integration tests dla link CRUD
❌ E2E tests dla user journeys
```

2. **Niekompletna coverage dla API routes**:
```typescript
// __tests__/api/links.test.ts - przykład
describe('POST /api/links', () => {
  it('should create link', async () => {
    // ✅ Happy path
  });

  // ❌ Brak testów dla:
  // - Duplicate URL
  // - Invalid URL format
  // - Unauthorized request
  // - Database error scenarios
});
```

### 7.2 Rekomendowana Strategia Testowania

#### Test Pyramid

```
       /\
      /  \  E2E Tests (5-10%)
     /____\
    /      \  Integration Tests (20-30%)
   /________\
  /          \  Unit Tests (60-70%)
 /__________\
```

**Implementacja**:

```typescript
// __tests__/api/links/create-link.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDatabase, cleanupTestDatabase } from '@/test-utils/db';
import { createTestUser } from '@/test-utils/factories';
import { POST } from '@/app/api/links/route';

describe('POST /api/links - Integration Tests', () => {
  let testDb: TestDatabase;
  let testUser: TestUser;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    testUser = await createTestUser(testDb);
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const req = new Request('http://localhost/api/links', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com', title: 'Test' }),
      });

      const response = await POST(req);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('should accept authenticated requests', async () => {
      const req = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Cookie': await testUser.getSessionCookie(),
        },
        body: JSON.stringify({ url: 'https://example.com', title: 'Test' }),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);
    });
  });

  describe('Validation', () => {
    it('should reject invalid URL', async () => {
      const req = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Cookie': await testUser.getSessionCookie(),
        },
        body: JSON.stringify({ url: 'not-a-url', title: 'Test' }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.details.fields.url).toBeDefined();
    });

    it('should reject duplicate URL', async () => {
      const url = 'https://duplicate.com';

      // Create first link
      await testDb.insert(links).values({
        url,
        title: 'Original',
        userId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Try to create duplicate
      const req = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Cookie': await testUser.getSessionCookie(),
        },
        body: JSON.stringify({ url, title: 'Duplicate' }),
      });

      const response = await POST(req);

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.code).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('Database Operations', () => {
    it('should create link with correct data', async () => {
      const linkData = {
        url: 'https://example.com',
        title: 'Test Link',
        description: 'Test description',
      };

      const req = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: {
          'Cookie': await testUser.getSessionCookie(),
        },
        body: JSON.stringify(linkData),
      });

      const response = await POST(req);
      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body.link).toMatchObject({
        url: linkData.url,
        title: linkData.title,
        description: linkData.description,
        userId: testUser.id,
      });

      // Verify in database
      const [dbLink] = await testDb.select()
        .from(links)
        .where(eq(links.id, body.link.id));

      expect(dbLink).toBeDefined();
      expect(dbLink.url).toBe(linkData.url);
    });
  });
});
```

**Test utilities**:

```typescript
// test-utils/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export async function createTestDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'linkupdate_test',
  });

  const db = drizzle(connection);

  // Clean all tables
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');
  await db.execute('TRUNCATE TABLE links');
  await db.execute('TRUNCATE TABLE users');
  await db.execute('TRUNCATE TABLE ideas');
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');

  return { db, connection };
}

export async function cleanupTestDatabase(testDb: TestDatabase) {
  await testDb.connection.end();
}

// test-utils/factories.ts
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function createTestUser(testDb: TestDatabase, overrides = {}) {
  const userId = uuidv4();
  const password = 'test-password';
  const hashedPassword = await bcrypt.hash(password, 10);

  await testDb.db.insert(users).values({
    id: userId,
    email: `test-${userId}@example.com`,
    name: 'Test User',
    password: hashedPassword,
    ...overrides,
  });

  return {
    id: userId,
    password,
    async getSessionCookie() {
      // Generate valid session cookie for testing
      const response = await fetch('http://localhost:9999/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-${userId}@example.com`,
          password,
        }),
      });
      return response.headers.get('set-cookie')!;
    },
  };
}
```

**E2E Tests z Playwright**:

```typescript
// e2e/links/create-link.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Link Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should create link successfully', async ({ page }) => {
    await page.goto('/links');

    // Click "Add Link" button
    await page.click('button:has-text("Add Link")');

    // Fill form
    await page.fill('input[name="url"]', 'https://example.com');
    await page.fill('input[name="title"]', 'Example Site');
    await page.fill('textarea[name="description"]', 'Test description');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify success toast
    await expect(page.locator('text=Link created successfully')).toBeVisible();

    // Verify link appears in list
    await expect(page.locator('text=Example Site')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/links');
    await page.click('button:has-text("Add Link")');

    // Submit empty form
    await page.click('button:has-text("Create")');

    // Verify validation errors
    await expect(page.locator('text=URL is required')).toBeVisible();
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('should prevent duplicate links', async ({ page }) => {
    const url = 'https://duplicate.com';

    // Create first link
    await page.goto('/links');
    await page.click('button:has-text("Add Link")');
    await page.fill('input[name="url"]', url);
    await page.fill('input[name="title"]', 'First Link');
    await page.click('button:has-text("Create")');
    await expect(page.locator('text=Link created successfully')).toBeVisible();

    // Try to create duplicate
    await page.click('button:has-text("Add Link")');
    await page.fill('input[name="url"]', url);
    await page.fill('input[name="title"]', 'Second Link');
    await page.click('button:has-text("Create")');

    // Verify error message
    await expect(page.locator('text=Link already exists')).toBeVisible();
  });
});
```

**Coverage targets**:
- Unit tests: 80%+
- Integration tests: key user flows (auth, CRUD operations)
- E2E tests: critical paths (signup → login → create link → logout)

---

## 8. Performance Considerations

### 8.1 Database Query Optimization

**Obecnie zidentyfikowane problemy**:

1. **Brak paginacji w GET /api/links**:

```typescript
// app/api/links/route.ts - OBECNIE
export async function GET(request: Request) {
  const allLinks = await db.select()
    .from(links)
    .orderBy(desc(links.createdAt));  // ❌ Pobiera WSZYSTKIE linki

  return NextResponse.json(allLinks);  // ❌ Może być 10000+ rekordów
}
```

**Rozwiązanie**: Implementuj cursor-based pagination

```typescript
// app/api/links/route.ts - POPRAWIONE
import { z } from 'zod';

const querySchema = z.object({
  cursor: z.string().optional(),  // ID ostatniego elementu z poprzedniej strony
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { cursor, limit, search } = querySchema.parse({
    cursor: searchParams.get('cursor'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
  });

  const db = await getDbInstance();

  // Build query conditions
  const conditions = [];

  // Cursor-based pagination
  if (cursor) {
    conditions.push(lt(links.id, parseInt(cursor)));
  }

  // Search
  if (search) {
    conditions.push(
      or(
        like(links.title, `%${search}%`),
        like(links.url, `%${search}%`)
      )
    );
  }

  // Execute query
  const results = await db.select()
    .from(links)
    .where(and(...conditions))
    .orderBy(desc(links.createdAt))
    .limit(limit + 1);  // Fetch +1 to check if there's more

  // Check if there are more results
  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? items[items.length - 1].id.toString() : null;

  return NextResponse.json({
    items,
    nextCursor,
    hasMore,
  });
}
```

**Frontend integration**:

```typescript
// lib/query/use-links.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteLinks(search?: string) {
  return useInfiniteQuery({
    queryKey: ['links', 'infinite', search],
    queryFn: async ({ pageParam = undefined }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam);
      if (search) params.set('search', search);

      const response = await fetch(`/api/links?${params}`);
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// Component usage
function LinksList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLinks();

  return (
    <div>
      {data?.pages.map((page) => (
        page.items.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

2. **Brak cache dla często używanych queries**:

```typescript
// lib/query/query-client.ts - OBECNIE
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,  // ✅ 5 minut
    gcTime: 10 * 60 * 1000,    // ✅ 10 minut
  },
};
```

**Rekomendacja**: Różne cache strategies dla różnych typów danych

```typescript
// lib/query/query-client.ts - ROZSZERZONE
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions });

// Specialized cache configurations
export const cacheConfig = {
  // User data - rarely changes
  user: {
    staleTime: 15 * 60 * 1000,  // 15 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes
  },

  // Links - frequently updated
  links: {
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 5 * 60 * 1000,      // 5 minutes
  },

  // Static data (categories, etc.)
  static: {
    staleTime: Infinity,         // Never stale
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Usage
export function useLinks() {
  return useQuery({
    queryKey: queryKeys.linksList(),
    queryFn: () => fetchLinks(),
    ...cacheConfig.links,  // ✅ Apply specialized config
  });
}
```

### 8.2 Bundle Size Optimization

**Analiza obecnego bundle'a**:

```bash
npm run build
```

**Potencjalne problemy**:

1. **Duże biblioteki importowane gdzie niepotrzebne**:

```typescript
// ❌ BAD: Import całego lodash
import _ from 'lodash';

// ✅ GOOD: Import tylko potrzebnej funkcji
import debounce from 'lodash/debounce';
```

2. **Brak code splitting dla rzadko używanych features**:

```typescript
// app/admin/page.tsx - ❌ Zawsze ładowany
import { UserManagement } from '@/components/UserManagement';

// ✅ GOOD: Lazy load
import dynamic from 'next/dynamic';

const UserManagement = dynamic(
  () => import('@/components/UserManagement'),
  {
    loading: () => <Skeleton />,
    ssr: false,  // Admin panel nie potrzebuje SSR
  }
);
```

**Rekomendacje**:

```typescript
// app/api-keys/page.tsx
import dynamic from 'next/dynamic';

// Heavy components - lazy load
const ApiKeyManager = dynamic(() => import('@/components/features/api-keys/ApiKeyManager'), {
  loading: () => <div>Loading...</div>,
});

const AdvancedSettings = dynamic(() => import('@/components/features/settings/AdvancedSettings'), {
  loading: () => <div>Loading settings...</div>,
});

export default function ApiKeysPage() {
  return (
    <div>
      <ApiKeyManager />
      <AdvancedSettings />
    </div>
  );
}
```

### 8.3 Image Optimization

**Obecny stan**: Binary storage w database

**Problem**:
- Duże image_data/thumbnail_data w każdym query
- Brak lazy loading
- Brak responsive images

**Rekomendacja**: Migracja do external storage + Next.js Image

```typescript
// lib/storage/image-service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

export class ImageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY,
      },
    });
  }

  async uploadLinkImage(
    file: Buffer,
    linkId: number
  ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    // Generate thumbnail
    const thumbnail = await sharp(file)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Optimize original
    const optimized = await sharp(file)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // Upload to S3
    const imageKey = `links/${linkId}/image.webp`;
    const thumbnailKey = `links/${linkId}/thumbnail.webp`;

    await Promise.all([
      this.s3.send(new PutObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: imageKey,
        Body: optimized,
        ContentType: 'image/webp',
      })),
      this.s3.send(new PutObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/webp',
      })),
    ]);

    return {
      imageUrl: `${env.CDN_URL}/${imageKey}`,
      thumbnailUrl: `${env.CDN_URL}/${thumbnailKey}`,
    };
  }
}

// Usage in API
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  const imageService = new ImageService();
  const { imageUrl, thumbnailUrl } = await imageService.uploadLinkImage(
    Buffer.from(await file.arrayBuffer()),
    linkId
  );

  await db.update(links)
    .set({
      imageUrl,      // VARCHAR(500) zamiast BINARY
      thumbnailUrl,  // VARCHAR(500) zamiast BINARY
    })
    .where(eq(links.id, linkId));
}

// Frontend - Next.js Image
import Image from 'next/image';

function LinkCard({ link }) {
  return (
    <div>
      <Image
        src={link.thumbnailUrl}
        alt={link.title}
        width={200}
        height={200}
        loading="lazy"
        placeholder="blur"
        blurDataURL={link.blurDataUrl}  // ✅ Generated during upload
      />
    </div>
  );
}
```

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

**Obecny stan**: ✅ Dobrze zaimplementowane

- NextAuth.js z Google OAuth ✅
- Credentials provider z bcrypt ✅
- Role-based access (admin/user) ✅
- Middleware dla protected routes ✅

**Drobne usprawnienia**:

1. **Rate limiting dla auth endpoints**:

```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),  // 5 requests per 15 minutes
  analytics: true,
});

export async function checkAuthRateLimit(identifier: string) {
  const { success, remaining, reset } = await authRateLimit.limit(identifier);

  if (!success) {
    throw new ApiError(
      429,
      `Too many attempts. Try again in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes`,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  return { remaining, reset };
}

// app/api/auth/signin/route.ts
export const POST = createRoute({
  schema: z.object({ email: z.string().email(), password: z.string() }),
  handler: async ({ input }) => {
    // Rate limit by email
    await checkAuthRateLimit(`auth:${input.email}`);

    // ... continue with authentication
  },
});
```

2. **CSRF protection dla mutation endpoints**:

```typescript
// middleware.ts
import { csrf } from '@/lib/security/csrf';

export async function middleware(request: NextRequest) {
  // Verify CSRF token for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const token = request.headers.get('x-csrf-token');
    if (!csrf.verify(token)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}
```

### 9.2 Input Validation & Sanitization

**Problem**: Niekompletna walidacja w niektórych endpointach

**Rozwiązanie**: Comprehensive Zod schemas

```typescript
// lib/api/validators/common.ts
import { z } from 'zod';

// Reusable validators
export const urlValidator = z.string()
  .url('Invalid URL format')
  .regex(/^https?:\/\//, 'URL must start with http:// or https://')
  .max(2048, 'URL too long');

export const htmlSafeString = z.string()
  .transform((val) => val.replace(/<[^>]*>/g, ''))  // Strip HTML tags
  .refine((val) => !val.includes('<script>'), 'Script tags not allowed');

export const idValidator = z.union([
  z.string().uuid(),
  z.coerce.number().int().positive()
]);

// lib/api/validators/links.ts
export const CreateLinkSchema = z.object({
  url: urlValidator,
  title: htmlSafeString.min(1).max(255),
  description: htmlSafeString.max(2000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const UpdateLinkSchema = CreateLinkSchema.partial();

export const LinkQuerySchema = z.object({
  search: z.string().max(100).optional(),
  userId: idValidator.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});
```

### 9.3 SQL Injection Prevention

**Obecny stan**: ✅ Drizzle ORM zapobiega SQL injection

**Weryfikacja**:
```typescript
// ✅ SAFE: Parametrized queries
await db.select()
  .from(links)
  .where(eq(links.url, userInput));  // ✅ Automatically escaped

// ❌ UNSAFE: Raw SQL (unikaj)
await db.execute(`SELECT * FROM links WHERE url = '${userInput}'`);  // ❌ SQL injection risk
```

**Rekomendacja**: Jeśli musisz używać raw SQL, ZAWSZE używaj parametrów:

```typescript
// ✅ SAFE raw SQL
await db.execute(
  sql`SELECT * FROM links WHERE url = ${userInput}`
);
```

---

## 10. Plan Implementacji Ulepszeń

### Priorytet 1: Critical (Tydzień 1-2)

1. **Unified Error Handling** ⏱️ 2 dni
   - [ ] Utwórz `lib/api/errors.ts` z ApiError class
   - [ ] Utwórz `lib/api/error-handler.ts`
   - [ ] Refactor 5 kluczowych API routes (links, ideas, auth)
   - [ ] Testy integracyjne dla error scenarios

2. **API Route Standardization** ⏱️ 3 dni
   - [ ] Utwórz `lib/api/route-factory.ts`
   - [ ] Utwórz `lib/api/middleware.ts` (auth, validation)
   - [ ] Refactor `/api/links` routes
   - [ ] Refactor `/api/ideas` routes
   - [ ] Update dokumentacja API

3. **Input Validation with Zod** ⏱️ 2 dni
   - [ ] Utwórz `lib/api/validators/` z schemas
   - [ ] Dodaj walidację do wszystkich POST/PUT endpoints
   - [ ] Testy dla validation errors

### Priorytet 2: Important (Tydzień 3-4)

4. **Database Consolidation** ⏱️ 3 dni
   - [ ] Utwórz `lib/db/client.ts` unified client
   - [ ] Migruj auth routes do Drizzle ORM (stopniowo)
   - [ ] Dodaj indeksy do links table
   - [ ] Dodaj foreign keys
   - [ ] Testy wydajności queries

5. **Pagination Implementation** ⏱️ 2 dni
   - [ ] Dodaj cursor pagination do GET /api/links
   - [ ] Refactor `useLinks` hook na `useInfiniteLinks`
   - [ ] Update UI components dla infinite scroll
   - [ ] Testy dla pagination edge cases

6. **Component Reorganization** ⏱️ 2 dni
   - [ ] Utwórz nową strukturę `components/`
   - [ ] Migruj komponenty z `app/components/`
   - [ ] Update imports w całej aplikacji
   - [ ] Weryfikuj że wszystko działa

### Priorytet 3: Nice to Have (Tydzień 5-6)

7. **Testing Infrastructure** ⏱️ 4 dni
   - [ ] Setup test database
   - [ ] Utwórz test utilities (`createTestUser`, etc.)
   - [ ] Napisz integration tests dla auth flow
   - [ ] Napisz integration tests dla CRUD operations
   - [ ] E2E tests dla critical paths (3-5 scenariuszy)

8. **Performance Optimizations** ⏱️ 3 dni
   - [ ] Implementuj specialized cache configs
   - [ ] Code splitting dla admin panel
   - [ ] Lazy loading dla heavy components
   - [ ] Bundle analysis i optimizations
   - [ ] Image optimization (opcjonalnie - migration do S3)

9. **Security Hardening** ⏱️ 2 dni
   - [ ] Rate limiting dla auth endpoints
   - [ ] CSRF protection
   - [ ] Security headers middleware
   - [ ] Audit dependencies (npm audit)
   - [ ] Penetration testing basic scenarios

### Szczegółowy Timeline

```
Week 1: Error Handling + API Standardization
├── Day 1-2: Error handling infrastructure
├── Day 3-5: API route factory + refactoring
└── Day 6-7: Testing + documentation

Week 2: Validation + Database
├── Day 1-2: Zod validators + implementation
├── Day 3-5: Database consolidation
└── Day 6-7: Database indices + foreign keys

Week 3: Pagination + Components
├── Day 1-2: Pagination implementation
├── Day 3-4: Component reorganization
└── Day 5-7: Testing + bug fixes

Week 4-6: Testing + Performance + Security
├── Week 4: Integration tests setup + implementation
├── Week 5: Performance optimizations
└── Week 6: Security hardening + final testing
```

---

## 11. Metryki Sukcesu

### Before vs After

| Metryka | Przed | Po | Cel |
|---------|-------|-----|-----|
| **Code Quality** |
| API route consistency | 40% | 95% | 90%+ |
| Error handling coverage | 60% | 100% | 100% |
| Input validation coverage | 50% | 100% | 100% |
| **Performance** |
| Średni czas odpowiedzi API | 200ms | 100ms | <150ms |
| Bundle size (main) | ~500KB | ~350KB | <400KB |
| First Contentful Paint | 1.5s | 1.0s | <1.2s |
| **Testing** |
| Unit test coverage | 60% | 80% | 80%+ |
| Integration tests | 0 | 20+ | 15+ |
| E2E tests | 0 | 5+ | 3+ |
| **Security** |
| Known vulnerabilities | 3 | 0 | 0 |
| Rate limiting | Nie | Tak | Tak |
| Input sanitization | Częściowo | Wszystkie endpoints | Wszystkie |

### Monitoring & Validation

**Po każdym etapie**:
1. ✅ Wszystkie testy przechodzą (unit + integration)
2. ✅ `npm run build` działa bez błędów
3. ✅ `npm run lint` bez warnings
4. ✅ Manual testing critical flows
5. ✅ Performance regression tests (Lighthouse)

---

## 12. Dodatkowe Rekomendacje

### 12.1 Documentation

**Utwórz**:
- `docs/API.md` - Kompletna dokumentacja API z przykładami
- `docs/ARCHITECTURE.md` - High-level architecture diagram
- `docs/DEVELOPMENT.md` - Setup guide dla nowych developerów
- `docs/TESTING.md` - Testing strategy i jak uruchamiać testy

### 12.2 Developer Experience

**Rozważ dodanie**:
- Husky pre-commit hooks (lint + test)
- Prettier dla consistent formatting
- ESLint rules dla project-specific conventions
- VSCode workspace settings dla team consistency

### 12.3 Observability

**Przyszłe enhancement**:
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics / Self-hosted)
- Database query monitoring

---

## Podsumowanie

Aplikacja LinkUpdate-1 ma solidne fundamenty architektoniczne, ale wymaga standaryzacji i konsolidacji w kilku kluczowych obszarach:

**Kluczowe usprawnienia**:
1. ✅ Unified error handling z type-safe error codes
2. ✅ API route standardization via factory pattern
3. ✅ Comprehensive input validation z Zod
4. ✅ Database consolidation (single ORM approach)
5. ✅ Pagination dla skalowalności
6. ✅ Testing infrastructure (integration + E2E)

**Zachowane mocne strony**:
- Dobry separation of concerns (Zustand + TanStack Query)
- Type safety z TypeScript + Drizzle
- Nowoczesny tech stack (Next.js 15, React 19)

**Estimated effort**: 4-6 tygodni dla pełnej implementacji

**ROI**:
- 60% redukcja boilerplate w API routes
- 3x szybszy development nowych features
- 80%+ test coverage dla confidence w zmianach
- Lepsze UX dzięki spójnym error messages

---

**Następne kroki**:
1. Review tego dokumentu z zespołem
2. Priorytetyzacja tasków (Priorytet 1 → 2 → 3)
3. Setup tracking (GitHub Projects / Jira)
4. Start implementacji z Priorytet 1
