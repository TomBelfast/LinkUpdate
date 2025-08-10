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

# Sprawdzenie wymaganych zmiennych środowiskowych
check_env() {
    log "Sprawdzanie zmiennych środowiskowych..."
    required_vars=(
        "QNAP_HOST"
        "QNAP_USER"
        "QNAP_PASSWORD"
        "MYSQL_ROOT_PASSWORD"
        "MYSQL_DATABASE"
        "MYSQL_USER"
        "MYSQL_PASSWORD"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Brak wymaganej zmiennej środowiskowej: $var"
            exit 1
        fi
    done
    log "Wszystkie wymagane zmienne środowiskowe są ustawione ✓"
}

# Tworzenie katalogów na QNAP
setup_directories() {
    log "Tworzenie katalogów na QNAP..."
    
    ssh $QNAP_USER@$QNAP_HOST "
        mkdir -p /share/Container/link/{public/uploads,.next/cache,logs,backups,ssl}
        chmod -R 755 /share/Container/link
        chown -R admin:administrators /share/Container/link
    "
    
    if [ $? -eq 0 ]; then
        log "Katalogi zostały utworzone pomyślnie ✓"
    else
        error "Błąd podczas tworzenia katalogów"
        exit 1
    fi
}

# Kopiowanie plików konfiguracyjnych
copy_config_files() {
    log "Kopiowanie plików konfiguracyjnych..."
    
    scp .env.qnap $QNAP_USER@$QNAP_HOST:/share/Container/link/.env
    scp docker-compose.yml $QNAP_USER@$QNAP_HOST:/share/Container/link/
    
    if [ $? -eq 0 ]; then
        log "Pliki konfiguracyjne zostały skopiowane pomyślnie ✓"
    else
        error "Błąd podczas kopiowania plików konfiguracyjnych"
        exit 1
    fi
}

# Konfiguracja Container Station
setup_container_station() {
    log "Konfiguracja Container Station..."
    
    # Sprawdzenie czy Container Station jest uruchomione
    if ! ssh $QNAP_USER@$QNAP_HOST "curl -s localhost:7777 > /dev/null"; then
        warn "Container Station nie jest uruchomione. Uruchamianie..."
        ssh $QNAP_USER@$QNAP_HOST "/etc/init.d/container-station.sh start"
        sleep 10
    fi
    
    log "Container Station jest gotowe ✓"
}

# Wdrożenie aplikacji
deploy_application() {
    log "Wdrażanie aplikacji..."
    
    ssh $QNAP_USER@$QNAP_HOST "cd /share/Container/link && docker-compose pull && docker-compose up -d"
    
    if [ $? -eq 0 ]; then
        log "Aplikacja została wdrożona pomyślnie ✓"
    else
        error "Błąd podczas wdrażania aplikacji"
        exit 1
    fi
}

# Konfiguracja backupu
setup_backup() {
    log "Konfiguracja automatycznego backupu..."
    
    # Kopiowanie skryptu backupu
    scp scripts/backup.sh $QNAP_USER@$QNAP_HOST:/share/Container/link/
    
    # Dodanie zadania cron
    ssh $QNAP_USER@$QNAP_HOST "
        chmod +x /share/Container/link/backup.sh
        (crontab -l 2>/dev/null; echo '0 0 * * * /share/Container/link/backup.sh') | crontab -
    "
    
    if [ $? -eq 0 ]; then
        log "Backup został skonfigurowany pomyślnie ✓"
    else
        error "Błąd podczas konfiguracji backupu"
        exit 1
    fi
}

# Weryfikacja wdrożenia
verify_deployment() {
    log "Weryfikacja wdrożenia..."
    
    # Czekaj na uruchomienie aplikacji
    sleep 10
    
    # Sprawdź czy aplikacja odpowiada
    if curl -s "http://$QNAP_HOST:7777/api/health" | grep -q "ok"; then
        log "Aplikacja działa poprawnie ✓"
    else
        error "Aplikacja nie odpowiada prawidłowo"
        exit 1
    fi
}

# Główna funkcja
main() {
    log "Rozpoczynam proces wdrażania na QNAP..."
    
    check_env
    setup_directories
    copy_config_files
    setup_container_station
    deploy_application
    setup_backup
    verify_deployment
    
    log "Wdrażanie zakończone pomyślnie! 🚀"
    log "Aplikacja jest dostępna pod adresem: http://$QNAP_HOST:7777"
}

# Uruchomienie skryptu
main "$@" 