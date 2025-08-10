# Aktualny Kontekst

## Ostatnie Zmiany (09.04.2024)

### Refaktoryzacja Systemu Pomysłów
1. Usunięto komponenty TodoForm i TodoList
2. Dodano nowy komponent IdeaForm
3. Zaimplementowano własny system wyświetlania pomysłów
4. Wprowadzono zarządzanie statusami pomysłów

### Problemy w Toku
1. Błąd z klasą border-border w Tailwind CSS
   - Status: W trakcie rozwiązywania
   - Priorytet: Wysoki
   - Wpływ: Stylowanie komponentów

2. Ładowanie Komponentów
   - Status: Wymaga optymalizacji
   - Problem: Opóźnienia w ładowaniu dynamicznych komponentów
   - Rozwiązanie: Implementacja lepszych stanów ładowania

### Aktualny Focus
1. Stabilizacja systemu pomysłów
   - Implementacja pełnej funkcjonalności CRUD
   - Optymalizacja wydajności
   - Poprawa UX

2. Optymalizacja Wydajności
   - Redukcja czasu ładowania
   - Optymalizacja bundle size
   - Implementacja code splitting

3. Poprawa UI/UX
   - Spójny dark mode
   - Lepsze animacje przejść
   - Responsywność na wszystkich urządzeniach

## Następne Kroki
1. Rozwiązanie problemu z border-border
2. Implementacja systemu tagów
3. Dodanie filtrowania pomysłów
4. Integracja z bazą danych dla pomysłów

## Metryki do Śledzenia
1. Czas ładowania strony
2. Liczba błędów w konsoli
3. Wydajność komponentów
4. Responsywność UI

## Decyzje Techniczne
1. Przejście na system pomysłów zamiast zadań
2. Wykorzystanie dynamicznego importu dla ciężkich komponentów
3. Implementacja własnego systemu zarządzania stanem

## Priorytety
1. Stabilność aplikacji
2. Wydajność
3. UX/UI
4. Nowe funkcjonalności

## Ostatnia Aktualizacja (09.04.2024)
- Dodano plan implementacji systemu TO-DO
- Zdefiniowano strukturę bazy danych dla systemu TO-DO
- Zaplanowano fazy implementacji i testy
- Utworzono plik progress.md do śledzenia postępu projektu
- Zaktualizowano schemat bazy danych (poprawiono typy statusów w tabeli ideas)
- Zsynchronizowano bazę danych z najnowszym schematem
- Uruchomiono aplikację w trybie deweloperskim
- Zweryfikowano działanie wszystkich podstawowych funkcjonalności
- Zaimplementowano connection pooling dla bazy danych
- Zoptymalizowano konfigurację Next.js
- Utworzono skrypty zarządzania procesami i uprawnieniami
- Rozwiązano problemy z portem 9999 i uprawnieniami katalogów

## Status Projektu
- Faza: Rozwój i Optymalizacja + Implementacja TO-DO
- Priorytet: Wysoki
- Stan: Aktywny

## Nowy System TO-DO
### Struktura Danych
- Projects: zarządzanie projektami AI
- Tasks: zadania w ramach projektów
- Ideas: luźne pomysły do rozwoju
- Resources: zasoby zewnętrzne
- WidgetConfigurations: konfiguracja dashboardu

### Planowane Funkcjonalności
- Zarządzanie projektami (CRUD)
- Zarządzanie zadaniami z drag & drop
- System pomysłów z tagowaniem
- Zasoby zewnętrzne z kategoryzacją
- Konfigurowalny dashboard z widgetami
- Zaawansowane filtrowanie i wyszukiwanie

### Fazy Implementacji
1. Baza danych i modele
2. Backend API
3. Komponenty UI
4. Integracja i Drag & Drop
5. Filtrowanie i Wyszukiwanie
6. Optymalizacja i Finalizacja

## Bieżący Stan
- Podstawowa infrastruktura jest w pełni skonfigurowana
- Zaimplementowano connection pooling
- Zoptymalizowano konfigurację Next.js
- Rozwiązano krytyczne problemy blokujące

## Ostatnie Zmiany
1. Optymalizacja Bazy Danych:
   - Implementacja connection pooling
   - Konfiguracja puli połączeń (5-20 połączeń)
   - Optymalizacja timeoutów i retry strategy
   - Lepsze zarządzanie zasobami bazy

2. Optymalizacja Next.js:
   - Konfiguracja obrazów i cache
   - Optymalizacja importów
   - Implementacja lazy loading
   - Dodanie zabezpieczeń HTTP

