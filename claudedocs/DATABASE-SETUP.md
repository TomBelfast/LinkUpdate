# Konfiguracja Bazy Danych - Wewnętrzna vs Zewnętrzna

**Data**: 2025-11-10

---

## Przegląd

LinkUpdate wspiera dwa scenariusze deployment bazy danych:

1. **Wewnętrzna baza w kontenerze Docker** (Recommended dla Docker/Coolify)
2. **Zewnętrzna baza MySQL** (Dla istniejącej infrastruktury)

---

## Opcja 1: Wewnętrzna Baza w Kontenerze (Recommended)

### Kiedy używać?

- ✅ Deploy z Docker Compose
- ✅ Deploy na Coolify
- ✅ Development lokalny
- ✅ Testing environments
- ✅ Self-contained deployments

### Zalety

- ✅ **Wszystko w jednym miejscu** - app + database w tym samym stacku
- ✅ **Automatic networking** - komunikacja przez Docker network
- ✅ **Persistent storage** - dane zachowane w Docker volume
- ✅ **Easy backup** - volume snapshot lub mysqldump
- ✅ **Isolated** - baza dostępna tylko dla aplikacji
- ✅ **No external dependencies** - nie potrzebujesz zewnętrznego serwera MySQL
- ✅ **Health checks** - automatyczny restart jeśli baza umiera

### Konfiguracja

#### docker-compose.prod.yml
```yaml
services:
  app:
    environment:
      DATABASE_HOST: db        # Service name z docker-compose
      DATABASE_PORT: 3306
      DATABASE_USER: linkupdate
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: linkupdate

  db:
    image: mysql:8.0
    container_name: linkupdate-db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: linkupdate
      MYSQL_USER: linkupdate
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql  # Persistent storage
    networks:
      - linkupdate-network

volumes:
  mysql-data:  # Dane przetrwają restart kontenera
```

#### .env dla Docker
```bash
# Wewnętrzna baza MySQL w kontenerze
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_USER=linkupdate
DATABASE_PASSWORD=SuperSecurePassword123!
DATABASE_NAME=linkupdate

# Root password dla MySQL container
MYSQL_ROOT_PASSWORD=RootPassword123!

# Inne zmienne...
NEXTAUTH_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...
```

### Deployment

#### Docker Compose
```bash
# Start z wewnętrzną bazą
docker-compose -f docker-compose.prod.yml up -d

# Sprawdź status
docker-compose ps

# Logi bazy danych
docker-compose logs db

# Wejdź do MySQL console
docker-compose exec db mysql -u root -p
```

#### Coolify
1. Push do Git
2. W Coolify: New Resource → Docker Compose
3. Select `docker-compose.prod.yml`
4. Add environment variables:
   ```
   DATABASE_HOST=db
   DATABASE_USER=linkupdate
   DATABASE_PASSWORD=<secure-password>
   DATABASE_NAME=linkupdate
   MYSQL_ROOT_PASSWORD=<root-password>
   ```
5. Deploy

### Backup & Restore

#### Backup
```bash
# Pełny backup bazy danych
docker-compose exec db mysqldump \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  ${DATABASE_NAME} > backup-$(date +%Y%m%d).sql

# Backup volume (Docker volume)
docker run --rm \
  -v linkupdate_mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql-volume-backup.tar.gz /data
```

#### Restore
```bash
# Restore z SQL dump
docker-compose exec -T db mysql \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  ${DATABASE_NAME} < backup-20251110.sql

# Restore volume
docker run --rm \
  -v linkupdate_mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql-volume-backup.tar.gz -C /
```

### Port Exposure

**Production** (docker-compose.prod.yml):
```yaml
db:
  # Port 3306 NIE jest expose na zewnątrz
  # Dostępny tylko w internal network (linkupdate-network)
  # To jest BEZPIECZNE - tylko app może się połączyć
```

**Development** (docker-compose.dev.yml):
```yaml
db:
  ports:
    - "3306:3306"  # Expose dla dostępu z hosta (DBeaver, etc.)
  # UWAGA: Nie używaj tego w production!
```

---

## Opcja 2: Zewnętrzna Baza MySQL

### Kiedy używać?

