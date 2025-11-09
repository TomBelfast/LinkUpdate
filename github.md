# Konfiguracja GitHub - LinkUpdate

## Informacje o Repozytorium

- **Nazwa repozytorium:** LinkUpdate
- **Właściciel:** TomBelfast
- **URL repozytorium:** https://github.com/TomBelfast/LinkUpdate.git
- **Branch główny:** main
- **Lokalizacja:** `/link`

## Konfiguracja Git

```bash
# Remote origin
origin  https://github.com/TomBelfast/LinkUpdate.git (fetch)
origin  https://github.com/TomBelfast/LinkUpdate.git (push)
```

## Autoryzacja

### Personal Access Token
Token GitHub jest używany do autoryzacji operacji push/pull.

**Uwaga:** Token jest przechowywany w historii komend i nie powinien być commitowany do repozytorium.

### Metoda autoryzacji
Token jest przekazywany w URL podczas operacji push:
```bash
git push https://TOKEN@github.com/TomBelfast/LinkUpdate.git HEAD:main
```

## Ostatnie Commity

1. `fd3db48` - Add PM2 configuration for continuous application running
2. `4c3b37a` - fix(db): zwiększono idleTimeout z 10s do 300s aby zapobiec rozłączaniu połączeń
3. `2def486` - feat(ui): hide prompt field on homepage link cards
4. `b34b320` - style(buttons): functional colors -> edit: blue, delete: red, copy: green, share: yellow; keep colors in dark mode
5. `25f1f82` - feat(github): force Polish output for AI-generated description (prompt + system)

Sprawdź więcej commitów używając:
```bash
cd /link
git log --oneline -10
```

## Operacje Git

### Sprawdzenie statusu
```bash
cd /link
git status
```

### Dodanie zmian
```bash
cd /link
git add .
# lub konkretny plik
git add nazwa_pliku
```

### Commit
```bash
cd /link
git commit -m "Opis zmian"
```

### Push do GitHub
```bash
cd /link
git push origin main
```

### Pull z GitHub
```bash
cd /link
git pull origin main
```

## Pliki Konfiguracyjne

### PM2 Configuration
- **Plik:** `ecosystem.config.cjs`
- **Opis:** Konfiguracja PM2 do ciągłego działania aplikacji
- **Status:** Zcommitowany i wypchnięty do GitHub

## Integracja z Cursor

Cursor jest zintegrowany z kontem GitHub użytkownika, co umożliwia:
- Automatyczną autoryzację operacji Git
- Synchronizację zmian
- Współpracę z repozytorium

## Bezpieczeństwo

⚠️ **WAŻNE:**
- Nigdy nie commituj tokenów API do repozytorium
- Używaj `.env` i `.gitignore` do ochrony wrażliwych danych
- Tokeny powinny być przechowywane w zmiennych środowiskowych lub bezpiecznych menedżerach haseł

## Struktura Repozytorium

```
/link/
├── ecosystem.config.cjs    # PM2 configuration
├── package.json            # Zależności projektu
├── .env.development        # Zmienne środowiskowe (NIE commitowane)
├── .env.local              # Lokalne zmienne (NIE commitowane)
└── ...
```

## Aktualizacja

Ostatnia aktualizacja: 2025-11-09

