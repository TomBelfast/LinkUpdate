# 🔧 Lokalne Uruchomienie Aplikacji Link Manager

## Wymagania

- Node.js 18+ (sprawdź: `node --version`)
- npm lub yarn
- MySQL 8.0+ (lokalna lub zdalna baza danych)

## Krok 1: Instalacja zależności

```bash
npm install
```

**Uwaga**: Konflikty zależności zostały naprawione (usunięto `@auth/core` który powodował konflikt z `next-auth`). Instalacja powinna działać bez dodatkowych flag.

## Krok 2: Konfiguracja zmiennych środowiskowych

Utwórz plik `.env.local` w głównym katalogu projektu:

```bash
# W Windows (Git Bash)
touch .env.local

# Lub stwórz plik ręcznie w edytorze
```

### Minimalna konfiguracja `.env.local`:

```env
# Database Configuration (WYMAGANE)
DATABASE_HOST=192.168.0.9
DATABASE_PORT=3306
DATABASE_USER=testToDo
DATABASE_PASSWORD=testToDo
DATABASE_NAME=ToDo_Test

# NextAuth Configuration (WYMAGANE)
NEXTAUTH_SECRET=super-secret-key-for-development-only-change-in-production
NEXTAUTH_URL=http://localhost:9999

# Google OAuth (opcjonalne - potrzebne do logowania przez Google)
GOOGLE_ID=twoj-google-client-id
GOOGLE_SECRET=twoj-google-client-secret

# AI Providers (opcjonalne)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
PPLX_API_KEY=
PPLX_MODEL=sonar
```

**Uwaga**: Zamień wartości na swoje rzeczywiste dane bazy danych i klucze API.

## Krok 3: Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:9999**

### Inne przydatne komendy:

```bash
# Uruchomienie testów
npm test

# Build produkcyjny (testowanie przed deploy)
npm run build

# Uruchomienie buildu produkcyjnego lokalnie
npm run build
npm run start  # Serwer na porcie 8888
```

## Krok 4: Synchronizacja bazy danych (opcjonalne)

Jeśli chcesz zsynchronizować schemat bazy danych:

```bash
# Generowanie migracji z schematu
npm run db:generate

# Zastosowanie migracji do bazy
npm run db:push

# Lub pełna konfiguracja
npm run db:setup
```

## Krok 5: Testowanie zmian

1. Otwórz przeglądarkę: http://localhost:9999
2. Zmiany w kodzie są automatycznie odświeżane (Hot Module Replacement)
3. Sprawdź konsolę przeglądarki i terminal dla błędów

## Rozwiązywanie problemów

### Błąd połączenia z bazą danych
- Sprawdź czy MySQL jest uruchomiony
- Sprawdź czy dane w `.env.local` są poprawne
- Sprawdź czy baza danych istnieje: `mysql -u testToDo -p`

### Port już zajęty
Jeśli port 9999 jest zajęty, możesz zmienić port w `package.json`:
```json
"dev": "next dev -p 3000 -H 0.0.0.0"
```

### Błędy kompilacji TypeScript
```bash
# Wyczyść cache i spróbuj ponownie
rm -rf .next
npm run dev
```

## Struktura projektu

```
LinkUpdate-1/
├── app/              # Next.js App Router pages
├── components/       # Komponenty React
├── lib/              # Utilities, stores, queries
├── .env.local        # Zmienne środowiskowe (NIE commituj!)
└── package.json      # Zależności i skrypty
```

## Przydatne linki

- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs

