# 🔄 Plan Refaktoryzacji - Link Manager

**Data rozpoczęcia**: 2024-12-29  
**Cel**: Zrefaktoryzować aplikację do łatwego deploymentu na Coolify, naprawić konflikty zależności, zachowując wszystkie funkcje i wygląd.

---

## 📋 Identyfikowane Problemy

### 1. Konflikty Zależności ⚠️ KRYTYCZNE

#### Problem: @auth/core vs next-auth
- **Konflikt**: `@auth/core@0.40.0` vs `next-auth@4.24.11` (wymaga `@auth/core@0.34.2`)
- **Status**: Aktualnie używamy `--legacy-peer-deps`, ale to nie jest długoterminowe rozwiązanie
- **Rozwiązanie**: Usunąć bezpośrednią zależność `@auth/core` (next-auth już go zawiera)

#### Problem: React 19 vs Next.js 15
- **Status**: Next.js 15 wspiera React 19, ale niektóre biblioteki mogą nie być kompatybilne
- **Sprawdzić**: Wszystkie komponenty UI czy działają z React 19

#### Problem: Przestarzałe zależności
- **drizzle-kit**: `0.20.14` → Najnowsza wersja
- **drizzle-orm**: `0.29.3` → Sprawdzić aktualizację
- **next-auth**: `4.24.11` → Rozważyć upgrade do Auth.js v5 (opcjonalnie, większa zmiana)

### 2. Problemy z Build/Deployment 🔴

#### Problem: Build wymaga 4GB pamięci
- **Przyczyna**: Duży bundle, być może nadmiarowe zależności
- **Rozwiązanie**: 
  - Analiza bundle size
  - Usunięcie nieużywanych zależności
  - Optymalizacja Next.js config

#### Problem: Cross-env w Windows
- **Status**: `cross-env` może powodować problemy w niektórych środowiskach
- **Rozwiązanie**: Użyć Next.js built-in env handling lub alternatywy

### 3. Problemy Coolify-Specific 🟡

#### Problem: Volume mounting restrictions
- **Status**: Już rozwiązane (multi-stage build)
- **Weryfikacja**: Upewnić się że Dockerfile jest optymalny

#### Problem: Resource limits
- **Status**: Nie zdefiniowane w docker-compose
- **Rozwiązanie**: Dodać resource limits

#### Problem: Health checks
- **Status**: Sprawdzić czy działają poprawnie

---

## 🎯 Plan Działań

### Faza 1: Naprawa Konfliktów Zależności (Priorytet: WYSOKI)

#### Krok 1.1: Analiza zależności
```bash
npm ls --all > dependency-tree.txt
npm outdated
```

#### Krok 1.2: Usunięcie @auth/core
- Usunąć `@auth/core` z dependencies
- Sprawdzić czy kod używa bezpośrednio @auth/core
- Jeśli tak, zastąpić importami z next-auth

#### Krok 1.3: Aktualizacja kompatybilnych bibliotek
- `drizzle-kit`: Sprawdzić najnowszą stabilną wersję
- `drizzle-orm`: Sprawdzić aktualizację
- Pozostałe: Zaktualizować do najnowszych kompatybilnych wersji

#### Krok 1.4: Test lokalny
- `npm install` bez `--legacy-peer-deps`
- Sprawdzić czy build działa
- Sprawdzić czy aplikacja startuje

### Faza 2: Optymalizacja Build (Priorytet: ŚREDNI)

#### Krok 2.1: Analiza bundle
```bash
npm run build
# Sprawdzić bundle analyzer
```

#### Krok 2.2: Usunięcie nieużywanych zależności
- `aws-sdk` - sprawdzić czy używane
- `mock-aws-s3` - tylko dla testów?
- `critters` - czy potrzebne?
- Inne potencjalnie nieużywane

#### Krok 2.3: Optymalizacja Next.js config
- Sprawdzić `next.config.mjs`
- Włączyć wszystkie optymalizacje
- Sprawdzić czy nie ma niepotrzebnych polyfills

### Faza 3: Optymalizacja dla Coolify (Priorytet: WYSOKI)

#### Krok 3.1: Optymalizacja Dockerfile
- Upewnić się że multi-stage build jest optymalny
- Sprawdzić czy wszystkie warstwy są cacheable
- Zminimalizować rozmiar finalnego obrazu

#### Krok 3.2: Aktualizacja docker-compose.prod.yml
- Dodać resource limits
- Sprawdzić wszystkie health checks
- Upewnić się że wszystkie zmienne są zdefiniowane

#### Krok 3.3: Environment variables
- Sprawdzić czy wszystkie są w docker-compose
- Dodać defaults gdzie możliwe
- Dokumentować required vars

### Faza 4: Testy i Weryfikacja (Priorytet: KRYTYCZNY)