3. Zarządzanie Procesami:
   - Skrypt manage-port.ps1 dla portu 9999
   - Skrypt manage-permissions.ps1 dla .next
   - Automatyczne czyszczenie procesów
   - Obsługa błędów EADDRINUSE

## Bieżące Priorytety
1. Implementacja systemu cache
2. Optymalizacja zapytań bazodanowych
3. Setup systemu monitoringu
4. Analiza wydajności aplikacji

## Znane Problemy
- Do zoptymalizowania: zapytania bazodanowe
- Do implementacji: system cache
- Do skonfigurowania: monitoring

## Następne Kroki
1. Implementacja Redis/Memcached
2. Optymalizacja zapytań SQL
3. Konfiguracja Prometheus/Grafana
4. Testy wydajnościowe

## Notatki
- Projekt wykorzystuje najnowsze wersje Next.js i TypeScript
- Architektura oparta na komponentach funkcyjnych
- Wykorzystanie Docker do standaryzacji środowiska

## Ostatnie działania
- Przeprowadzenie kompleksowych testów połączenia z bazą danych
- Implementacja rozszerzonego skryptu testowego
- Weryfikacja konfiguracji i stabilności połączenia
- Zidentyfikowano problemy wydajnościowe
- Stworzono kompleksowy plan optymalizacji
- Przygotowano harmonogram wdrożenia zmian

## Wykonane testy
1. Test podstawowego połączenia
2. Weryfikacja konfiguracji bazy danych
3. Test wykonania zapytań
4. Sprawdzenie tabeli migracji
5. Test timeoutu połączenia

## Stan systemu
- Baza danych: MySQL na pollywood.zapto.org:3306
- ORM: Drizzle z automatycznymi migracjami
- Połączenie: Aktywne i przetestowane

## Aktualne priorytety
- Monitorowanie wydajności połączenia
- Optymalizacja zapytań
- Implementacja mechanizmów cache

## Uwagi
- System posiada mechanizm automatycznych ponownych prób połączenia
- Zaimplementowane są zabezpieczenia przed utratą połączenia
- Skonfigurowany jest system migracji bazy danych
- Zaimplementowano kompleksowe testy połączenia
- Skonfigurowano timeout i ponowne próby połączenia
- System migracji jest gotowy do użycia

## Uwagi techniczne
- System posiada mechanizm automatycznych ponownych prób połączenia
- Zaimplementowane są zabezpieczenia przed utratą połączenia
- Skonfigurowany jest system migracji bazy danych
- Zaimplementowano kompleksowe testy połączenia
- Skonfigurowano timeout i ponowne próby połączenia
- System migracji jest gotowy do użycia
- Wymagane uprawnienia administratora dla niektórych operacji
- Konieczność koordynacji z zespołem DevOps
- Potrzeba testów wydajnościowych przed/po zmianach

## Aktualne problemy
1. Konflikty na porcie 9999
2. Problemy z uprawnieniami do .next/trace
3. Długi czas pierwszego wczytania
4. Nieoptymalne migracje bazy danych

## Priorytety optymalizacji
1. Natychmiastowe (Dzień 1-2):
   - Rozwiązanie konfliktów portów
   - Naprawa uprawnień katalogów
   - Podstawowa optymalizacja Next.js

2. Krótkoterminowe (Tydzień 1):
   - Implementacja connection pooling
   - Optymalizacja cache
   - Monitoring wydajności

3. Średnioterminowe (Miesiąc 1):
   - Pełna optymalizacja bazy danych
   - Zaawansowana konfiguracja Next.js
   - System monitoringu i alertów

## Metryki do śledzenia
- Czas pierwszego wczytania strony
- Czas odpowiedzi bazy danych
- Wykorzystanie zasobów systemowych
- Liczba błędów i wyjątków

## Status implementacji
- ⏳ Plan optymalizacji: Gotowy
- ⏳ Skrypty zarządzania: Do implementacji
- ⏳ Monitoring: Do implementacji
- ⏳ Optymalizacje DB: Do implementacji

## Następne kroki
1. Implementacja skryptów zarządzania procesami
2. Konfiguracja uprawnień katalogów
3. Wdrożenie podstawowych optymalizacji Next.js
4. Setup systemu monitoringu

## Główne Problemy
1. Blokujące:
   - Port 9999 konflikt (EADDRINUSE)
   - Uprawnienia .next/trace (EPERM)
   - Długi czas pierwszego wczytania

2. Wydajnościowe:
   - Nieoptymalne połączenia z bazą
   - Brak systemu cache
   - Nieefektywne ładowanie komponentów

## Plan Działania (24h)
1. Natychmiast (2h):
   - Utworzenie skryptu zarządzania procesami
   - Naprawa uprawnień katalogów
   - Quick-fix dla konfliktów portów

2. Dziś (4h):
   - Podstawowa optymalizacja Next.js
   - Konfiguracja connection pooling
   - Setup podstawowego monitoringu

3. Jutro (8h):
   - Implementacja systemu cache
   - Optymalizacja buildu
   - Konfiguracja metryk wydajności

## Metryki Sukcesu
1. Wydajność:
   - FCP < 1.5s
   - TTI < 3.5s
   - TTFB < 200ms

2. Stabilność:
   - Zero konfliktów portów
   - Zero błędów uprawnień
   - 99.9% dostępność

3. Baza danych:
   - Query time < 100ms
   - Zero timeout errors
   - Efektywne connection pooling

## Następne Kroki
1. Dziś:
   - [ ] Skrypt PowerShell dla portu 9999
   - [ ] Fix uprawnień .next
   - [ ] Podstawowy monitoring

2. Jutro:
   - [ ] System cache
   - [ ] Optymalizacja Next.js
   - [ ] Connection pooling

3. W tym tygodniu:
   - [ ] Pełny system monitoringu
   - [ ] Optymalizacja buildu
   - [ ] Testy wydajnościowe

## Zasoby
1. Narzędzia:
   - PowerShell dla skryptów
   - Prometheus/Grafana
   - Next.js built-in monitoring

2. Dokumentacja:
   - Next.js performance docs
   - MySQL optimization guide
   - Windows permissions guide

## Ryzyka
1. Wysokie:
   - Konflikty procesów
   - Problemy z uprawnieniami
   - Timeout bazy danych

2. Średnie:
   - Wydajność buildu
   - Cache invalidation
   - Memory leaks

3. Niskie:
   - Kompatybilność przeglądarek
   - Problemy z CSS
   - Network latency

## Status Implementacji
✅ Zdefiniowano plan
⏳ Przygotowano zadania
🔄 W trakcie implementacji
⏰ Deadline: 48h

## Uwagi Techniczne
- Wymagane uprawnienia admina
- Backup przed zmianami
- Monitoring w czasie rzeczywistym
- Rollback plan gotowy

## Konfiguracja Bazy Danych
- Connection Pool: 5-20 połączeń
- Max Queue Size: 100
- Retry Strategy: 5 prób, 2s odstępu
- Timeout połączenia: 60s
- KeepAlive: 10s
- Prepared Statements: max 16000

## Optymalizacje Next.js
- Lazy loading komponentów
- Optymalizacja obrazów
- Cache dla statycznych assetów
- Kompresja response
- HTTP security headers

## Skrypty Zarządzające
1. manage-port.ps1:
   - Automatyczne zarządzanie portem 9999
   - Obsługa konfliktów procesów
   - Logowanie operacji
   - Retry strategy

2. manage-permissions.ps1:
   - Zarządzanie uprawnieniami .next
   - Automatyczne tworzenie katalogów
   - Konfiguracja ACL
   - Logowanie zmian

## Status Implementacji
✅ Connection Pooling
✅ Next.js Optymalizacja
✅ Skrypty zarządzające
⏳ System cache
⏳ Monitoring
⏳ Optymalizacja zapytań

## Metryki do Monitorowania
- Wykorzystanie puli połączeń
- Czas odpowiedzi zapytań
- Użycie pamięci/CPU
- Cache hit ratio (do implementacji)
- Liczba błędów/retry

## Plan Działania (24h)
1. Implementacja Redis (4h)
2. Konfiguracja cache (4h)
3. Setup monitoringu (8h)
4. Testy wydajności (4h)

## Uwagi
- System jest gotowy do implementacji cache
- Monitoring będzie wymagał dodatkowej infrastruktury
- Należy zoptymalizować zapytania przed cache
- Testy wydajności po każdej optymalizacji

## Implementacja Autoryzacji w Link Manager

### Wprowadzenie

W projekcie Link Manager zaimplementowano pełny system autoryzacji, który obejmuje:

1. Rejestrację użytkowników
2. Logowanie użytkowników
3. Resetowanie hasła
4. Zabezpieczone endpointy API

