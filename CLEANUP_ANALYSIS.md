# 🧹 Analiza Cleanup - Nieużywane Zależności

**Data**: 2024-12-29  
**Status**: 🟡 W TRAKCIE ANALIZY

---

## 📋 Analizowane Zależności

### 1. `aws-sdk` (79 MB) - 🔴 DO USUNIĘCIA

**Status**: ❌ Nieużywane bezpośrednio w kodzie

**Lokalizacja:**
- `package.json` - w devDependencies
- `next.config.mjs` - jako webpack fallback (`aws_sdk: false`)

**Weryfikacja:**
```bash
grep -r "aws-sdk\|aws_sdk" --exclude-dir=node_modules
```
- ✅ Znaleziono tylko w `next.config.mjs` jako fallback (ustawiony na `false`)
- ✅ Brak importów w kodzie aplikacji
- ✅ Brak użycia w testach (oprócz mock-aws-s3)

**Decyzja**: ✅ **USUNĄĆ** z devDependencies i next.config.mjs

---

### 2. `mock-aws-s3` - 🟡 DO PRZENIESIENIA/USUNIĘCIA

**Status**: ❓ Potencjalnie używane w testach

**Lokalizacja:**
- `package.json` - w devDependencies
- `next.config.mjs` - jako webpack fallback (`mock_aws_s3: false`)

**Weryfikacja:**
```bash
grep -r "mock-aws-s3\|mock_aws_s3" --exclude-dir=node_modules
```
- ✅ Znaleziono tylko w `next.config.mjs` jako fallback
- ⚠️ Należy sprawdzić czy używane w testach

**Decyzja**: 🔍 **SPRAWDZIĆ testy** → Jeśli nieużywane, usunąć

---

### 3. `critters` - 🔴 DO USUNIĘCIA

**Status**: ❌ Nieużywane

**Lokalizacja:**
- `package.json` - w dependencies (nie powinno być!)

**Weryfikacja:**
```bash
grep -r "critters" --exclude-dir=node_modules
```
- ✅ Brak użycia w kodzie
- ✅ Brak konfiguracji w next.config

**Uwaga**: `critters` był używany w starszych wersjach Next.js do CSS inlining, ale Next.js 15 ma własne optymalizacje CSS.

**Decyzja**: ✅ **USUNĄĆ** z dependencies

---

### 4. `encoding` - 🔴 DO USUNIĘCIA

**Status**: ❌ Nieużywane (Node.js ma built-in)

**Lokalizacja:**
- `package.json` - w dependencies

**Weryfikacja:**
```bash
grep -r "require.*encoding\|from.*encoding" --exclude-dir=node_modules
```
- ✅ Brak użycia w kodzie
- ✅ Node.js 18+ ma wbudowane moduły encoding

**Decyzja**: ✅ **USUNĄĆ** z dependencies

---

### 5. `cross-env` - 🟢 ZOSTAWIĆ (już usunięte z build script)

**Status**: ✅ Może być przydatne w Windows, ale nie jest krytyczne

**Lokalizacja:**
- `package.json` - w devDependencies
- **Uwaga**: Już usunięto z build script (zmieniono na bezpośrednie NODE_OPTIONS)

**Decyzja**: 🟡 **MOŻNA ZOSTAWIĆ** (może być przydatne dla deweloperów Windows), ale nie jest wymagane

---

## 📊 Podsumowanie

| Zależność | Typ | Rozmiar | Status | Akcja |
|-----------|-----|---------|--------|-------|
| `aws-sdk` | devDependency | ~79 MB | ❌ Nieużywane | ✅ **USUNĄĆ** |
| `mock-aws-s3` | devDependency | ~small | ❓ Testy? | 🔍 **SPRAWDZIĆ** |
| `critters` | dependency | ~small | ❌ Nieużywane | ✅ **USUNĄĆ** |
| `encoding` | dependency | ~small | ❌ Nieużywane | ✅ **USUNĄĆ** |
| `cross-env` | devDependency | ~small | ✅ Opcjonalne | 🟡 **ZOSTAWIĆ** |

---

## 🎯 Plan Czynności

### Krok 1: Weryfikacja testów
- [ ] Sprawdzić `__tests__/` czy używają `mock-aws-s3`
- [ ] Jeśli tak → zostawić
- [ ] Jeśli nie → usunąć

### Krok 2: Usunięcie zależności
- [ ] Usunąć `aws-sdk` z devDependencies
- [ ] Usunąć `critters` z dependencies
- [ ] Usunąć `encoding` z dependencies
- [ ] Usunąć `mock-aws-s3` (jeśli nieużywane)

### Krok 3: Czyszczenie next.config.mjs
- [ ] Usunąć `aws_sdk: false` z webpack fallback
- [ ] Usunąć `mock_aws_s3: false` z webpack fallback
- [ ] Pozostałe fallbacks pozostawić (są potrzebne)

### Krok 4: Test
- [ ] `npm install` - sprawdzić czy działa
- [ ] `npm run build` - sprawdzić czy działa
- [ ] Sprawdzić czy nie ma błędów

---

## 💾 Oszczędności

**Szacunkowe oszczędności:**
- `aws-sdk`: ~79 MB (największa korzyść)
- Pozostałe: ~5-10 MB
- **Łącznie**: ~80-90 MB mniej w node_modules

**Korzyści:**
- ✅ Szybsze instalacje (`npm install`)
- ✅ Mniejsze obrazy Docker
- ✅ Mniejsze ryzyko security vulnerabilities
- ✅ Łatwiejsze zarządzanie zależnościami

---

*Analiza utworzona: 2024-12-29*

