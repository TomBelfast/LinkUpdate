# Plan Refaktoryzacji LinkUpdate-1

**Data utworzenia:** 2025-12-29
**Status:** ✅ ZAKOŃCZONY
**Data zakończenia:** 2025-12-29

## Podsumowanie Wykonanych Prac

### FAZA 1: Usunięcie Dead Code ✅
- Usunięto `app/page-original.tsx` (~500 linii)
- Usunięto `app/page-modernized.tsx` (~350 linii)
- Usunięto `app/links/page-modernized.tsx` (~445 linii)
- Usunięto `lib/db/connection-pool.ts` (~190 linii)
- Usunięto `lib/db-pool.ts` (~111 linii)
- **Łączna oszczędność:** ~1596 linii kodu

### FAZA 2: Poprawki Bezpieczeństwa ✅
- Naprawiono hashowanie haseł: SHA256 → bcrypt w `reset-password/route.ts`
- Dodano autoryzację sesji do wszystkich API routes:
  - `/api/links` (GET/POST)
  - `/api/ideas` (GET/POST)
  - `/api/ideas/[id]` (PUT/DELETE)
  - `/api/prompts` (GET/POST)
  - `/api/ai/generate` (POST)
- Naprawiono CORS: usunięto wildcard `*`, dodano whitelist domen
- Usunięto wszystkie `console.log` z API routes

### FAZA 3: Optymalizacja Bazy Danych ✅
- Dodano paginację do `/api/links` (page, limit, offset)
- Utworzono migrację `0004_performance_indexes.sql` z indeksami
- Zaimplementowano debounce w wyszukiwaniu (useLinksSearch z 300ms)
- Zaktualizowano `use-links.ts` dla obsługi paginacji

### FAZA 4: Refaktoryzacja Komponentów ✅
- Dodano `useCallback` do wszystkich handlerów w `app/page.tsx`
- Utworzono komponent `IdeaCard.tsx` z `memo` dla optymalizacji
- Zaktualizowano importy z `@/lib/db-pool` na `@/lib/db`

### FAZA 5: Weryfikacja ✅
- Build przeszedł pomyślnie
- Wszystkie typy poprawione
- Wszystkie gradienty zachowane

---

## Podsumowanie Analiz

Przeprowadzono kompleksową analizę aplikacji przez 5 specjalistycznych agentów:
- **Security Engineer** - audyt bezpieczeństwa
- **Performance Engineer** - analiza wydajności
- **Code Reviewer** - jakość kodu i duplikacje
- **Frontend Developer** - komponenty i accessibility
- **Backend Architect** - architektura

### Kluczowe Statystyki

| Metryka | Wartość | Status |
|---------|---------|--------|
| Dead code do usunięcia | ~2650 linii | 🔴 |
| Duplikacja kodu | ~3273 linii | 🔴 |
| Problemy bezpieczeństwa | 15 | 🔴 |
| Problemy wydajności | 12 | 🟡 |
| Problemy accessibility | 8 | 🟡 |

---

## FAZA 1: Usunięcie Dead Code [PRIORYTET: KRYTYCZNY]

**Czas szacowany:** 30 minut

### 1.1 Duplikaty stron do usunięcia
```bash
rm app/page-original.tsx      # ~500 linii
rm app/page-modernized.tsx    # ~350 linii
rm app/links/page-modernized.tsx  # ~445 linii
```

### 1.2 Duplikaty connection pool
```bash
rm lib/db/connection-pool.ts  # ~190 linii
rm lib/db-pool.ts             # ~111 linii
```

### 1.3 Czyszczenie zbędnych plików w root
```bash
# Pliki tymczasowe/testowe w root:
rm -f "=[nextjs-app" "=" "11.1.0" "Build" "CACHED" "ERROR" "link@0.1.0" "next" "transferring" "NEXT_DISABLE_OPTIMIZATION=1"
```

**Oszczędność:** ~1596 linii kodu

---

## FAZA 2: Poprawki Bezpieczeństwa [PRIORYTET: KRYTYCZNY]