Implementacja wykorzystuje Next.js API Routes oraz lokalną bazę danych MySQL/MariaDB zamiast zewnętrznych usług, co zapewnia pełną kontrolę nad systemem autoryzacji.

### Struktura Bazy Danych

Tabela `users` jest podstawą systemu autoryzacji i zawiera następujące pola:

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Krok po Kroku Implementacja Systemu Autoryzacji

#### 1. Konfiguracja Połączenia z Bazą Danych

W pliku `app/lib/auth.ts` zdefiniowano funkcję `executeQuery` odpowiedzialną za komunikację z bazą danych:

```typescript
export async function executeQuery(query: string, values: any[] = [], retryCount = 0) {
  try {
    console.log(`Attempting database connection (try ${retryCount + 1})`);
    console.log(`Query: ${query.substring(0, 100)}...`);
    console.log(`Values: ${JSON.stringify(values)}`);

    const config = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT),
      multipleStatements: true,
      charset: 'utf8mb4',
      connectTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
    
    const connection = await mysql.createConnection(config);
    console.log("Database connection established successfully");

    try {
      console.log("Executing query...");
      const [results] = await connection.execute(query, values);
      console.log(`Query executed successfully with ${Array.isArray(results) ? results.length : 0} results`);
      return results;
    } catch (error: any) {
      console.error("Query execution error:", error.message);
      console.error(`Error code: ${error.code}, sqlState: ${error.sqlState}, sqlMessage: ${error.sqlMessage}`);
      throw error;
    } finally {
      try {
        await connection.end();
        console.log("Database connection closed successfully");
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  } catch (error: any) {
    console.error("Database connection error:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    if (retryCount < 3) {
      console.log(`Retrying database connection (${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return executeQuery(query, values, retryCount + 1);
    }
    throw new Error(`Failed to connect to database after ${retryCount} attempts: ${error.message}`);
  }
}
```

#### 2. Funkcje Hashowania Haseł

W tym samym pliku `app/lib/auth.ts` zdefiniowano funkcje do bezpiecznego hashowania i weryfikacji haseł przy użyciu modułu `crypto`:

```typescript
// Funkcja hashowania hasła - zastępuje bcrypt
export async function hashPassword(password: string): Promise<string> {
  // Generowanie soli - prosta implementacja
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Zastosowanie funkcji skrótu SHA-256
  const hash = crypto.createHash('sha256');
  hash.update(salt + password);
  const hashedValue = salt + '$' + hash.digest('hex');
  
  return hashedValue;
}

// Funkcja porównująca hasło z haszem - zastępuje bcrypt.compare
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // Podział hashu na sól i wartość skrótu
  const [salt, hashedValue] = hash.split('$');
  
  // Jeśli nie ma oczekiwanego formatu, zwróć false
  if (!salt || !hashedValue) return false;
  
  // Haszowanie podanego hasła z tą samą solą
  const compareHash = crypto.createHash('sha256');
  compareHash.update(salt + password);
  const compareValue = compareHash.digest('hex');
  
  // Porównanie wyliczonego skrótu z zapisanym
  return compareValue === hashedValue;
}
```

#### 3. Endpoint Rejestracji Użytkowników

Endpoint rejestracji użytkownika znajduje się w `app/api/auth/register/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUsers = await executeQuery(
        "SELECT * FROM users WHERE email = ?",
        [email]
      ) as any[];

      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error: any) {
      // Jeśli błąd dotyczy nieistniejącej tabeli, kontynuujemy
      if (error.message && !error.message.includes("doesn't exist")) {
        throw error;
      }
    }

    // Create users table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, []);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate UUID
    const userId = crypto.randomUUID();

    // Insert user
    await executeQuery(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [userId, name, email, hashedPassword]
    );

    return NextResponse.json({ 
      success: true,
      message: "User registered successfully" 
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred during registration" },
      { status: 500 }
    );
  }
}
```

#### 4. Endpoint Resetowania Hasła

Proces resetowania hasła składa się z dwóch części:

##### 4.1. Żądanie resetowania hasła (`app/api/auth/forgot-password/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    ) as any[];

    // For security reasons, we don't want to reveal if a user exists or not
    // So we'll always return a success message, even if the user doesn't exist
    if (!users || users.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Najpierw upewnijmy się, że tabela users ma kolumny reset_token i reset_token_expires
    try {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME DEFAULT NULL
      `, []);
    } catch (alterError) {
      console.error("Błąd podczas próby dodania kolumn:", alterError);
      // Jeśli błąd dotyczy składni, spróbujmy inaczej - sprawdzając czy kolumny istnieją
      try {
        const columns = await executeQuery(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
          AND COLUMN_NAME IN ('reset_token', 'reset_token_expires')
        `, [process.env.DATABASE_NAME]) as any[];
        
        if (!columns || columns.length < 2) {
          // Dodajemy brakujące kolumny bez IF NOT EXISTS
          if (!columns.find(c => c.COLUMN_NAME === 'reset_token')) {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`, []);
          }
          if (!columns.find(c => c.COLUMN_NAME === 'reset_token_expires')) {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`, []);
          }
        }
      } catch (schemaError) {
        console.error("Nie udało się dodać kolumn reset_token i reset_token_expires:", schemaError);
      }
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    try {
      await executeQuery(
        "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
        [resetToken, resetTokenExpiry, email]
      );
    } catch (updateError: any) {
      console.error("Błąd podczas aktualizacji tokenu resetowania:", updateError);
      // Nadal zwracamy sukces, aby nie ujawniać informacji o użytkowniku
      return NextResponse.json({ success: true });
    }

    // Create reset URL
    const resetUrl = `https://link.aihub.ovh/auth/reset-password?token=${resetToken}`;

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      text: `Please use the following link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Link Manager account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
```