#### Krok 4.1: Test lokalny
- Build lokalny
- Start aplikacji
- Test wszystkich funkcji
- Weryfikacja wyglądu UI

#### Krok 4.2: Test Docker lokalny
```bash
docker-compose -f docker-compose.prod.yml up --build
```

#### Krok 4.3: Test na Coolify
- Deploy na środowisku testowym
- Sprawdzić logi
- Test funkcjonalności
- Weryfikacja performance

---

## 📦 Wersje do Aktualizacji

### Zależności do zaktualizowania:

| Pakiet | Obecna | Docelowa | Priorytet |
|--------|--------|----------|-----------|
| `@auth/core` | ^0.40.0 | **USUNĄĆ** | 🔴 WYSOKI |
| `drizzle-kit` | ^0.20.14 | ^0.30+ | 🟡 ŚREDNI |
| `drizzle-orm` | ^0.29.3 | ^0.30+ | 🟡 ŚREDNI |
| `next-auth` | ^4.24.11 | ^4.24.11 (bez zmian) | 🟢 NISKI |
| `next` | ^15.4.4 | ^15.4.4 (najnowsza patch) | 🟢 NISKI |
| `react` | ^19.1.0 | ^19.1.0 (najnowsza patch) | 🟢 NISKI |

### Zależności do usunięcia (jeśli nieużywane):

- `aws-sdk` - sprawdzić użycie
- `mock-aws-s3` - tylko dla testów, przenieść do devDependencies
- `critters` - sprawdzić czy używane
- `encoding` - Node.js ma built-in

---

## ✅ Checklist Refaktoryzacji

### Przygotowanie
- [ ] Backup aktualnego kodu
- [ ] Stworzenie brancha `refactor/deployment-optimization`
- [ ] Commit aktualnego stanu

### Zależności
- [ ] Usunięcie `@auth/core` z dependencies
- [ ] Sprawdzenie czy kod używa @auth/core bezpośrednio
- [ ] Aktualizacja drizzle-kit do najnowszej wersji
- [ ] Aktualizacja drizzle-orm do najnowszej wersji
- [ ] Usunięcie nieużywanych zależności
- [ ] Test `npm install` bez `--legacy-peer-deps`

### Build & Docker
- [ ] Optymalizacja Dockerfile
- [ ] Test build lokalny
- [ ] Sprawdzenie rozmiaru obrazu Docker
- [ ] Aktualizacja docker-compose.prod.yml
- [ ] Dodanie resource limits
- [ ] Weryfikacja health checks

### Testy
- [ ] Test lokalny - build
- [ ] Test lokalny - start
- [ ] Test wszystkich funkcji
- [ ] Weryfikacja UI (zachowanie wyglądu)
- [ ] Test Docker lokalny
- [ ] Test na Coolify (test environment)

### Dokumentacja
- [ ] Aktualizacja README.md
- [ ] Aktualizacja LOCAL_DEV_SETUP.md
- [ ] Aktualizacja dokumentacji deploymentu
- [ ] Utworzenie CHANGELOG

---

## 🚨 Zasady Zachowania Funkcjonalności

### Co MUSI pozostać bez zmian:

1. **UI/UX** - Wszystkie komponenty i style
2. **Funkcjonalność** - Wszystkie features działają tak samo
3. **API** - Wszystkie endpointy działają tak samo
4. **Database Schema** - Bez zmian w strukturze
5. **Authentication** - NextAuth działa tak samo

### Co MOŻEMY zmienić:

1. **Zależności** - Aktualizacja do kompatybilnych wersji
2. **Build process** - Optymalizacja
3. **Docker configuration** - Optymalizacja dla Coolify
4. **Code organization** - Refaktoryzacja wewnętrzna (zachowując API)

---

## 📊 Metryki Sukcesu

### Przed refaktoryzacją:
- ❌ `npm install` wymaga `--legacy-peer-deps`
- ❌ Build wymaga 4GB RAM
- ⚠️ Problemy z deploymentem na Coolify
- ⚠️ Konflikty zależności

### Po refaktoryzacji:
- ✅ `npm install` działa bez flag
- ✅ Build działa z mniejszą ilością RAM (docelowo < 2GB)
- ✅ Deployment na Coolify bez problemów
- ✅ Brak konfliktów zależności
- ✅ Wszystkie funkcje działają
- ✅ UI wygląda tak samo

---

## 🔄 Plan Rollback

Jeśli coś pójdzie nie tak:

1. **Przywrócenie z backupu**
   ```bash
   git checkout main
   git branch -D refactor/deployment-optimization
   ```

2. **Przywrócenie package.json**
   ```bash
   git checkout main -- package.json package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Sprawdzenie co poszło nie tak**
   - Analiza błędów
   - Korekta planu
   - Ponowienie próby

---

*Plan utworzony: 2024-12-29*  
*Status: 🟡 W TRAKCIE*

