# Konfiguracja Coolify - Production i Development

Ten dokument opisuje jak skonfigurować **dwa osobne środowiska** w Coolify:
- **Production** - stabilna wersja, stale działająca
- **Development** - wersja do ciągłej pracy i rozwoju

---

## 📋 Wymagania

- Konto na Coolify
- Dostęp do repozytorium Git (GitHub/GitLab/Gitea)
- Dwie domeny/subdomeny:
  - `link3.aihub.ovh` (lub inna) - dla produkcji
  - `dev.link3.aihub.ovh` (lub inna) - dla developmentu

---

## 🚀 Krok 1: Przygotowanie repozytorium

Upewnij się, że masz następujące pliki w repozytorium:

```
├── Dockerfile                    # Obraz dla produkcji
├── docker-compose.prod.yml       # Konfiguracja produkcji
├── docker-compose.dev.yml        # Konfiguracja developmentu
├── coolify.prod.json            # Konfiguracja Coolify dla produkcji
├── coolify.dev.json             # Konfiguracja Coolify dla developmentu
└── .env.example                 # Przykładowe zmienne środowiskowe
```

**Commit i push:**
```bash
git add .
git commit -m "Add Coolify configuration for production and development"
git push origin main
```

---

## 🏭 Krok 2: Konfiguracja Production w Coolify

### 2.1. Utworzenie projektu Production

1. Zaloguj się do Coolify dashboard
2. Kliknij **"New Resource"** → **"Docker Compose"**
3. Wybierz swoje repozytorium Git

### 2.2. Konfiguracja projektu Production

**Podstawowe ustawienia:**
- **Name**: `LinkUpdate-Production`
- **Description**: `Production deployment - Stable version`
- **Branch**: `main` (lub `master`)
- **Docker Compose File**: `docker-compose.prod.yml`
- **Build Pack**: Docker Compose

**Lub użyj pliku konfiguracyjnego:**
- Coolify automatycznie wykryje `coolify.prod.json` jeśli jest w repozytorium
- Alternatywnie możesz zaimportować konfigurację ręcznie

### 2.3. Zmienne środowiskowe Production

W sekcji **"Environment Variables"** dodaj:

**Required:**
```
NODE_ENV=production
NEXTAUTH_SECRET=<wygeneruj: openssl rand -base64 32>
NEXTAUTH_URL=https://link3.aihub.ovh
DATABASE_USER=linkupdate_prod
DATABASE_PASSWORD=<bezpieczne hasło>
DATABASE_NAME=linkupdate_prod
MYSQL_ROOT_PASSWORD=<bezpieczne hasło root>
GOOGLE_ID=<Google OAuth Client ID>
GOOGLE_SECRET=<Google OAuth Client Secret>
```

**Optional:**
```
PPLX_API_KEY=<twój klucz>
PPLX_MODEL=sonar
```

### 2.4. Konfiguracja domeny Production