- ✅ Masz istniejący serwer MySQL
- ✅ Shared database między aplikacjami
- ✅ Managed database service (AWS RDS, DigitalOcean, etc.)
- ✅ Duże deployment z dedykowanym DB serverem

### Zalety

- ✅ **Centralized database** - jedna baza dla wielu aplikacji
- ✅ **Professional management** - dedykowany DBA team
- ✅ **High availability** - replication, clustering
- ✅ **Better performance** - dedicated hardware
- ✅ **Advanced features** - monitoring, automated backups

### Konfiguracja

#### Dla standalone deployment (bez Docker)

##### .env
```bash
# Zewnętrzna baza MySQL
DATABASE_HOST=192.168.0.250       # IP lub hostname serwera MySQL
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_database_name

# MYSQL_ROOT_PASSWORD nie jest potrzebne (nie zarządzamy serwerem)

# Inne zmienne...
NEXTAUTH_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...
```

##### Setup bazy danych na serwerze

```sql
-- Zaloguj się na serwer MySQL (192.168.0.250)
mysql -h 192.168.0.250 -u root -p

-- Utwórz bazę danych
CREATE DATABASE linkupdate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utwórz użytkownika
CREATE USER 'linkupdate_user'@'%' IDENTIFIED BY 'SuperSecurePassword123!';

-- Nadaj uprawnienia
GRANT ALL PRIVILEGES ON linkupdate.* TO 'linkupdate_user'@'%';
FLUSH PRIVILEGES;

-- Sprawdź
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user='linkupdate_user';
```

#### Dla Docker deployment z zewnętrzną bazą

Jeśli chcesz użyć Docker **ale** z zewnętrzną bazą:

##### docker-compose.external-db.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: linkupdate:latest
    container_name: linkupdate-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_HOST: 192.168.0.250  # Zewnętrzny serwer
      DATABASE_PORT: 3306
      DATABASE_USER: ${DATABASE_USER}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      GOOGLE_ID: ${GOOGLE_ID}
      GOOGLE_SECRET: ${GOOGLE_SECRET}
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  # Brak db service - używamy zewnętrznej bazy
```

##### Deployment
```bash
# Start aplikacji z zewnętrzną bazą
docker-compose -f docker-compose.external-db.yml up -d
```

### Network Configuration

Upewnij się że:
- ✅ Firewall na serwerze MySQL zezwala na połączenia z IP aplikacji
- ✅ MySQL słucha na `0.0.0.0:3306` (nie tylko `127.0.0.1`)
- ✅ User ma uprawnienia `@'%'` lub `@'app-server-ip'`

```bash
# Sprawdź bind-address w MySQL
mysql -h 192.168.0.250 -u root -p
mysql> SHOW VARIABLES LIKE 'bind_address';
# Powinno być: 0.0.0.0 lub specific IP

