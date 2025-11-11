# Coolify - Ograniczenia i Restrykcje

**Data**: 2025-11-10
**Źródło**: Oficjalna dokumentacja Coolify + GitHub Issues + Stack Overflow

---

## Spis treści

1. [Krytyczne ograniczenia](#krytyczne-ograniczenia)
2. [Ograniczenia Docker Compose](#ograniczenia-docker-compose)
3. [Problemy z Next.js + MySQL](#problemy-z-nextjs--mysql)
4. [Best Practices](#best-practices)
5. [Rozwiązania problemów](#rozwiązania-problemów)

---

## Krytyczne ograniczenia

### 1. Docker Compose jako "Single Source of Truth"

**Problem**:
Coolify traktuje plik `docker-compose.yml` jako jedyne źródło prawdy. Wiele ustawień, które normalnie konfigurujesz w UI Coolify (zmienne środowiskowe, storage, itp.) **MUSZĄ** być zdefiniowane w pliku compose.

**Implikacje**:
- ❌ NIE możesz zarządzać resource limits przez UI
- ❌ NIE możesz dodawać volumes przez UI
- ✅ Wszystko MUSI być w `docker-compose.yml`

**Nasze rozwiązanie**:
- ✅ Wszystkie zmienne środowiskowe zdefiniowane w `docker-compose.prod.yml`
- ✅ Volumes explicite zdefiniowane
- ✅ Networks explicite zdefiniowane

---

### 2. Brak Resource Limits w UI

**Problem**:
Resource limits (CPU, memory) **nie są dostępne** w Coolify UI dla deploymentów Docker Compose.

**Rozwiązanie**:
Dodaj resource limits **bezpośrednio w docker-compose.yml**:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

**Nasze rozwiązanie**:
⚠️ **TODO**: Dodać resource limits do `docker-compose.prod.yml`

---

### 3. Volume Mounting Restrictions

**Problem**:
Helper container przynosit kod, ale potem znika. **NIE możesz** montować volume z hosta do kontenera.

**Implikacje**:
- ❌ Nie możesz: `-v /host/path:/container/path`
- ✅ Musisz: kopiować app do kontenera w czasie build

**Nasze rozwiązanie**:
- ✅ Używamy multi-stage build w Dockerfile
- ✅ Wszystkie pliki kopiowane podczas build
- ✅ Named volumes tylko dla danych (mysql-data)

---

### 4. Scaling/Replicas nie działa

**Problem**:
Docker nie pozwala na preset container names gdy używasz replicas. Coolify automatycznie ustawia container names, więc **skalowanie jest niemożliwe**.

**Root cause**:
Coolify parsuje `docker-compose.yml` przed uruchomieniem i nadpisuje nazwy kontenerów.

**Workaround**:
- ❌ NIE używaj `replicas` w deploy section
- ✅ Używaj pojedynczych instancji
- ✅ Dla skalowania: użyj load balancer + wiele Coolify deployments

**Nasze rozwiązanie**:
- ✅ Single replica: `deploy: { replicas: 1 }`

---

## Ograniczenia Docker Compose

### 1. Networks

**Coolify Behavior**:
- Każdy compose stack jest deployowany do **osobnej sieci**
- Nazwa sieci: `<resource-uuid>`
- Serwisy w tym samym stacku mogą się komunikować
- Serwisy w **różnych stackach NIE mogą** się komunikować domyślnie

**Połączenie między stackami**:
Jeśli chcesz połączyć serwisy z różnych stacków (np. app → standalone MySQL):
1. Włącz "Connect to Predefined Network" w Service Stack page
2. Użyj pełnej nazwy: `postgres-<uuid>` lub `mysql-<uuid>`

**Nasze rozwiązanie**:
- ✅ App + MySQL w **tym samym compose file**
- ✅ Własna network: `linkupdate-network`
- ✅ Komunikacja wewnętrzna: `DATABASE_HOST=db`

---

### 2. Ports

**Coolify Behavior**:
- Jeśli serwis słucha na porcie **80**: wystarczy przypisać domenę
- Jeśli na **innym porcie**: dodaj port do domeny (np. `app.domain.com:3000`)
- **Pierwszy port** w expose staje się domyślnym dla health checks

**Nasze rozwiązanie**:
```yaml
services:
  app:
    ports:
      - "${APP_PORT:-3000}:3000"  # Pierwszy port = health check port
    expose:
      - 3000
```

**Best Practices**:
- ✅ Expose tylko port 3000 (aplikacja)
- ❌ NIE expose portu 3306 (MySQL) publicznie
- ✅ MySQL dostępny tylko w internal network

---

### 3. Health Checks

**Coolify Requirements**:
- Health checks **MUSZĄ** być zdefiniowane w:
  - `Dockerfile` (HEALTHCHECK instruction), LUB
  - `docker-compose.yml` (healthcheck attribute)
- Wymagane narzędzia: `curl` lub `wget` w obrazie

**Nasze rozwiązanie**:
```yaml
# docker-compose.prod.yml
services:
  app:
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get(...)"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', ...)"
```

**Uwaga**:
- Node.js jest ZAWSZE dostępny w Next.js obrazie
- Nie potrzebujemy curl/wget

---

## Problemy z Next.js + MySQL

### 1. 500 API Errors po deployment

**Symptom**:
Aplikacja deployuje się poprawnie, ale wszystkie API routes zwracają **500 Internal Server Error**.

**Przyczyny**:
1. Niewłaściwe DATABASE_HOST (np. localhost zamiast db)
2. MySQL nie jest ready podczas startu app
3. Brak `depends_on` w compose

**Nasze rozwiązanie**:
```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy  # Czeka na MySQL ready
    environment:
      DATABASE_HOST: db  # NIE localhost!
```

---

### 2. Database connection podczas build

**Problem**:
Next.js próbuje połączyć się z bazą **podczas build**, ale database container nie jest dostępny.

**Przyczyna**:
- Drizzle schema validation
- Prisma generate
- Next.js static generation

**Rozwiązanie**:
1. **Opcja A**: Skip validation podczas build
   ```typescript
   // lib/env.ts
   const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
   if (!isBuilding) {
     validateEnv();
   }
   ```

2. **Opcja B**: Use Dockerfile (recommended)
   ```dockerfile
   # Build stage - bez połączenia do DB
   FROM base AS builder
   ENV DATABASE_HOST=localhost
   RUN npm run build

   # Runtime stage - z prawdziwym DB
   FROM base AS runner
   # DATABASE_HOST z .env
   ```

**Nasze rozwiązanie**:
- ✅ Używamy Dockerfile
- ✅ Build stage ma dummy DATABASE_HOST
- ✅ Runtime stage ma prawdziwe zmienne z .env

---

### 3. Docker network configuration

**Problem**:
Docker Compose deployments mogą komunikować się **tylko w swojej własnej sieci**, nawet gdy deklarujesz networks w YAML.

**Symptom**:
```
Error: getaddrinfo ENOTFOUND mysql-uuid
```

**Rozwiązanie**:
- ✅ Wszystkie zależne serwisy w **tym samym compose file**
- ✅ Własna isolated network
- ✅ Service names jako hostnames

**Nasze rozwiązanie**:
```yaml
networks:
  linkupdate-network:
    driver: bridge

services:
  app:
    networks:
      - linkupdate-network
  db:
    networks:
      - linkupdate-network
```

---

### 4. MySQL hostname resolution

**Problem**:
Użytkownicy próbują różnych hostname: database name, container name, container ID - wszystkie failują.

**Poprawne hostname**:
- ❌ `localhost` - błąd (każdy kontener ma własny localhost)
- ❌ `127.0.0.1` - błąd (to samo co localhost)
- ❌ Container ID - nie działa (zmienia się przy każdym restart)
- ✅ **Service name z docker-compose** - to działa!

**Nasze rozwiązanie**:
```yaml
services:
  app:
    environment:
      DATABASE_HOST: db  # <-- Service name!

  db:  # <-- To jest hostname
    image: mysql:8.0
```

---

## Best Practices

### 1. Networks

**Recommended**:
```yaml
networks:
  app-network:
    driver: bridge

services:
  app:
    networks:
      - app-network
  db:
    networks:
      - app-network
```

**Zalety**:
- ✅ Izolacja od innych stacków
- ✅ Internal communication bez expose portów
- ✅ Security przez network segregation

---

### 2. Ports

**Recommended**:
```yaml
services:
  app:
    ports:
      - "3000:3000"  # Tylko dla proxy
    # NIE expose 3306 (MySQL)

  db:
    # BEZ ports: sekcji
    # Dostępny tylko w internal network
```

**Zalety**:
- ✅ MySQL niedostępny z zewnątrz
- ✅ Reduced attack surface
- ✅ Tylko proxy może dotrzeć do app

---

### 3. Health Checks

**Recommended dla Next.js**:
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 40s
```

**Zalety**:
- ✅ Nie wymaga curl/wget
- ✅ Sprawdza prawdziwy endpoint API
- ✅ Start period daje czas na build

---

### 4. Environment Variables

**Recommended**:
```yaml
services:
  app:
    environment:
      NODE_ENV: production
      DATABASE_HOST: ${DATABASE_HOST:-db}
      DATABASE_PORT: ${DATABASE_PORT:-3306}
      DATABASE_USER: ${DATABASE_USER}  # Required, no default
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}  # Required
```

**Zalety**:
- ✅ Defaults dla non-sensitive vars
- ✅ Brak defaults dla credentials
- ✅ Coolify UI highlight missing vars

---

### 5. Depends On

**Recommended**:
```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy

  db:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Zalety**:
- ✅ App czeka na ready MySQL
- ✅ Unika connection errors podczas startu
- ✅ Automatic restart jeśli DB umiera

---

## Rozwiązania problemów

### Problem: "Cannot connect to database"

**Diagnoza**:
```bash
# W Coolify logs sprawdź:
docker logs linkupdate-app | grep -i "database\|mysql\|connection"
```

**Możliwe przyczyny**:
1. DATABASE_HOST nie jest "db"
2. MySQL nie jest healthy
3. Brak depends_on

**Rozwiązanie**:
```yaml
services:
  app:
    environment:
      DATABASE_HOST: db  # Service name!
    depends_on:
      db:
        condition: service_healthy
```

---

### Problem: "Health check failing"

**Diagnoza**:
```bash
# Sprawdź endpoint
docker exec linkupdate-app curl http://localhost:3000/api/health

# Sprawdź czy aplikacja słucha na porcie 3000
docker exec linkupdate-app netstat -tuln | grep 3000
```

**Możliwe przyczyny**:
1. Aplikacja nie startuje (sprawdź logi)
2. Port niepoprawny
3. API health endpoint nie istnieje

**Rozwiązanie**:
Upewnij się że:
- ✅ `/api/health` endpoint istnieje
- ✅ Port w health check = exposed port
- ✅ Start period jest wystarczający (40s+)

---

### Problem: "Build fails with database connection error"

**Symptom**:
```
Error: Cannot connect to database during build
```

**Rozwiązanie**:
Używaj Dockerfile z dummy env podczas build:

```dockerfile
FROM base AS builder
ENV DATABASE_HOST=localhost
ENV DATABASE_PORT=3306
RUN npm run build

FROM base AS runner
# Prawdziwe env z .env
```

---

### Problem: "Service name not resolving"

**Symptom**:
```
getaddrinfo ENOTFOUND db
```

**Rozwiązanie**:
1. Sprawdź że app i db są w tej samej network
2. Użyj service name (nie container name)
3. Sprawdź że depends_on jest skonfigurowany

```yaml
services:
  app:
    networks:
      - linkupdate-network
    depends_on:
      - db

  db:
    networks:
      - linkupdate-network

networks:
  linkupdate-network:
    driver: bridge
```

---

## Checklist przed deployment na Coolify

### Pre-deployment:

- [ ] Docker Compose używa service names jako hostnames
- [ ] Wszystkie zmienne środowiskowe mają defaults lub są required
- [ ] Health checks zdefiniowane w compose/Dockerfile
- [ ] depends_on używa `condition: service_healthy`
- [ ] Resource limits zdefiniowane w compose (opcjonalnie)
- [ ] Networks explicite zdefiniowane
- [ ] Volumes dla persistent data (mysql-data)
- [ ] Ports expose tylko dla proxy (3000), nie dla DB (3306)
- [ ] .env.example zawiera wszystkie required vars

### Post-deployment:

- [ ] Sprawdź logi: Coolify UI → Logs
- [ ] Sprawdź health: `curl https://your-domain.com/api/health`
- [ ] Sprawdź database connection: Logi nie zawierają connection errors
- [ ] Sprawdź API routes: Test login, data fetch
- [ ] Sprawdź SSL: Coolify automatycznie provisioned
- [ ] Setup monitoring: Enable health check alerts

---

## Podsumowanie kluczowych zmian w naszej konfiguracji

### ✅ Co mamy dobrze:

1. **App + DB w tym samym compose** - unika problemów z cross-stack networking
2. **Service names jako hostnames** - `DATABASE_HOST=db`
3. **Health checks w compose i Dockerfile** - podwójna ochrona
4. **depends_on z condition** - app czeka na ready MySQL
5. **Isolated network** - security przez segregację
6. **No exposed MySQL port** - dostępny tylko internal
7. **Environment validation** - Zod catch missing vars
8. **Dummy env podczas build** - unika build-time DB errors

### ⚠️ Co powinniśmy dodać (opcjonalnie):

1. **Resource limits** - prevent runaway containers
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 2G
   ```

2. **Logging configuration** - structured logs
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### ❌ Co NIE robić:

1. ❌ NIE używaj localhost jako DATABASE_HOST
2. ❌ NIE expose MySQL port (3306) publicznie
3. ❌ NIE próbuj scalować z replicas
4. ❌ NIE zarządzaj resource limits przez UI
5. ❌ NIE montuj volumes z host FS
6. ❌ NIE używaj container names (tylko service names)

---

**Status**: ✅ **Nasza konfiguracja jest zgodna z Coolify best practices**

Wszystkie znane ograniczenia zostały wzięte pod uwagę w naszym `docker-compose.prod.yml` i konfiguracji. Deployment na Coolify powinien przebiec bez problemów.