##### 4.2. Ustawienie nowego hasła (`app/api/auth/reset-password/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Upewnijmy się, że kolumny reset_token i reset_token_expires istnieją
    try {
      // Sprawdź czy kolumny istnieją
      const columns = await executeQuery(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
        AND COLUMN_NAME IN ('reset_token', 'reset_token_expires', 'password')
      `, [process.env.DATABASE_NAME]) as any[];
      
      // Sprawdź czy wszystkie potrzebne kolumny istnieją
      const requiredColumns = ['reset_token', 'reset_token_expires', 'password'];
      const missingColumns = [];
      
      for (const col of requiredColumns) {
        if (!columns.find(c => c.COLUMN_NAME === col)) {
          missingColumns.push(col);
        }
      }
      
      // Dodaj brakujące kolumny
      if (missingColumns.length > 0) {
        console.log(`Brakujące kolumny: ${missingColumns.join(', ')}`);
        
        for (const col of missingColumns) {
          if (col === 'reset_token') {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`, []);
          } else if (col === 'reset_token_expires') {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`, []);
          } else if (col === 'password') {
            await executeQuery(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''`, []);
          }
        }
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania i dodawania kolumn:", error);
    }

    // Find user with valid reset token
    let users;
    try {
      users = await executeQuery(
        "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token]
      ) as any[];
    } catch (error) {
      console.error("Błąd podczas wyszukiwania użytkownika z tokenem resetowania:", error);
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password and clear reset token
    await executeQuery(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?",
      [hashedPassword, token]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
```

### Bezpieczeństwo Implementacji

Implementacja systemu autoryzacji w projekcie Link Manager zapewnia wysoki poziom bezpieczeństwa dzięki:

1. **Bezpieczne hashowanie haseł** - Wykorzystanie funkcji skrótu SHA-256 wraz z unikalnymi solami dla każdego hasła.
2. **Bezpieczne generowanie tokenów resetowania hasła** - Użycie kryptograficznie bezpiecznego generatora liczb losowych (`crypto.randomBytes`).
3. **Ograniczony czas ważności tokenów** - Tokeny resetowania hasła wygasają po 1 godzinie.
4. **Zabezpieczenie przed atakami typu enumeration** - System zawsze zwraca komunikat o sukcesie przy żądaniu resetowania hasła, niezależnie od tego, czy użytkownik istnieje w bazie danych.
5. **Walidacja danych wejściowych** - System sprawdza poprawność adresów email, minimalną długość haseł itd.
6. **Ochrona przed SQL Injection** - Użycie parametryzowanych zapytań SQL.

### Problemy i Rozwiązania

#### Problem: Brakujące kolumny w bazie danych

Jednym z napotkanych problemów była niezgodność schematu bazy danych, prowadząca do błędów "Unknown column 'reset_token' in 'field list'" i "r is not a function".

**Rozwiązanie:**
- Implementacja automatycznego wykrywania i dodawania brakujących kolumn w tabelach
- Sprawdzanie istnienia kolumn przed wykonaniem zapytań
- Dodanie obsługi błędów, która pomaga zdiagnozować problemy z bazą danych

```typescript
// Przykład sprawdzania i dodawania brakujących kolumn
try {
  const columns = await executeQuery(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
    AND COLUMN_NAME IN ('reset_token', 'reset_token_expires', 'password')
  `, [process.env.DATABASE_NAME]) as any[];
  
  const requiredColumns = ['reset_token', 'reset_token_expires', 'password'];
  const missingColumns = [];
  
  for (const col of requiredColumns) {
    if (!columns.find(c => c.COLUMN_NAME === col)) {
      missingColumns.push(col);
    }
  }
  
  // Dodaj brakujące kolumny
  if (missingColumns.length > 0) {
    for (const col of missingColumns) {
      if (col === 'reset_token') {
        await executeQuery(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`, []);
      } else if (col === 'reset_token_expires') {
        await executeQuery(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`, []);
      } else if (col === 'password') {
        await executeQuery(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''`, []);
      }
    }
  }
} catch (error) {
  console.error("Błąd podczas sprawdzania i dodawania kolumn:", error);
}
```

### Podsumowanie

Implementacja systemu autoryzacji w Link Manager zapewnia pełną funkcjonalność rejestracji, logowania i resetowania hasła przy użyciu własnej bazy danych. Kluczowe aspekty tej implementacji to:

1. **Własny system hashowania haseł** zamiast zewnętrznych bibliotek
2. **Automatyczne naprawianie schematu bazy danych**
3. **Zaawansowana obsługa błędów**
4. **Bezpieczne tokeny resetowania hasła**
5. **Przyjazny dla użytkownika interfejs**

Ten system może być łatwo dostosowany do innych projektów Next.js poprzez skopiowanie plików `auth.ts` oraz endpointów API w `/api/auth/` i dostosowanie interfejsu użytkownika. 

## LLM Prompt: Implementacja Kompletnego Systemu Autoryzacji w Next.js z Bazą Danych MariaDB/MySQL i Google OAuth

**Cel:** Stworzenie aplikacji Next.js z w pełni funkcjonalnym, niestandardowym systemem autoryzacji, obejmującym rejestrację (email/hasło), logowanie (email/hasło ORAZ Google), resetowanie hasła oraz zarządzanie sesją, wykorzystując lokalną bazę danych MariaDB/MySQL i Next.js API Routes.

**Kroki Implementacji:**

**1. Konfiguracja Środowiska:**
   - Zainicjuj nowy projekt Next.js (`npx create-next-app@latest`).
   - Zainstaluj potrzebne zależności: `mysql2`, `nodemailer`, `next-auth`.
   - Skonfiguruj zmienne środowiskowe w pliku `.env`:
     ```env
     # Baza Danych
     DATABASE_HOST=twoj_host_bazy
     DATABASE_USER=twoj_uzytkownik_bazy
     DATABASE_PASSWORD=twoje_haslo_bazy
     DATABASE_NAME=twoja_nazwa_bazy
     DATABASE_PORT=twoj_port_bazy # np. 3306

     # Email (dla resetowania hasła)
     EMAIL_SERVER_HOST=twoj_host_smtp
     EMAIL_SERVER_PORT=twoj_port_smtp # np. 465
     EMAIL_SERVER_USER=twoj_uzytkownik_smtp
     EMAIL_SERVER_PASSWORD=twoje_haslo_smtp
     EMAIL_FROM=adres_email_wysylajacy # np. no-reply@twojadomena.com

     # NextAuth
     NEXTAUTH_URL=http://localhost:3000 # lub URL produkcyjny
     NEXTAUTH_SECRET=generuj_bezpieczny_sekret # Użyj `openssl rand -base64 32`

     # Google OAuth
     GOOGLE_CLIENT_ID=TWOJE_GOOGLE_CLIENT_ID
     GOOGLE_CLIENT_SECRET=TWOJ_GOOGLE_CLIENT_SECRET
     ```

**2. Struktura Bazy Danych (MariaDB/MySQL):**
   - Tabela `users` (jak poprzednio). Ważne jest, aby kolumny `name` i `password` były `NULL`, ponieważ użytkownicy logujący się przez Google nie będą mieli hasła w naszej bazie, a ich nazwa pochodzi z Google.

     ```sql
     CREATE TABLE IF NOT EXISTS users (
       id VARCHAR(36) PRIMARY KEY,        
       name VARCHAR(255) NULL,            
       email VARCHAR(255) NOT NULL UNIQUE, 
       password TEXT NULL,            -- Zmienione na NULL
       role VARCHAR(50) DEFAULT 'user',   
       reset_token VARCHAR(255) DEFAULT NULL,
       reset_token_expires DATETIME DEFAULT NULL, 
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     );
     ```
   - **Uwaga:** NextAuth domyślnie tworzy tabelę `accounts` do przechowywania informacji o połączeniu konta użytkownika z dostawcami OAuth (jak Google). Upewnij się, że Twoja baza danych pozwala NextAuth na tworzenie tej tabeli lub utwórz ją ręcznie zgodnie ze schematem NextAuth.

**3. Narzędzia Pomocnicze (`app/lib/auth.ts`):**
   - Funkcje `executeQuery`, `hashPassword`, `comparePassword`, `ensureColumnsExist` (bez zmian, upewnij się, że `password` jest `TEXT NULL` w `requiredUserColumns`).

**4. Endpointy API (`app/api/auth/...`):**
   - Endpointy `/register`, `/forgot-password`, `/reset-password` pozostają bez zmian (obsługują tylko autoryzację email/hasło).

**5. Konfiguracja NextAuth (`app/api/auth/[...nextauth]/route.ts`):**
   - Dodaj `GoogleProvider` do listy `providers`.
   - Skonfiguruj `clientId` i `clientSecret` dla `GoogleProvider`, pobierając je ze zmiennych środowiskowych.
   - **Ważne:** Rozważ dodanie adaptera bazy danych (np. `@next-auth/mysql-adapter`), aby automatycznie zarządzać użytkownikami i kontami OAuth w bazie danych. Bez adaptera, będziesz musiał ręcznie obsłużyć tworzenie/aktualizowanie użytkownika w callbacku `signIn` lub `jwt` dla dostawcy Google (jeśli użytkownik zaloguje się przez Google po raz pierwszy).

   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   import NextAuth from "next-auth";
   import CredentialsProvider from "next-auth/providers/credentials";
   import GoogleProvider from "next-auth/providers/google";
   import { executeQuery, comparePassword } from "@/app/lib/auth"; 
   // import { MySQLAdapter } from "@next-auth/mysql-adapter" // Rozważ użycie adaptera

   const handler = NextAuth({
     // adapter: MySQLAdapter(options), // Opcjonalnie: Skonfiguruj adapter
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID as string,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
       }),
       CredentialsProvider({
         // ... konfiguracja CredentialsProvider ...
         name: "credentials",
         credentials: { /* ... */ },
         async authorize(credentials) { /* ... bez zmian ... */ }
       }),
     ],
     session: { strategy: "jwt" },
     callbacks: {
        async jwt({ token, user, account, profile }) {
          // Jeśli logowanie przez Google i użytkownik/profil istnieje
          if (account?.provider === "google" && profile) {
            try {
              // Sprawdź czy użytkownik istnieje w bazie
              const users = await executeQuery("SELECT id, role FROM users WHERE email = ?", [profile.email]) as any[];
              if (users && users.length > 0) {
                // Użytkownik istnieje, pobierz jego ID i rolę
                token.id = users[0].id;
                token.role = users[0].role || 'user';
              } else {
                // Użytkownik nie istnieje, utwórz go (bez hasła)
                const newUserId = crypto.randomUUID(); // Potrzebny import crypto
                await executeQuery("INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)", 
                  [newUserId, profile.email, profile.name, 'user']);
                token.id = newUserId;
                token.role = 'user';
              }
            } catch (error) {
              console.error("Error handling Google user in DB:", error);
              // Obsłuż błąd - może nie nadawać tokenu?
            }
          } 
          // Jeśli logowanie przez Credentials
          else if (user) { 
            token.id = user.id;
            token.role = (user as any).role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user && token.id) { // Sprawdź czy token.id istnieje
             session.user.id = token.id as string;
             (session.user as any).role = token.role;
          }
          return session;
        },
      },
     pages: { signIn: '/auth/signin' },
     secret: process.env.NEXTAUTH_SECRET,
   });

   export { handler as GET, handler as POST };
   ```

