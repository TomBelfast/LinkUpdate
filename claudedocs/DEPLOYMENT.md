# LinkUpdate - Dokumentacja Deployment

Ostatnia aktualizacja: 2025-11-10

## Spis treści

1. [Przegląd](#przegląd)
2. [Wymagania](#wymagania)
3. [Deployment z Docker](#deployment-z-docker)
4. [Deployment na Coolify](#deployment-na-coolify)
5. [Konfiguracja środowiska](#konfiguracja-środowiska)
6. [Troubleshooting](#troubleshooting)

---

## Przegląd

LinkUpdate to aplikacja Next.js 15 z MySQL, przygotowana do deployment w kontenerach Docker lub na platformie Coolify.

**Kluczowe cechy:**
- ✅ Multi-stage Dockerfile zoptymalizowany pod produkcję
- ✅ Docker Compose dla development i production
- ✅ **Wewnętrzna baza MySQL w kontenerze** - nie potrzebujesz zewnętrznego serwera
- ✅ Zod validation dla zmiennych środowiskowych
- ✅ Health checks dla monitoringu
- ✅ Bezpieczna konfiguracja (brak hard-coded credentials)
- ✅ Konfiguracja Coolify z automatycznym deployment
- ✅ Persistent storage dla danych (Docker volumes)

> **Uwaga**: Domyślnie używamy **wewnętrznej bazy MySQL** w kontenerze Docker. Dla zewnętrznej bazy, zobacz [DATABASE-SETUP.md](./DATABASE-SETUP.md)

---

## Wymagania

### Minimalne wymagania systemowe:
- **CPU**: 2 cores
- **RAM**: 2GB (minimum), 4GB (recommended)
- **Storage**: 10GB wolnej przestrzeni
- **Docker**: 20.10+ lub Coolify 4.0+

### Wymagane zmienne środowiskowe:

**Krytyczne (MUSZĄ być ustawione):**
```bash
NEXTAUTH_SECRET=          # Min. 32 znaki - wygeneruj: openssl rand -base64 32
DATABASE_USER=            # Użytkownik MySQL
DATABASE_PASSWORD=        # Hasło MySQL
DATABASE_NAME=            # Nazwa bazy danych
MYSQL_ROOT_PASSWORD=      # Root password MySQL
GOOGLE_ID=                # Google OAuth Client ID
GOOGLE_SECRET=            # Google OAuth Client Secret
```

**Opcjonalne (AI providers):**
```bash
OPENAI_API_KEY=           # Dla OpenAI API
ANTHROPIC_API_KEY=        # Dla Claude API
GOOGLE_AI_API_KEY=        # Dla Google Gemini
PPLX_API_KEY=             # Dla Perplexity AI
```

**Automatyczne (z domyślnymi wartościami):**
```bash
DATABASE_HOST=db          # Hostname kontenera MySQL
DATABASE_PORT=3306        # Port MySQL
APP_PORT=3000             # Port aplikacji (prod) lub 9999 (dev)
NEXTAUTH_URL=             # URL aplikacji (ustaw dla production)
```

---

## Deployment z Docker

### 1. Przygotowanie środowiska

#### Krok 1: Sklonuj repozytorium
```bash
git clone https://github.com/your-repo/LinkUpdate.git
cd LinkUpdate
```

#### Krok 2: Utwórz plik `.env`
```bash
cp .env.example .env
nano .env
```

**Minimalna konfiguracja `.env`:**
```bash
# Authentication
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_USER=linkupdate
DATABASE_PASSWORD=SecurePassword123!
DATABASE_NAME=linkupdate
MYSQL_ROOT_PASSWORD=RootPassword123!

# Google OAuth
GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_SECRET=your-google-client-secret

# AI Providers (opcjonalne)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Production Deployment

#### Opcja A: Docker Compose (Recommended)

```bash
# Build i start
docker-compose -f docker-compose.prod.yml up -d

# Sprawdź logi
docker-compose -f docker-compose.prod.yml logs -f app

# Sprawdź status
docker-compose -f docker-compose.prod.yml ps

# Health check
curl http://localhost:3000/api/health
```

#### Opcja B: Samodzielny Docker Build

```bash
# Build obrazu
docker build -t linkupdate:latest .

# Run z MySQL
docker network create linkupdate-network

docker run -d \
  --name linkupdate-db \
  --network linkupdate-network \
  -e MYSQL_ROOT_PASSWORD=RootPassword123! \
  -e MYSQL_DATABASE=linkupdate \
  -e MYSQL_USER=linkupdate \
  -e MYSQL_PASSWORD=SecurePassword123! \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

docker run -d \
  --name linkupdate-app \
  --network linkupdate-network \
  -p 3000:3000 \
  --env-file .env \
  linkupdate:latest

# Sprawdź logi
docker logs -f linkupdate-app
```

### 3. Development Deployment

```bash
# Development z hot-reload
docker-compose -f docker-compose.dev.yml up

# Aplikacja dostępna na: http://localhost:9999
```

### 4. Komendy zarządzania

```bash
# Stop kontenerów
docker-compose -f docker-compose.prod.yml down

# Stop + usuń volumes (UWAGA: usuwa dane z bazy!)
docker-compose -f docker-compose.prod.yml down -v

# Restart aplikacji
docker-compose -f docker-compose.prod.yml restart app

# Update obrazu
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Sprawdź health check
docker inspect linkupdate-app | grep -A 10 Health
```

---

## Deployment na Coolify

### 1. Przygotowanie projektu

#### Krok 1: Push do Git repository
```bash
git add .
git commit -m "Prepare for Coolify deployment"
git push origin main
```

### 2. Konfiguracja w Coolify

#### Krok 1: Utwórz nowy projekt
1. Zaloguj się do Coolify dashboard
2. Kliknij "New Resource" → "Docker Compose"
3. Wybierz repozytorium Git (GitHub/GitLab/Gitea)

#### Krok 2: Konfiguracja projektu
- **Name**: LinkUpdate
- **Branch**: main (lub master)
- **Docker Compose File**: `docker-compose.prod.yml`
- **Build Pack**: Docker Compose

#### Krok 3: Dodaj zmienne środowiskowe

W sekcji "Environment Variables" dodaj:

**Required:**
```
NEXTAUTH_SECRET=<wygeneruj: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com
DATABASE_USER=linkupdate
DATABASE_PASSWORD=<bezpieczne hasło>
DATABASE_NAME=linkupdate
MYSQL_ROOT_PASSWORD=<bezpieczne hasło>
GOOGLE_ID=<Google OAuth Client ID>
GOOGLE_SECRET=<Google OAuth Client Secret>
```

**Optional:**
```
OPENAI_API_KEY=<twój klucz>
ANTHROPIC_API_KEY=<twój klucz>
GOOGLE_AI_API_KEY=<twój klucz>
PPLX_API_KEY=<twój klucz>
```

#### Krok 4: Konfiguracja domeny
1. Przejdź do "Domains"
2. Dodaj swoją domenę (np. `linkupdate.yourdomain.com`)
3. Coolify automatycznie skonfiguruje SSL (Let's Encrypt)

#### Krok 5: Deploy
1. Kliknij "Deploy"
2. Coolify:
   - Sklonuje repozytorium
   - Zbuduje obraz Docker
   - Uruchomi kontener z docker-compose.prod.yml
   - Skonfiguruje reverse proxy + SSL

### 3. Post-deployment

#### Sprawdź status:
```bash
# Health check
curl https://your-domain.com/api/health

# Sprawdź logi w Coolify dashboard
# Logi → Application Logs
```

#### Konfiguracja automatycznego deployment:
1. W Coolify: Settings → "Enable Automatic Deployment"
2. Każdy push do `main` branch automatycznie triggeruje deployment

---

## Konfiguracja środowiska

### Generowanie NEXTAUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Google OAuth Setup

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz "Google+ API"
4. Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```
7. Skopiuj Client ID i Client Secret do `.env`

### Database Migration

Po pierwszym uruchomieniu, wykonaj migrację bazy:

```bash
# Jeśli używasz Docker Compose
docker-compose -f docker-compose.prod.yml exec app npm run db:push

# Jeśli używasz standalone Docker
docker exec linkupdate-app npm run db:push
```

---

## Troubleshooting

### Problem: Błąd "Missing required environment variables"

**Rozwiązanie:**
```bash
# Sprawdź czy .env jest poprawnie załadowany
docker-compose -f docker-compose.prod.yml config

# Zweryfikuj wartości zmiennych
docker-compose -f docker-compose.prod.yml exec app env | grep DATABASE
```

### Problem: "Cannot connect to MySQL"

**Rozwiązanie:**
```bash
# Sprawdź czy MySQL container działa
docker-compose -f docker-compose.prod.yml ps db

# Sprawdź logi MySQL
docker-compose -f docker-compose.prod.yml logs db

# Sprawdź health check
docker inspect linkupdate-db | grep -A 10 Health

# Testuj połączenie
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p
```

### Problem: Build timeout lub out of memory

**Rozwiązanie:**
```bash
# Zwiększ memory limit dla Docker
# Docker Desktop → Settings → Resources → Memory: 4GB+

# Lub użyj NODE_OPTIONS podczas build
docker build --build-arg NODE_OPTIONS="--max-old-space-size=4096" -t linkupdate:latest .
```

### Problem: Health check failing

**Rozwiązanie:**
```bash
# Sprawdź endpoint health
docker-compose -f docker-compose.prod.yml exec app curl http://localhost:3000/api/health

# Sprawdź logi aplikacji
docker-compose -f docker-compose.prod.yml logs app | tail -100

# Sprawdź czy port 3000 jest otwarty
docker-compose -f docker-compose.prod.yml exec app netstat -tulpn | grep 3000
```

### Problem: "dangerouslyAllowBrowser" error w logu

**To nie powinno się już zdarzyć** - naprawione w Sprint 1.
Jeśli jednak widzisz ten błąd:
```bash
# Zweryfikuj że używasz najnowszej wersji
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Problem: Google OAuth redirect error

**Rozwiązanie:**
```bash
# Sprawdź NEXTAUTH_URL
echo $NEXTAUTH_URL

# Musi być:
# - http://localhost:3000 dla local development
# - https://your-domain.com dla production

# Sprawdź Authorized redirect URIs w Google Cloud Console
# Musi zawierać: https://your-domain.com/api/auth/callback/google
```

---

## Monitoring i Maintenance

### Health Checks

Aplikacja udostępnia health check endpoint:
```bash
curl http://localhost:3000/api/health
```

Odpowiedź:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Logi

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml logs -f

# Tylko aplikacja
docker-compose -f docker-compose.prod.yml logs -f app

# Tylko baza danych
docker-compose -f docker-compose.prod.yml logs -f db

# Ostatnie 100 linii
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Backup bazy danych

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec db mysqldump \
  -u root -p$MYSQL_ROOT_PASSWORD $DATABASE_NAME > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T db mysql \
  -u root -p$MYSQL_ROOT_PASSWORD $DATABASE_NAME < backup.sql
```

### Update aplikacji

```bash
# Pull latest changes
git pull origin main

# Rebuild i restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Sprawdź logi
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## Security Checklist

Przed production deployment, zweryfikuj:

- [ ] `NEXTAUTH_SECRET` ma min. 32 znaki (wygenerowany losowo)
- [ ] `DATABASE_PASSWORD` i `MYSQL_ROOT_PASSWORD` są silne i unikalne
- [ ] `.env` jest w `.gitignore` (NIE commituj secrets do Git!)
- [ ] `NEXTAUTH_URL` wskazuje na właściwą domenę production
- [ ] Google OAuth Authorized redirect URIs zawiera production URL
- [ ] SSL certyfikat jest aktywny (Coolify automatycznie)
- [ ] Health check endpoint odpowiada poprawnie
- [ ] Firewall zezwala tylko na port 80/443 (HTTP/HTTPS)
- [ ] Database port (3306) NIE jest dostępny publicznie
- [ ] Backup bazy danych jest skonfigurowany

---

## Przydatne komendy

### Docker

```bash
# Sprawdź rozmiar obrazów
docker images | grep linkupdate

# Usuń nieużywane obrazy
docker image prune -a

# Sprawdź zużycie zasobów
docker stats linkupdate-app linkupdate-db

# Wejdź do kontenera
docker exec -it linkupdate-app sh

# Sprawdź zmienne środowiskowe
docker exec linkupdate-app env
```

### Database

```bash
# Wejdź do MySQL console
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p

# Sprawdź tabele
docker-compose -f docker-compose.prod.yml exec db mysql \
  -u root -p$MYSQL_ROOT_PASSWORD \
  -e "USE $DATABASE_NAME; SHOW TABLES;"

# Sprawdź użytkowników
docker-compose -f docker-compose.prod.yml exec db mysql \
  -u root -p$MYSQL_ROOT_PASSWORD \
  -e "SELECT user, host FROM mysql.user;"
```

---

## Wsparcie

Jeśli masz problemy z deployment:

1. Sprawdź [Troubleshooting](#troubleshooting)
2. Przejrzyj logi: `docker-compose logs -f`
3. Sprawdź dokumentację:
   - [Next.js Deployment](https://nextjs.org/docs/deployment)
   - [Docker Compose](https://docs.docker.com/compose/)
   - [Coolify Documentation](https://coolify.io/docs)

---

**Status**: ✅ Gotowe do deployment
**Ostatnia weryfikacja**: 2025-11-10
**Wersja**: 1.0.0
