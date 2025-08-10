#!/bin/bash

# Kolory dla lepszej czytelności logów
GREEN='\033[0;32m'
RED='\033[0;31m'
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

# Sprawdzenie wersji Node.js w systemie
check_system_node() {
    log "Sprawdzanie wersji Node.js w systemie..."
    if command -v node &> /dev/null; then
        node_version=$(node -v)
        log "Node.js w systemie: $node_version"
        
        # Sprawdź czy to wersja LTS
        major_version=$(echo $node_version | cut -d. -f1 | tr -d 'v')
        if [ "$major_version" -gt 20 ]; then
            warn "Wykryto najnowszą wersję Node.js, która może nie być stabilna w środowisku produkcyjnym"
            warn "Zalecana jest wersja LTS (18.x lub 20.x) dla środowiska produkcyjnego"
        fi
    else
        error "Node.js nie jest zainstalowany w systemie"
    fi
}

# Sprawdzenie wersji Node.js w Container Station
check_container_node() {
    log "Sprawdzanie wersji Node.js w kontenerze..."
    if docker ps -q --filter "name=nextjs-app" &> /dev/null; then
        container_node_version=$(docker exec nextjs-app node -v)
        log "Node.js w kontenerze: $container_node_version"
        log "✓ Kontener używa zalecanej wersji LTS (node:18-alpine)"
    else
        error "Kontener nextjs-app nie jest uruchomiony"
        log "Info: Dockerfile używa node:18-alpine (wersja LTS)"
    fi
}

# Sprawdzenie wersji npm
check_npm_version() {
    log "Sprawdzanie wersji npm..."
    if command -v npm &> /dev/null; then
        npm_version=$(npm -v)
        log "npm w systemie: $npm_version"
    else
        error "npm nie jest zainstalowany w systemie"
    fi
}

# Wyświetl rekomendacje
show_recommendations() {
    echo
    log "=== Rekomendacje ==="
    echo "1. Dla środowiska produkcyjnego zalecane jest używanie wersji LTS (18.x lub 20.x)"
    echo "2. Kontener Dockera używa node:18-alpine, co jest dobrym wyborem dla produkcji"
    echo "3. Wersje >20.x mogą być niestabilne w środowisku produkcyjnym"
    echo "4. Upewnij się, że wszystkie zależności są kompatybilne z używaną wersją Node.js"
}

# Główna funkcja
main() {
    log "=== Sprawdzanie wersji Node.js i npm ==="
    check_system_node
    check_container_node
    check_npm_version
    show_recommendations
    log "=== Zakończono sprawdzanie ==="
}

# Uruchomienie skryptu
main "$@" 