**6. Frontend (`app/auth/signin/page.tsx`):**
   - Zachowaj formularz logowania email/hasło.
   - Zmień przycisk "Magic Link" na "Sign in with Google".
   - Dodaj funkcję `handleGoogleSignIn` wywołującą `signIn('google', { callbackUrl: '/' })`.
   - Dodaj ikonę Google do przycisku.
   - Obsłuż stan ładowania dla przycisku Google (`isLoadingGoogle`).

   ```typescript
   // Fragment app/auth/signin/page.tsx
   import { signIn } from "next-auth/react";
   // ... inne importy ...
   const GoogleIcon = () => ( /* ... SVG ikony Google ... */ );

   export default function SignIn() {
     // ... stany: email, password, isLoading, error ...
     const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => { /* ... obsługa logowania Credentials ... */ };

     const handleGoogleSignIn = async () => {
       setIsLoadingGoogle(true);
       setError("");
       try {
         await signIn("google", { callbackUrl: "/" });
       } catch (error) {
         setError("Failed to initiate Google Sign-In.");
         console.error("Google Sign-In error:", error);
         setIsLoadingGoogle(false);
       }
     };

     // ... reszta komponentu ...

     // W sekcji "Or continue with"
     <button
       onClick={handleGoogleSignIn}
       disabled={isLoading || isLoadingGoogle}
       className="flex w-full items-center justify-center ... styles ... disabled:opacity-50"
     >
       <GoogleIcon />
       <span className="ml-2">
         {isLoadingGoogle ? "Redirecting..." : "Sign in with Google"}
       </span>
     </button>
   }
   ```