# Test połączenia z aplikacji
mysql -h 192.168.0.250 -u linkupdate_user -p linkupdate
```

---

## Porównanie

| Feature | Wewnętrzna (Docker) | Zewnętrzna MySQL |
|---------|---------------------|------------------|
| **Setup** | Automatyczny | Wymaga manual setup |
| **Backup** | Volume snapshot / mysqldump | Server backup tools |
| **Networking** | Internal Docker network | External IP + firewall |
| **Security** | Isolated (nie expose port) | Wymaga firewall rules |
| **Scalability** | Limited (single container) | High (clustering, replication) |
| **Performance** | Good dla małych/średnich | Better dla dużych deployments |
| **Cost** | Included w Docker host | Może wymagać dedicated server |
| **Management** | Automatic (Docker compose) | Manual (DBA) |

---

## Migracja między opcjami

### Z zewnętrznej do wewnętrznej (Docker)

1. **Backup zewnętrznej bazy**:
   ```bash
   mysqldump -h 192.168.0.250 -u user -p database_name > backup.sql
   ```

2. **Deploy z docker-compose.prod.yml**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Import danych**:
   ```bash
   docker-compose exec -T db mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DATABASE_NAME} < backup.sql
   ```

4. **Update .env**:
   ```bash
   DATABASE_HOST=db  # Was: 192.168.0.250
   ```

5. **Restart aplikacji**:
   ```bash
   docker-compose restart app
   ```

### Z wewnętrznej do zewnętrznej

1. **Backup z Docker**:
   ```bash
   docker-compose exec db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${DATABASE_NAME} > backup.sql
   ```

2. **Setup zewnętrznej bazy** (patrz wyżej)

3. **Import danych**:
   ```bash
   mysql -h 192.168.0.250 -u user -p database_name < backup.sql
   ```

4. **Update .env**:
   ```bash
   DATABASE_HOST=192.168.0.250  # Was: db
   ```

5. **Restart aplikacji**:
   ```bash
   docker-compose restart app
   ```

---

## FAQ

### Q: Czy mogę używać obu opcji jednocześnie?

**A:** Nie w tym samym deploymencie. Musisz wybrać jedną opcję:
- Albo wewnętrzna baza w Docker (`DATABASE_HOST=db`)
- Albo zewnętrzna baza MySQL (`DATABASE_HOST=192.168.0.250`)

### Q: Co się stanie z danymi gdy restartuje kontener?

**A:** Dane są bezpieczne! Docker volume `mysql-data` przechowuje wszystkie dane. Nawet jeśli:
- Restartujesz kontener: `docker-compose restart db`
- Stopujesz i startujesz: `docker-compose down && docker-compose up`

Dane zostaną zachowane. Jedynie `docker-compose down -v` usuwa volumes.

### Q: Jak expose port 3306 dla development?

**A:**
1. Development: używaj `docker-compose.dev.yml` (port już expose)
2. Production: **NIE expose** - to jest security risk

Jeśli absolutnie potrzebujesz dostępu w production:
```yaml
db:
  ports:
    - "127.0.0.1:3306:3306"  # Tylko localhost, nie publicznie!
```

### Q: Jak sprawdzić czy baza działa?

**A:**
```bash
# Health check
docker-compose ps db
# Status powinien być "healthy"

# Logi
docker-compose logs db | tail -20

# MySQL console
docker-compose exec db mysql -u root -p

# Test połączenia z app
docker-compose exec app mysql -h db -u linkupdate -p
```

### Q: Gdzie są przechowywane dane?

**A:** Docker volume:
```bash
# Lista volumes
docker volume ls | grep mysql

# Inspect volume
docker volume inspect linkupdate_mysql-data

# Location na hoście (Linux)
# /var/lib/docker/volumes/linkupdate_mysql-data/_data
```

### Q: Jak zmienić hasło root MySQL?

**A:**
```bash
# 1. Zmień w .env
MYSQL_ROOT_PASSWORD=NewPassword123!

# 2. Wejdź do kontenera
docker-compose exec db mysql -u root -p

# 3. Update hasła
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPassword123!';
FLUSH PRIVILEGES;
EXIT;

# 4. Restart kontenera
docker-compose restart db
```

---

## Recommended Setup

### Development:
- ✅ **Wewnętrzna baza w Docker**
- ✅ `docker-compose.dev.yml`
- ✅ Port 3306 expose dla dostępu z DBeaver/MySQL Workbench

### Staging/Testing:
- ✅ **Wewnętrzna baza w Docker**
- ✅ `docker-compose.prod.yml`
- ✅ Port 3306 NIE expose

### Production (małe/średnie):
- ✅ **Wewnętrzna baza w Docker**
- ✅ `docker-compose.prod.yml`
- ✅ Automated backups
- ✅ Monitoring

### Production (duże):
- ✅ **Zewnętrzna baza MySQL** (managed service lub dedicated server)
- ✅ High availability (replication)
- ✅ Professional DBA management
- ✅ Advanced monitoring & alerting

---

## Podsumowanie

**Dla większości przypadków użycia**, zalecamy **wewnętrzną bazę w Docker**:

✅ **Prostsze** - wszystko w jednym stacku
✅ **Bezpieczniejsze** - izolowana sieć
✅ **Tańsze** - nie potrzeba dedicated server
✅ **Łatwiejsze** w maintenance

**Zewnętrzna baza** jest lepsza dla:
- 🏢 Enterprise deployments
- 📈 High-traffic applications
- 🔄 Shared database między aplikacjami
- 👨‍💼 Teams z dedykowanym DBA

---

**Nasza domyślna konfiguracja**: Wewnętrzna baza MySQL w kontenerze Docker z automatycznym networking i persistent storage.