1. Przejdź do **"Domains"**
2. Dodaj domenę: `link3.aihub.ovh`
3. Coolify automatycznie skonfiguruje SSL (Let's Encrypt)

### 2.5. Deploy Production

1. Kliknij **"Deploy"**
2. Coolify zbuduje obraz i uruchomi kontener
3. Po zakończeniu, aplikacja będzie dostępna pod `https://link3.aihub.ovh`

**⚠️ WAŻNE:** Po pierwszym deploy, wykonaj migrację bazy danych:
```bash
# W Coolify: Terminal → Execute Command
npm run db:push
```

---

## 🔧 Krok 3: Konfiguracja Development w Coolify

### 3.1. Utworzenie projektu Development

1. W Coolify dashboard kliknij **"New Resource"** → **"Docker Compose"**
2. Wybierz **to samo repozytorium Git** (możesz mieć wiele projektów z jednego repo)

### 3.2. Konfiguracja projektu Development

**Podstawowe ustawienia:**
- **Name**: `LinkUpdate-Development`
- **Description**: `Development deployment - Working version`
- **Branch**: `main` (lub `dev` jeśli używasz brancha dev)
- **Docker Compose File**: `docker-compose.dev.yml`
- **Build Pack**: Docker Compose

**Lub użyj pliku konfiguracyjnego:**
- Coolify automatycznie wykryje `coolify.dev.json`

### 3.3. Zmienne środowiskowe Development

**Required:**
```
NODE_ENV=development
NEXTAUTH_SECRET=<może być taki sam jak production lub inny>
NEXTAUTH_URL=https://dev.link3.aihub.ovh
DATABASE_USER=linkupdate_dev
DATABASE_PASSWORD=<bezpieczne hasło>
DATABASE_NAME=linkupdate_dev
MYSQL_ROOT_PASSWORD=<bezpieczne hasło root>
GOOGLE_ID=<Google OAuth Client ID>
GOOGLE_SECRET=<Google OAuth Client Secret>
```

**Optional:**
```
PPLX_API_KEY=<twój klucz>
PPLX_MODEL=sonar
APP_PORT=9999
```

**⚠️ UWAGA:** Development używa **osobnej bazy danych** (`linkupdate_dev`), więc dane nie będą się mieszać z produkcją.

### 3.4. Konfiguracja domeny Development

1. Przejdź do **"Domains"**
2. Dodaj subdomenę: `dev.link3.aihub.ovh`
3. Coolify automatycznie skonfiguruje SSL

### 3.5. Deploy Development

1. Kliknij **"Deploy"**
2. Coolify zbuduje obraz i uruchomi kontener z hot-reload
3. Po zakończeniu, aplikacja będzie dostępna pod `https://dev.link3.aihub.ovh`

**⚠️ WAŻNE:** Po pierwszym deploy, wykonaj migrację bazy danych:
```bash
# W Coolify: Terminal → Execute Command
npm run db:push
```

---

## 🔄 Krok 4: Workflow pracy

### Development (ciągła praca)

1. **Pracujesz lokalnie** lub **bezpośrednio w Coolify** (przez terminal)
2. **Commit i push** do repozytorium:
   ```bash
   git add .
   git commit -m "Feature: nowa funkcjonalność"
   git push origin main
   ```
3. **Coolify automatycznie** (jeśli włączone auto-deploy):
   - Wykryje zmiany w branchu `main`
   - Zbuduje nowy obraz
   - Uruchomi deployment na **Development**
4. **Testujesz** na `https://dev.link3.aihub.ovh`
5. **Gdy wszystko działa**, możesz:
   - Zrobić merge do produkcji (jeśli używasz branchów)
   - Lub ręcznie triggerować deployment Production

### Production (stabilna wersja)

1. **Production NIE ma auto-deploy** (lub tylko z brancha `production`)
2. **Deploy ręcznie** tylko gdy:
   - Development jest przetestowany
   - Wszystko działa poprawnie
   - Chcesz zaktualizować stabilną wersję
3. **W Coolify**: Kliknij **"Deploy"** na projekcie Production

---

## 📊 Porównanie środowisk

| Cecha | Production | Development |
|-------|------------|-------------|
| **Domena** | `link3.aihub.ovh` | `dev.link3.aihub.ovh` |
| **Port** | `3000` | `9999` |
| **NODE_ENV** | `production` | `development` |
| **Hot Reload** | ❌ Nie | ✅ Tak |
| **Baza danych** | `linkupdate_prod` | `linkupdate_dev` |
| **Auto-deploy** | ❌ Nie (lub tylko production branch) | ✅ Tak (main branch) |
| **Optymalizacja** | ✅ Pełna | ❌ Brak |
| **Debugowanie** | ❌ Ograniczone | ✅ Pełne |

---

## 🔐 Bezpieczeństwo

### Production
- ✅ Używa osobnej bazy danych
- ✅ Zoptymalizowany kod (mniejsza powierzchnia ataku)
- ✅ Ograniczone logi błędów
- ✅ SSL/TLS przez Coolify

### Development
- ✅ Używa osobnej bazy danych (nie miesza się z prod)
- ✅ Może mieć więcej szczegółowych logów
- ✅ SSL/TLS przez Coolify
- ⚠️ **Nie używaj** do danych produkcyjnych!

---

## 🛠️ Zarządzanie

### Sprawdzanie statusu

**Production:**
```bash
# W Coolify: Projects → LinkUpdate-Production → Status
# Lub przez terminal:
curl https://link3.aihub.ovh/api/health
```

**Development:**
```bash
# W Coolify: Projects → LinkUpdate-Development → Status
# Lub przez terminal:
curl https://dev.link3.aihub.ovh/api/health
```

### Logi

**Production:**
- Coolify Dashboard → LinkUpdate-Production → Logs

**Development:**
- Coolify Dashboard → LinkUpdate-Development → Logs

### Restart

**Production:**
- Coolify Dashboard → LinkUpdate-Production → Restart

**Development:**
- Coolify Dashboard → LinkUpdate-Development → Restart

---

## 🐛 Troubleshooting

### Problem: Development nie ma hot-reload

**Rozwiązanie:**
- Sprawdź czy `docker-compose.dev.yml` ma volume mount: `.:/app`
- Sprawdź czy `NODE_ENV=development`
- Sprawdź czy używasz `npm run dev` zamiast `node server.js`

### Problem: Production i Development używają tej samej bazy

**Rozwiązanie:**
- Upewnij się, że `DATABASE_NAME` jest różne:
  - Production: `linkupdate_prod`
  - Development: `linkupdate_dev`

### Problem: Auto-deploy nie działa

**Rozwiązanie:**
1. Coolify Dashboard → Project → Settings
2. Włącz **"Automatic Deployment"**
3. Wybierz branch (np. `main` dla dev, `production` dla prod)

---

## 📝 Notatki

- **Production** powinien być deployowany tylko ręcznie, gdy wszystko jest przetestowane
- **Development** może mieć auto-deploy z brancha `main` dla szybkiego testowania
- Oba środowiska używają **osobnych baz danych** - dane się nie mieszają
- Oba środowiska mają **osobne domeny** - łatwo rozróżnić

---

## ✅ Checklist przed deployem

**Production:**
- [ ] Wszystkie testy przeszły na Development
- [ ] Zmienne środowiskowe skonfigurowane
- [ ] Domena skonfigurowana
- [ ] SSL działa
- [ ] Migracja bazy danych wykonana
- [ ] Health check działa

**Development:**
- [ ] Zmienne środowiskowe skonfigurowane
- [ ] Domena skonfigurowana
- [ ] SSL działa
- [ ] Migracja bazy danych wykonana
- [ ] Hot-reload działa
- [ ] Auto-deploy włączony (opcjonalnie)

---

**Powodzenia! 🚀**

