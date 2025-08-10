# Lista Zadań

## Priorytetowe

### 1. Naprawa Błędów
- [ ] Rozwiązanie problemu z klasą border-border w Tailwind CSS
  - Analiza konfiguracji Tailwind
  - Sprawdzenie definicji klas
  - Aktualizacja theme.extend
- [ ] Usunięcie nieużywanych importów
  - Sprawdzenie wszystkich komponentów
  - Usunięcie zbędnych zależności
  - Aktualizacja package.json

### 2. Optymalizacja Wydajności
- [ ] Optymalizacja ładowania komponentów
  - Analiza czasu ładowania
  - Implementacja lepszych stanów ładowania
  - Optymalizacja Suspense boundaries
- [ ] Redukcja rozmiaru bundle
  - Analiza bundle size
  - Code splitting
  - Tree shaking

### 3. System Pomysłów
- [ ] Integracja z bazą danych
  - Utworzenie schematu
  - Implementacja API
  - Migracja danych
- [ ] System tagów
  - Model danych
  - UI dla tagów
  - Logika filtrowania

## W Kolejce

### Frontend
1. Implementacja zaawansowanych animacji
   - Przejścia między stanami
   - Animacje list
   - Efekty hover

2. Poprawa dostępności
   - ARIA labels
   - Keyboard navigation
   - Focus management

3. System kategorii
   - UI dla kategorii
   - Logika grupowania
   - Filtrowanie

### Backend
1. Optymalizacja API
   - Caching
   - Rate limiting
   - Error handling

2. System użytkowników
   - Autentykacja
   - Autoryzacja
   - Profile

3. Backup i restore
   - Eksport danych
   - Import danych
   - Automatyczne backupy

## Testy

### Unit Testy
- [ ] Komponenty React
- [ ] Funkcje pomocnicze
- [ ] API endpoints

### Integration Testy
- [ ] Flow użytkownika
- [ ] API calls
- [ ] Database operations

### E2E Testy
- [ ] Cypress setup
- [ ] Podstawowe scenariusze
- [ ] Edge cases

## Dokumentacja

### Techniczna
- [ ] API documentation
- [ ] Component documentation
- [ ] Setup guide

### Użytkownika
- [ ] User guide
- [ ] FAQ
- [ ] Troubleshooting

## Monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User analytics

## Deadline
- Priorytetowe zadania: 2 dni
- Optymalizacja: 1 tydzień
- System pomysłów: 2 tygodnie
- Testy: 1 tydzień
- Dokumentacja: ongoing

## Zadania

### Priorytetowe

- [x] Implementacja rejestracji użytkowników
- [x] Implementacja logowania użytkowników
- [x] Implementacja resetowania hasła
- [x] Dodanie możliwości tworzenia kolekcji linków
- [x] Dodanie możliwości dodawania tagów do linków
- [x] Dodanie możliwości wyszukiwania linków po tagach

### W toku

- [ ] Implementacja panelu administracyjnego
- [ ] Dodanie możliwości eksportu/importu danych

### Ukończone

- [x] Utworzenie podstawowej struktury projektu
- [x] Konfiguracja środowiska deweloperskiego
- [x] Implementacja podstawowej nawigacji
- [x] Wdrożenie systemu autentykacji (NextAuth - Credentials)
- [x] Dodanie możliwości rejestracji użytkowników
- [x] Dodanie możliwości logowania użytkowników (Credentials)
- [x] Implementacja resetowania hasła (z naprawą błędów bazy danych)
- [x] Naprawa automatycznego tworzenia/aktualizacji schematu bazy danych
- [x] Konfiguracja bezpiecznego wysyłania emaili do resetowania hasła
- [x] Dodanie gradientowej obwódki do ikony zalogowanego użytkownika
- [x] Stworzenie szczegółowej dokumentacji technicznej systemu autoryzacji (jako prompt LLM)
- [x] Dodanie logowania przez Google (NextAuth Google Provider)
- [x] Zastąpienie przycisku "Magic Link" przyciskiem "Sign in with Google" na stronie logowania

## Completed Tasks
- [x] Konfiguracja bazy danych
- [x] Implementacja Google OAuth
- [x] Dodanie kolumny 'role' do tabeli users
- [x] Naprawa problemów z kodowaniem znaków
- [x] Stabilizacja działania aplikacji na porcie 9999
- [x] Weryfikacja działania API

## In Progress
- [ ] Optymalizacja zapytań do bazy danych
- [ ] Rozszerzenie dokumentacji API
- [ ] Dodanie testów dla nowych funkcjonalności

## Planned
- [ ] Implementacja dodatkowych zabezpieczeń
- [ ] Monitoring wydajności aplikacji
- [ ] Backup systemu
- [ ] Dokumentacja dla użytkowników końcowych

## Backlog
- [ ] Integracja z dodatkowymi serwisami
- [ ] System powiadomień
- [ ] Panel administracyjny
- [ ] System raportowania 