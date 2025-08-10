# Wzorce Systemowe

## Architektura

### Frontend
1. **Komponenty**
   - Funkcyjne komponenty React
   - Hooks dla zarządzania stanem
   - Dynamiczny import dla heavy components
   - Suspense dla lazy loading

2. **Zarządzanie Stanem**
   - Local state z useState
   - useEffect dla side effects
   - Context API dla globalnego stanu
   - Custom hooks dla reużywalnej logiki

3. **Routing**
   - Next.js App Router
   - Dynamic routes
   - Loading states
   - Error boundaries

### Backend
1. **API**
   - REST endpoints
   - API Routes w Next.js
   - Walidacja requestów
   - Error handling

2. **Baza Danych**
   - MariaDB
   - Drizzle ORM
   - Connection pooling
   - Migracje

## Wzorce Projektowe

### Frontend Patterns
1. **Component Patterns**
   ```typescript
   // Compound Components
   const Form = ({ children }) => <form>{children}</form>;
   Form.Input = ({ ...props }) => <input {...props} />;
   Form.Button = ({ ...props }) => <button {...props} />;

   // Container/Presenter Pattern
   const LinkListContainer = () => {
     const [links, setLinks] = useState([]);
     return <LinkList links={links} />;
   };
   ```

2. **Hook Patterns**
   ```typescript
   // Custom Hook Pattern
   const useLinks = () => {
     const [links, setLinks] = useState([]);
     const fetchLinks = useCallback(() => {
       // fetch logic
     }, []);
     return { links, fetchLinks };
   };
   ```

3. **Error Boundary Pattern**
   ```typescript
   class ErrorBoundary extends React.Component {
     state = { hasError: false };
     static getDerivedStateFromError() {
       return { hasError: true };
     }
     render() {
       if (this.state.hasError) {
         return <ErrorFallback />;
       }
       return this.props.children;
     }
   }
   ```

### Backend Patterns
1. **Repository Pattern**
   ```typescript
   class LinkRepository {
     async findAll() {
       return db.select().from(links);
     }
     async findById(id: number) {
       return db.select().from(links).where(eq(links.id, id));
     }
   }
   ```

2. **Service Pattern**
   ```typescript
   class LinkService {
     constructor(private repo: LinkRepository) {}
     async getLinks() {
       return this.repo.findAll();
     }
     async createLink(data: CreateLinkDTO) {
       // validation logic
       return this.repo.create(data);
     }
   }
   ```

## Konwencje

### Nazewnictwo
1. **Komponenty**
   - PascalCase dla komponentów
   - camelCase dla funkcji i zmiennych
   - UPPER_CASE dla stałych

2. **Pliki**
   - `.tsx` dla komponentów React
   - `.ts` dla utility functions
   - `.test.tsx` dla testów

3. **Style**
   - Tailwind utility classes
   - CSS modules dla custom styles
   - BEM dla nazwania klas

### Struktura Projektu
```
src/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   └── globals.css
  ├── components/
  │   ├── ui/
  │   ├── forms/
  │   └── layout/
  ├── lib/
  │   ├── db/
  │   └── utils/
  ├── types/
  └── styles/
```

## Wzorce Testowania

### Unit Tests
```typescript
describe('LinkForm', () => {
  it('should submit form with valid data', () => {
    // test implementation
  });
});
```

### Integration Tests
```typescript
describe('Link API', () => {
  it('should create new link', async () => {
    // test implementation
  });
});
```

## Wzorce Optymalizacji

### Performance Patterns
1. **Code Splitting**
   ```typescript
   const DynamicComponent = dynamic(() => import('./Component'));
   ```

2. **Memoization**
   ```typescript
   const MemoizedComponent = React.memo(Component);
   const memoizedValue = useMemo(() => computeValue(), [deps]);
   ```

3. **Lazy Loading**
   ```typescript
   const LazyComponent = lazy(() => import('./Component'));
   ```

## Security Patterns

