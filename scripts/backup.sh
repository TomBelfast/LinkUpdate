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

# Ustawienia backupu
BACKUP_DIR="${BACKUP_PATH:-/share/Container/link/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
MYSQL_BACKUP="$BACKUP_DIR/mysql_$TIMESTAMP.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Sprawdzenie i utworzenie katalogu backupu
check_backup_dir() {
    log "Sprawdzanie katalogu backupu..."
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        chmod 755 "$BACKUP_DIR"
    fi
}

# Backup bazy danych
backup_database() {
    log "Rozpoczynam backup bazy danych..."
    
    if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        "$MYSQL_DATABASE" > "$MYSQL_BACKUP"; then
        log "Backup bazy danych zakończony pomyślnie ✓"
    else
        error "Błąd podczas backupu bazy danych"
        exit 1
    fi
}

# Backup plików
backup_files() {
    log "Rozpoczynam backup plików..."
    
    # Lista katalogów do backupu
    DIRS_TO_BACKUP=(
        "/share/Container/link/public/uploads"
        "/share/Container/link/.next/cache"
        "/share/Container/link/logs"
        "/share/Container/link/.env"
    )
    
    # Tworzenie archiwum
    tar -czf "$BACKUP_FILE" \
        -C / \
        "${DIRS_TO_BACKUP[@]/#//}" \
        "$MYSQL_BACKUP" \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "Backup plików zakończony pomyślnie ✓"
        rm "$MYSQL_BACKUP"
    else
        error "Błąd podczas backupu plików"
        exit 1
    fi
}

# Czyszczenie starych backupów
cleanup_old_backups() {
    log "Czyszczenie starych backupów..."
    
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete
    find "$BACKUP_DIR" -name "mysql_*.sql" -mtime +"$RETENTION_DAYS" -delete
    
    log "Stare backupy zostały usunięte ✓"
}

# Weryfikacja backupu
verify_backup() {
    log "Weryfikacja backupu..."
    
    if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
        log "Backup został zweryfikowany pomyślnie ✓"
        
        # Oblicz i zapisz rozmiar backupu
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "Rozmiar backupu: $BACKUP_SIZE"
    else
        error "Weryfikacja backupu nie powiodła się"
        exit 1
    fi
}

# Główna funkcja
main() {
    log "Rozpoczynam proces backupu..."
    
    check_backup_dir
    backup_database
    backup_files
    verify_backup
    cleanup_old_backups
    
    log "Backup zakończony pomyślnie! 🎉"
    log "Plik backupu: $BACKUP_FILE"
}

# Uruchomienie skryptu
main "$@" 