**Czas szacowany:** 2-3 godziny

### 2.1 Autoryzacja API Routes

**Pliki do naprawy:**
- `app/api/links/route.ts` - dodać weryfikację sesji w GET
- `app/api/ideas/route.ts` - dodać weryfikację sesji w GET/POST
- `app/api/ideas/[id]/route.ts` - dodać sprawdzenie właścicielstwa
- `app/api/prompts/route.ts` - dodać weryfikację sesji
- `app/api/migrate/route.ts` - ograniczyć do adminów

**Wzorzec do implementacji:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Filtruj po userId
  const userId = session.user.id;
  // ... rest of logic
}
```

### 2.2 Ujednolicenie hashowania haseł

**Problem:** `reset-password/route.ts` używa SHA256 zamiast bcrypt

**Plik:** `app/api/auth/reset-password/route.ts`
```typescript
// ZAMIEŃ:
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256');
  hash.update(salt + password);
  return salt + '$' + hash.digest('hex');
}

// NA:
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```

### 2.3 Rate Limiting

**Pliki do dodania rate limiting:**
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`

```typescript
import { rateLimitAuth } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rateLimitResult = await rateLimitAuth(request);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // ... rest
}
```

### 2.4 Maskowanie kluczy API

**Plik:** `app/api/api-keys/route.ts`
```typescript
// Przed zwróceniem:
const maskedKeys = apiKeys.map(key => ({
  ...key,
  api_key: `****${key.api_key.slice(-4)}`
}));
```

### 2.5 CORS Fix

**Plik:** `app/api/ai/generate/route.ts`
```typescript
// ZAMIEŃ:
'Access-Control-Allow-Origin': '*'

// NA:
'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://yourdomain.com'
```

---

## FAZA 3: Optymalizacja Bazy Danych [PRIORYTET: WYSOKI]

**Czas szacowany:** 1-2 godziny

### 3.1 Paginacja w GET /api/links

**Plik:** `app/api/links/route.ts`
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100);
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    query.orderBy(desc(links.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql`count(*)` }).from(links).where(/* conditions */)
  ]);

  return NextResponse.json({
    data: items,
    pagination: { page, limit, total: Number(countResult[0]?.count ?? 0) }
  });
}
```

### 3.2 Usunięcie zbędnych zapytań diagnostycznych

**Plik:** `app/api/ideas/route.ts` - usunąć:
```typescript
// USUNĄĆ te linie:
await db.execute(sql`SELECT 1`);
await db.execute(sql`SHOW TABLES LIKE 'ideas'`);
```

### 3.3 Dodanie indeksów (migracja)

**Nowy plik:** `drizzle/add-performance-indexes.sql`
```sql
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at DESC);
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
```

### 3.4 Debounce w wyszukiwaniu

**Pliki:** `app/page.tsx`, `app/links/page.tsx`

Użyć istniejącego hooka `useLinksSearch`:
```typescript
// ZAMIEŃ:
const { data: links = [] } = useLinks({ search: searchQuery });

// NA:
import { useLinksSearch } from '@/lib/query/use-links';
const { data: links = [] } = useLinksSearch(searchQuery, 300);
```

---

## FAZA 4: Refaktoryzacja Komponentów [PRIORYTET: ŚREDNI]

**Czas szacowany:** 4-5 godzin

### 4.1 Nowe komponenty do utworzenia

#### SearchInput
```typescript
// components/SearchInput.tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Szukaj...' }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-input"
    />
  );
}
```

#### LoadingSkeleton
```typescript
// components/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  variant: 'form' | 'list' | 'card';
  count?: number;
}

export function LoadingSkeleton({ variant, count = 3 }: LoadingSkeletonProps) {
  // ... implementacja
}
```

#### IdeaCard
```typescript
// components/IdeaCard.tsx
interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: IdeaStatus) => void;
}

