#!/bin/bash

# Kolory dla lepszej czytelności logów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Ładowanie zmiennych środowiskowych
source /share/Container/link/.env

# Ustawienia monitorowania
MONITOR_LOG_DIR="${LOG_DIR:-/share/Container/link/logs}"
MONITOR_LOG="$MONITOR_LOG_DIR/monitor_$(date +%Y%m%d).log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_DISK=90
CHECK_INTERVAL=60

# Sprawdzenie i utworzenie katalogu logów
check_log_dir() {
    if [ ! -d "$MONITOR_LOG_DIR" ]; then
        mkdir -p "$MONITOR_LOG_DIR"
        chmod 755 "$MONITOR_LOG_DIR"
    fi
}

# Sprawdzenie stanu kontenera
check_container_status() {
    local container_name="nextjs-app"
    local status=$(docker inspect -f '{{.State.Status}}' "$container_name" 2>/dev/null)
    
    if [ "$status" = "running" ]; then
        log "Container $container_name jest uruchomiony ✓"
        return 0
    else
        error "Container $container_name nie działa (status: $status)"
        return 1
    fi
}

# Sprawdzenie zużycia zasobów
check_resource_usage() {
    # CPU
    local cpu_usage=$(docker stats --no-stream --format "{{.CPUPerc}}" nextjs-app | sed 's/%//')
    
    # Pamięć
    local memory_usage=$(docker stats --no-stream --format "{{.MemPerc}}" nextjs-app | sed 's/%//')
    
    # Dysk
    local disk_usage=$(df -h /share/Container/link | awk 'NR==2 {print $5}' | sed 's/%//')
    
    info "Zużycie zasobów:"
    info "CPU: ${cpu_usage}%"
    info "RAM: ${memory_usage}%"
    info "Dysk: ${disk_usage}%"
    
    # Sprawdzenie progów alertów
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        warn "Wysokie zużycie CPU: ${cpu_usage}%"
    fi
    
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        warn "Wysokie zużycie pamięci: ${memory_usage}%"
    fi
    
    if (( $(echo "$disk_usage > $ALERT_THRESHOLD_DISK" | bc -l) )); then
        warn "Wysokie zużycie dysku: ${disk_usage}%"
    fi
}

# Sprawdzenie dostępności API
check_api_health() {
    local response=$(curl -s -w "\n%{http_code}" "http://localhost:7777/api/health")
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n1)
    
    if [ "$status_code" = "200" ]; then
        log "API działa poprawnie ✓"
        info "Response: $body"
        return 0
    else
        error "API nie odpowiada prawidłowo (status: $status_code)"
        error "Response: $body"
        return 1
    fi
}

# Sprawdzenie logów aplikacji
check_application_logs() {
    local container_name="nextjs-app"
    local log_errors=$(docker logs "$container_name" --since 5m 2>&1 | grep -i "error")
    
    if [ ! -z "$log_errors" ]; then
        warn "Znaleziono błędy w logach:"
        echo "$log_errors" | while read -r line; do
            error "  $line"
        done
    else
        log "Brak błędów w logach aplikacji ✓"
    fi
}

# Sprawdzenie połączenia z bazą danych
check_database_connection() {
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
        -e "SELECT 1" "$MYSQL_DATABASE" >/dev/null 2>&1; then
        log "Połączenie z bazą danych działa poprawnie ✓"
        return 0
    else
        error "Problem z połączeniem do bazy danych"
        return 1
    fi
}

# Główna funkcja monitorowania
monitor() {
    log "Rozpoczynam monitoring..."
    
    # Zapisz nagłówek do logu
    echo "=== Monitoring rozpoczęty $(date) ===" >> "$MONITOR_LOG"
    
    # Wykonaj wszystkie sprawdzenia
    check_container_status
    check_resource_usage
    check_api_health
    check_application_logs
    check_database_connection
    
    # Zapisz wyniki do logu
    echo "=== Monitoring zakończony $(date) ===" >> "$MONITOR_LOG"
}

# Główna pętla
main() {
    check_log_dir
    
    while true; do
        monitor
        sleep "$CHECK_INTERVAL"
    done
}

# Uruchomienie skryptu
main "$@" 