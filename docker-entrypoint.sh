#!/bin/bash
set -e

# Funkcja do sprawdzania połączenia z bazą danych
check_db_connection() {
    echo "Sprawdzanie połączenia z bazą danych..."
    until nc -z -v -w5 db 3306; do
        echo "Czekam na bazę danych..."
        sleep 5
    done
    echo "Baza danych jest dostępna!"
}

# Funkcja do wykonywania migracji
run_migrations() {
    echo "Uruchamianie migracji bazy danych..."
    node db/migrations/run.js
    if [ $? -eq 0 ]; then
        echo "Migracje wykonane pomyślnie!"
    else
        echo "Błąd podczas wykonywania migracji!"
        exit 1
    fi
}

# Funkcja do sprawdzania i tworzenia katalogów
setup_directories() {
    echo "Sprawdzanie i tworzenie katalogów..."
    mkdir -p /app/public/uploads
    chmod -R 755 /app/public/uploads
    echo "Katalogi przygotowane!"
}

# Główna funkcja
main() {
    setup_directories
    check_db_connection
    run_migrations
    
    echo "Uruchamianie aplikacji..."
    exec "$@"
}

# Uruchomienie głównej funkcji
main "$@" 