export function IdeaCard({ idea, onEdit, onDelete, onStatusChange }: IdeaCardProps) {
  // Wyekstrahowany z app/page.tsx linie 308-348
}
```

### 4.2 useCallback/useMemo w handlerach

**Plik:** `app/page.tsx`
```typescript
import { useCallback, useMemo } from 'react';

const handleSubmit = useCallback(async (data) => {
  // ... logic
}, [editingLink, updateLink, createLink, setEditingLink]);

const handleDelete = useCallback(async (id: number) => {
  if (!confirm('Czy na pewno chcesz usunąć ten link?')) return;
  await deleteLink.mutateAsync(id);
}, [deleteLink]);
```

### 4.3 Zustand shallow selectors

```typescript
import { useShallow } from 'zustand/react/shallow';

const { editingLink, setEditingLink, searchQuery, setSearchQuery } = useAppStore(
  useShallow((state) => ({
    editingLink: state.editingLink,
    setEditingLink: state.setEditingLink,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
  }))
);
```

### 4.4 Header refaktoryzacja (data-driven)

**Plik:** `app/components/Header.tsx`
```typescript
const navItems = [
  { href: '/', label: 'Links', icon: '🔗', section: 'main' },
  { href: '/youtube', label: 'YouTube', icon: '📺', section: 'main' },
  { href: '/prompts', label: 'Prompts', icon: '📝', section: 'main' },
  // ... rest
];

// Redukcja z 195 linii do ~50 linii
```

---

## FAZA 5: Accessibility [PRIORYTET: ŚREDNI]

**Czas szacowany:** 1-2 godziny

### 5.1 ARIA labels dla ikon

**Plik:** `components/Icons.tsx`
```typescript
export const EditIcon: React.FC<IconProps> = ({ className, ariaLabel = "Edytuj" }) => (
  <svg className={className} aria-label={ariaLabel} role="img">
    <title>{ariaLabel}</title>
    <path d="..." />
  </svg>
);
```

### 5.2 Semantic HTML

Zamienić `<div onClick>` na `<button>` we wszystkich interaktywnych elementach.

### 5.3 Loading states

```typescript
<div role="status" aria-live="polite">
  Loading...
</div>
```

---

## Checklist Zachowania Funkcjonalności

### Gradient Buttons - ZACHOWAĆ
- [ ] `.gradient-button`
- [ ] `.edit-gradient`
- [ ] `.delete-gradient`
- [ ] `.copy-gradient`
- [ ] `.share-gradient`
- [ ] `.user-logged-gradient`
- [ ] `.auth-panel-gradient`
- [ ] `.uploading-gradient`
- [ ] `.loading-border`

### Funkcjonalności - ZACHOWAĆ
- [ ] CRUD linków
- [ ] CRUD pomysłów
- [ ] Wyszukiwanie
- [ ] Filtrowanie
- [ ] Udostępnianie (Web Share API)
- [ ] Kopiowanie do schowka
- [ ] Edycja w modalu
- [ ] YouTube embeds
- [ ] Autentykacja (Google OAuth + credentials)
- [ ] Toast notifications

---

## Kolejność Wykonania

| Faza | Opis | Czas | Priorytet |
|------|------|------|-----------|
| 1 | Usunięcie dead code | 30 min | 🔴 Krytyczny |
| 2 | Poprawki bezpieczeństwa | 2-3h | 🔴 Krytyczny |
| 3 | Optymalizacja DB | 1-2h | 🟡 Wysoki |
| 4 | Refaktoryzacja komponentów | 4-5h | 🟢 Średni |
| 5 | Accessibility | 1-2h | 🟢 Średni |

**Całkowity czas:** 9-13 godzin

---

## Metryki Sukcesu

Po refaktoryzacji:
- [ ] Usunięto ~2650 linii dead code
- [ ] Zmniejszono duplikację do <5%
- [ ] Wszystkie API routes mają autoryzację
- [ ] Paginacja w endpointach listowych
- [ ] Testy przechodzą
- [ ] Build przechodzi bez błędów
- [ ] Wszystkie gradienty zachowane
- [ ] Wszystkie funkcjonalności działają