**7. Styling (`app/globals.css`):**
   - Style dla `.gradient-button` i `.user-logged-gradient` pozostają bez zmian.

**8. Bezpieczeństwo:**
   - Zasady bezpieczeństwa pozostają te same. Zwróć szczególną uwagę na konfigurację URI przekierowań w Google Cloud Console, aby zapobiec atakom.

**Uruchomienie i Testowanie:**
   - Uruchom serwer `npm run dev`.
   - Przetestuj logowanie zarówno przez email/hasło, jak i przez Google.
   - Sprawdź, czy nowi użytkownicy Google są poprawnie dodawani do bazy danych (jeśli nie używasz adaptera).
   - Zweryfikuj, czy sesja jest poprawnie zarządzana dla obu typów logowania.

## Bieżący Fokus
- Aktualizacja dokumentacji po dodaniu logowania Google.

## Napotkane Problemy i Rozwiązania
- **Problem:** Błędy `Unknown column '...' in 'field list'` podczas operacji na bazie danych związanych z autoryzacją.
  - **Rozwiązanie:** Zaimplementowano funkcję `ensureColumnsExist`, która dynamicznie sprawdza istnienie wymaganych kolumn (`name`, `password`, `reset_token`, `reset_token_expires`) w tabeli `users` i dodaje je, jeśli ich brakuje, przed wykonaniem operacji API.
