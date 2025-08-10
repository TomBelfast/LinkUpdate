# Kontekst Techniczny

## Stack Technologiczny
- Next.js 13+ z App Router
- TypeScript
- MySQL (MariaDB 10)
- NextAuth.js dla autentykacji
- Tailwind CSS dla stylowania
- Drizzle ORM dla operacji na bazie danych

## Konfiguracja Środowiska
- Port aplikacji: 9999
- Host: 0.0.0.0
- Baza danych: MariaDB 10 na porcie 3306
- Node.js v18+

## Autentykacja
- Google OAuth2
- System ról użytkowników
- Sesje przechowywane w bazie danych

## API Endpoints
- /api/auth/* - endpointy autentykacji
- /api/links - zarządzanie linkami
- /api/ideas - zarządzanie pomysłami

## Baza Danych
### Tabela users
- id (UUID)
- email (VARCHAR)
- name (VARCHAR)
- role (VARCHAR)
- password (VARCHAR, optional)
- reset_token (VARCHAR, optional)
- reset_token_expires (TIMESTAMP, optional)

## Zmienne Środowiskowe
- DATABASE_* - konfiguracja bazy danych
- GOOGLE_ID - ID klienta Google OAuth
- GOOGLE_SECRET - Secret klienta Google OAuth
- NEXTAUTH_SECRET - Secret dla NextAuth
- NEXTAUTH_URL - URL aplikacji

## Narzędzia Developerskie
- VS Code/Cursor jako IDE
- Git dla kontroli wersji
- npm jako package manager
- ESLint dla statycznej analizy kodu
- Prettier dla formatowania

## Infrastruktura
- Baza danych MariaDB
- API Routes w Next.js
- Drizzle ORM

## Narzędzia Developerskie
- VS Code/Cursor
- ESLint
- Prettier
- Git

## Znane Problemy
1. Problem z komponentem TodoForm (wymaga refaktoryzacji)
2. Błąd z klasą border-border w Tailwind
3. Optymalizacja ładowania obrazów

## Planowane Ulepszenia
1. Implementacja pełnego systemu zarządzania pomysłami
2. Dodanie systemu tagów
3. Integracja z zewnętrznymi API
4. Rozbudowa systemu powiadomień

## Stack Technologiczny

### Frontend
- Next.js 14.1.0
- React 18.2.0
- TypeScript 5.7.3
- Tailwind CSS 3.3.0
- HeadlessUI 2.2.0

### Backend
- Node.js 20+
- Next.js API Routes
- Drizzle ORM 0.29.3
- MySQL2 3.9.2

### Baza Danych
- MariaDB 10
- Connection Pooling (5-20 połączeń)
- Prepared Statements
- Automatyczne migracje

### Narzędzia
- Docker
- PowerShell (skrypty zarządzające)
- ESLint/Prettier
- Vitest

## Architektura

### Warstwa Frontendowa
- Server Components (Next.js)
- Client Components (React)
- Lazy Loading
- Optymalizacja obrazów
- Security Headers

### Warstwa Backendowa
- API Routes
- Connection Pooling
- Retry Strategy
- Error Handling
- Transakcje

### Warstwa Danych
- Drizzle ORM
- Migracje
- Indeksy
- Optymalizacje zapytań

## Optymalizacje

### Frontend
- Code Splitting
- Tree Shaking
- Image Optimization
- Bundle Size Reduction
- Lazy Loading

### Backend
- Connection Pooling
- Query Caching (planowane)
- Response Compression
- Error Recovery
- Request Batching

### Baza Danych
- Connection Management
- Query Optimization
- Index Strategy
- Transaction Management
- Retry Logic

## Bezpieczeństwo

### Aplikacja
- Security Headers
- Input Validation
- Error Handling
- Rate Limiting (planowane)
- CORS Policy

### Baza Danych
- Prepared Statements
- Connection Encryption
- Access Control
- Query Sanitization
- Audit Logging

## Monitoring

### Aplikacja
- Error Tracking
- Performance Metrics
- User Analytics
- Resource Usage
- API Monitoring

### Baza Danych
- Query Performance
- Connection Pool Stats
- Error Rates
- Resource Usage
- Lock Monitoring

## Deployment

### Środowisko
- Docker Containers
- Process Management
- Port Management
- Permission Management
- Logging System

### CI/CD
- Automated Testing (planowane)
- Build Optimization
- Deployment Scripts
- Rollback Strategy
- Health Checks

## Konfiguracja

### Next.js
```javascript
{
  experimental: {
    serverActions: true,
    optimizePackageImports: true,
    optimizeCss: true,
    scrollRestoration: true
  },
  images: {
    unoptimized: false,
    formats: ['image/webp']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}
```

### Baza Danych
```typescript
{
  connectionLimit: 20,
  queueLimit: 100,
  connectTimeout: 60000,
  keepAliveDelay: 10000,
  maxPreparedStatements: 16000,
  charset: 'utf8mb4'
}
```

### TypeScript
```json
{
  "strict": true,
  "target": "ES2022",
  "module": "ESNext",
  "moduleResolution": "node",
  "esModuleInterop": true,
  "skipLibCheck": true
}
```

## Skrypty

### Zarządzanie Portem
- `manage-port.ps1`: Zarządzanie portem 9999
- Automatyczne czyszczenie procesów
- Retry strategy
- Logging

### Zarządzanie Uprawnieniami
- `manage-permissions.ps1`: Zarządzanie .next
- Automatyczne tworzenie katalogów
- ACL configuration
- Error handling

## Metryki

### Performance
- TTFB: <100ms
- FCP: <1.5s
- LCP: <2.5s
- TTI: <3.5s

### Baza Danych
- Query Time: <50ms
- Connection Time: <100ms
- Pool Usage: 30%
- Error Rate: <0.1%

## Planowane Rozszerzenia

### Cache
- Redis/Memcached
- Query Cache
- Static Assets
- API Responses
- Session Data

### Monitoring
- Prometheus
- Grafana
- Custom Metrics
- Alerting System
- Performance Tracking

## Struktura Projektu
```
link/
├── app/           # Główne komponenty aplikacji
├── components/    # Reużywalne komponenty UI
├── config/        # Konfiguracja aplikacji
├── contexts/      # React Contexts
├── data/         # Statyczne dane
├── db/           # Logika bazy danych
├── drizzle/      # Migracje i schema Drizzle
├── hooks/        # Custom React hooks
├── lib/          # Biblioteki i utilities
├── public/       # Statyczne assety
├── styles/       # Globalne style
└── types/        # TypeScript types
```

## Środowiska
- **Development**: docker-compose.dev.yml
- **Produkcja**: docker-compose.yml
- **Windows**: start-windows.bat
- **Linux/Mac**: start.sh

## Konfiguracja Developmentu
- Node.js 18+
- Docker Desktop
- VS Code z rekomendowanymi rozszerzeniami
- MariaDB 10+

## Specyfikacja Bazy Danych
### MariaDB 10
- **Silnik**: InnoDB
- **Kodowanie**: UTF8MB4
- **Collation**: utf8mb4_unicode_ci
- **Typy kolumn**:
  - ID: varchar(128) dla UUID
  - Teksty krótkie: varchar z określoną długością
  - Teksty długie: text
  - Daty: timestamp
  - Statusy: enum
  - Liczby całkowite: int
  - Wartości logiczne: boolean

## Konwencje i Best Practices
- Funkcje strzałkowe dla komponentów
- Absolutne importy (@/...)
- Interfejsy zamiast typów
- Podejście funkcyjne
- Pełne typowanie 

## Nowy System TO-DO

### Schema Bazy Danych
```sql
-- Tabela Projects
CREATE TABLE projects (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'PAUSED', 'COMPLETED') DEFAULT 'ACTIVE',
    priority INT NOT NULL DEFAULT 1,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela Tasks
CREATE TABLE tasks (
    id VARCHAR(128) PRIMARY KEY,
    project_id VARCHAR(128),
    description TEXT NOT NULL,
    status ENUM('NEW', 'IN_PROGRESS', 'PENDING_FEEDBACK', 'DONE') DEFAULT 'NEW',
    due_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Pozostałe tabele (ideas, resources, widget_configurations)
```

### Komponenty UI
- ProjectCard: Zarządzanie projektami
- TaskCard: Zarządzanie zadaniami
- IdeaCard: Zarządzanie pomysłami
- ResourceCard: Zarządzanie zasobami
- KanbanBoard: Drag & Drop zadań
- Dashboard: Konfigurowalne widgety

### API Endpoints
- /api/todo/projects: Zarządzanie projektami
- /api/todo/tasks: Zarządzanie zadaniami
- /api/todo/ideas: Zarządzanie pomysłami
- /api/todo/resources: Zarządzanie zasobami
- /api/todo/widgets: Konfiguracja widgetów

### Technologie Specyficzne
- react-beautiful-dnd: Drag & Drop
- TanStack Query: Zarządzanie stanem
- Zod: Walidacja danych
- date-fns: Obsługa dat 