### Data Validation
```typescript
const validateLink = (data: unknown): LinkData => {
  // validation logic
};
```

### Error Handling
```typescript
try {
  await api.post('/links', data);
} catch (error) {
  handleError(error);
}
```

## Monitoring Patterns

### Logging
```typescript
const logger = {
  error: (err: Error) => console.error(err),
  info: (msg: string) => console.log(msg),
};
```

### Performance Monitoring
```typescript
const withPerformance = (fn: Function) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  logger.info(`Execution time: ${end - start}ms`);
  return result;
};
```

## Plan Optymalizacji Aplikacji

### 1. Problemy Krytyczne
1. Konflikty portów (EADDRINUSE: port 9999)
   - Przyczyna: Poprzednia instancja aplikacji nie została prawidłowo zamknięta
   - Rozwiązanie: Implementacja skryptu czyszczącego procesy

2. Problemy z uprawnieniami (EPERM: .next/trace)
   - Przyczyna: Brak uprawnień do zapisu w katalogu .next
   - Rozwiązanie: Konfiguracja uprawnień i obsługa błędów

3. Długi czas pierwszego wczytania
   - Przyczyna: Nieoptymalna konfiguracja Next.js i bazy danych
   - Rozwiązanie: Optymalizacja build time i runtime

### 2. Plan Działania

#### Faza 1: Optymalizacja Środowiska
1. Zarządzanie procesami
   ```bash
   # Skrypt do automatycznego zarządzania portami
   check_port.sh
   kill_port.sh
   ```

2. Konfiguracja uprawnień
   - Struktura katalogów z odpowiednimi uprawnieniami
   - Obsługa błędów dostępu do plików

3. Monitoring zasobów
   - Narzędzia do monitorowania CPU/RAM
   - Logi wydajności

#### Faza 2: Optymalizacja Next.js
1. Build time
   - Optymalizacja importów
   - Lazy loading komponentów
   - Code splitting

2. Runtime
   - Implementacja cache
   - Optymalizacja obrazów
   - Server-side rendering strategia

3. Konfiguracja
   ```javascript
   // next.config.js optymalizacje
   module.exports = {
     experimental: {
       optimizeCss: true,
       optimizeImages: true,
       optimizeFonts: true
     },
     compiler: {
       removeConsole: process.env.NODE_ENV === 'production'
     }
   }
   ```

#### Faza 3: Optymalizacja Bazy Danych
1. Połączenia
   - Connection pooling
   - Retry strategy
   - Timeout settings

2. Zapytania
   - Indeksowanie
   - Query caching
   - Prepared statements

3. Migracje
   - Konsolidacja migracji
   - Optymalizacja schematów
   - Automatyzacja procesu

### 3. Metryki Wydajności
1. Frontend
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

2. Backend
   - Response time
   - Database query time
   - Memory usage

3. System
   - CPU utilization
   - Memory consumption
   - Network latency

### 4. Harmonogram Wdrożenia
1. Tydzień 1: Środowisko
   - Skrypty zarządzania procesami
   - Konfiguracja uprawnień
   - Setup monitoringu

2. Tydzień 2: Next.js
   - Optymalizacja budowania
   - Implementacja cachingu
   - Code splitting

3. Tydzień 3: Baza Danych
   - Connection pooling
   - Optymalizacja zapytań
   - Migracje

### 5. Monitoring i Utrzymanie
1. Narzędzia
   - Prometheus/Grafana
   - New Relic
   - Custom logging

2. Alerty
   - Performance thresholds
   - Error rates
   - Resource usage

3. Dokumentacja
   - Performance guidelines
   - Troubleshooting guides
   - Maintenance procedures

### 6. Bezpieczeństwo
1. Audyt
   - Security scanning
   - Dependency check
   - Code review

2. Implementacja
   - Rate limiting
   - Input validation
   - Error handling

3. Monitoring
   - Security logs
   - Access patterns
   - Anomaly detection 