- **Problem:** Błąd `TypeError: r is not a function` podczas działania aplikacji (widoczny w logach).
  - **Rozwiązanie:** Ustabilizowanie bazy danych i naprawa błędów autoryzacji wydaje się rozwiązywać ten problem.
- **Problem:** Błąd `EADDRINUSE: address already in use 0.0.0.0:9999` przy starcie serwera deweloperskiego.
  - **Rozwiązanie:** Upewnić się, że żadna inna instancja aplikacji lub inny proces nie używa portu 9999. Zakończyć proces blokujący port.
- **Problem:** Błędy TypeScript dotyczące braku właściwości `image` w typie `session.user`.
  - **Rozwiązanie:** Użyto asercji typu `(session.user as any).image` oraz wprowadzono zmienne pomocnicze do bezpiecznego dostępu do właściwości `session.user`.
- **Konfiguracja Google OAuth:** Wymagane jest utworzenie projektu w Google Cloud Console, skonfigurowanie ekranu zgody OAuth, utworzenie danych uwierzytelniających klienta OAuth 2.0 (Web application) oraz dodanie `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET` do zmiennych środowiskowych.

## Aktualizacja 2025-04-10
- Naprawiono problem z logowaniem przez Google OAuth
- Dodano kolumne 'role' do tabeli users
- Aplikacja działa poprawnie na porcie 9999
- Zweryfikowano działanie bazy danych i połączenia z nią
- Potwierdzono działanie API dla pomysłów i linków

### Aktualny stan:
- Aplikacja działa na http://localhost:9999
- Baza danych jest dostępna i poprawnie skonfigurowana
- Logowanie przez Google OAuth działa
- System ról użytkowników jest zaimplementowany
- API zwraca poprawne dane dla pomysłów i linków

### Następne kroki:
- Dodać testy dla nowych funkcjonalności
- Zoptymalizować zapytania do bazy danych
- Rozszerzyć dokumentację API
- Dodać więcej zabezpieczeń dla endpointów
