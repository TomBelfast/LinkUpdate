@echo off
echo Sprawdzanie czy Docker Desktop jest uruchomiony...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker Desktop nie jest uruchomiony. Uruchamiam...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Czekam 30 sekund na uruchomienie Docker Desktop...
    timeout /t 30 /nobreak
)

echo Kopiowanie pliku konfiguracyjnego...
copy /Y .env.qnap .env

echo Tworzenie katalogów...
if not exist "public\uploads" mkdir "public\uploads"
if not exist ".next\cache" mkdir ".next\cache"

echo Budowanie i uruchamianie kontenerów...
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo Wyświetlanie logów...
docker-compose logs -f nextjs-app 