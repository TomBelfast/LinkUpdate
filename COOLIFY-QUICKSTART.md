# Quick Start Guide - Coolify Deployment

## 🎯 Szybki start

### 1. Production (stabilna wersja)

**W Coolify:**
1. New Resource → Docker Compose
2. Wybierz repozytorium
3. Name: `LinkUpdate-Production`
4. Docker Compose File: `docker-compose.prod.yml`
5. Domena: `link3.aihub.ovh`
6. Dodaj zmienne środowiskowe (patrz COOLIFY-SETUP.md)
7. Deploy

**Rezultat:** Stabilna aplikacja dostępna pod `https://link3.aihub.ovh`

---

### 2. Development (wersja do pracy)

**W Coolify:**
1. New Resource → Docker Compose
2. Wybierz **to samo** repozytorium
3. Name: `LinkUpdate-Development`
4. Docker Compose File: `docker-compose.dev.yml`
5. Domena: `dev.link3.aihub.ovh`
6. Dodaj zmienne środowiskowe (patrz COOLIFY-SETUP.md)
7. Włącz **Auto-deploy** z brancha `main`
8. Deploy

**Rezultat:** Wersja deweloperska dostępna pod `https://dev.link3.aihub.ovh`

---

## 📝 Workflow

1. **Pracujesz** → commit & push do `main`
2. **Development** automatycznie się rebuilduje i deployuje
3. **Testujesz** na `dev.link3.aihub.ovh`
4. **Gdy wszystko działa** → ręcznie deploy Production

---

## ⚙️ Różnice

| | Production | Development |
|---|---|---|
| **Domena** | `link3.aihub.ovh` | `dev.link3.aihub.ovh` |
| **Port** | 3000 | 9999 |
| **Auto-deploy** | ❌ Nie | ✅ Tak (main branch) |
| **Baza danych** | `linkupdate_prod` | `linkupdate_dev` |
| **Tryb** | production | development |

---

**Szczegółowa dokumentacja:** Zobacz `COOLIFY-SETUP.md`

