#!/bin/bash

# Kolory dla lepszej czytelności logów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funkcja do logowania
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Ładowanie zmiennych środowiskowych
source /share/Container/link/.env

# Sprawdzenie argumentów
if [ -z "$1" ]; then
    error "Nie podano pliku backupu"
    echo "Użycie: $0 <ścieżka_do_backupu>"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/share/Container/link/restore_temp"
MYSQL_RESTORE="$RESTORE_DIR/mysql_backup.sql"

# Sprawdzenie czy plik backupu istnieje
check_backup_file() {
    log "Sprawdzanie pliku backupu..."
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Plik backupu nie istnieje: $BACKUP_FILE"
        exit 1
    fi
    log "Plik backupu znaleziony ✓"
}

# Przygotowanie katalogu tymczasowego
prepare_restore_dir() {
    log "Przygotowywanie katalogu tymczasowego..."
    rm -rf "$RESTORE_DIR"
    mkdir -p "$RESTORE_DIR"
    chmod 755 "$RESTORE_DIR"
    log "Katalog tymczasowy przygotowany ✓"
}

# Rozpakowanie backupu
extract_backup() {
    log "Rozpakowywanie backupu..."
    if tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"; then
        log "Backup rozpakowany pomyślnie ✓"
    else
        error "Błąd podczas rozpakowywania backupu"
        exit 1
    fi
}

# Zatrzymanie aplikacji
stop_application() {
    log "Zatrzymywanie aplikacji..."
    docker-compose -f /share/Container/link/docker-compose.yml down
    log "Aplikacja zatrzymana ✓"
}

# Przywracanie bazy danych
restore_database() {
    log "Przywracanie bazy danych..."
    
    # Znajdź plik SQL w katalogu tymczasowym
    MYSQL_DUMP=$(find "$RESTORE_DIR" -name "mysql_*.sql" | head -n 1)
    
    if [ -z "$MYSQL_DUMP" ]; then
        error "Nie znaleziono pliku bazy danych w backupie"
        exit 1
    fi
    
    # Przywróć bazę danych
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$MYSQL_DUMP"; then
        log "Baza danych przywrócona pomyślnie ✓"
    else
        error "Błąd podczas przywracania bazy danych"
        exit 1
    fi
}

# Przywracanie plików
restore_files() {
    log "Przywracanie plików..."
    
    # Lista katalogów do przywrócenia
    DIRS=(
        "public/uploads"
        ".next/cache"
        "logs"
        ".env"
    )
    
    for dir in "${DIRS[@]}"; do
        if [ -d "$RESTORE_DIR/$dir" ]; then
            rm -rf "/share/Container/link/$dir"
            mkdir -p "/share/Container/link/$dir"
            cp -r "$RESTORE_DIR/$dir"/* "/share/Container/link/$dir/"
            log "Przywrócono katalog: $dir ✓"
        else
            warn "Katalog $dir nie znaleziony w backupie"
        fi
    done
}

# Ustawienie uprawnień
set_permissions() {
    log "Ustawianie uprawnień..."
    chown -R admin:administrators /share/Container/link
    chmod -R 755 /share/Container/link/public/uploads
    log "Uprawnienia ustawione ✓"
}

# Uruchomienie aplikacji
start_application() {
    log "Uruchamianie aplikacji..."
    docker-compose -f /share/Container/link/docker-compose.yml up -d
    log "Aplikacja uruchomiona ✓"
}

# Weryfikacja przywrócenia
verify_restore() {
    log "Weryfikacja przywrócenia..."
    sleep 10
    
    if curl -s "http://localhost:7777/api/health" | grep -q "ok"; then
        log "Aplikacja działa poprawnie ✓"
    else
        error "Aplikacja nie odpowiada prawidłowo"
        exit 1
    fi
}

# Sprzątanie
cleanup() {
    log "Czyszczenie..."
    rm -rf "$RESTORE_DIR"
    log "Czyszczenie zakończone ✓"
}

# Główna funkcja
main() {
    log "Rozpoczynam proces przywracania z backupu: $BACKUP_FILE"
    
    check_backup_file
    prepare_restore_dir
    extract_backup
    stop_application
    restore_database
    restore_files
    set_permissions
    start_application
    verify_restore
    cleanup
    
    log "Przywracanie zakończone pomyślnie! 🎉"
}

# Uruchomienie skryptu
main "$@" 