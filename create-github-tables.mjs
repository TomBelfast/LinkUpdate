import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function createGitHubTables() {
  let connection;
  
  try {
    console.log('=== CREATING GITHUB TABLES ===');
    
    const config = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT)
    };
    
    console.log('Connecting to database:', {
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port
    });
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Tabela dla repozytoriów GitHub
    const createRepositoriesTable = `
      CREATE TABLE IF NOT EXISTS github_repositories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        description TEXT,
        ai_description TEXT,
        ai_description_provider VARCHAR(64),
        ai_description_model VARCHAR(128),
        ai_description_updated_at DATETIME,
        html_url VARCHAR(500) NOT NULL,
        clone_url VARCHAR(500),
        ssh_url VARCHAR(500),
        language VARCHAR(100),
        stars_count INT DEFAULT 0,
        forks_count INT DEFAULT 0,
        watchers_count INT DEFAULT 0,
        size INT DEFAULT 0,
        default_branch VARCHAR(100) DEFAULT 'main',
        is_private BOOLEAN DEFAULT FALSE,
        is_fork BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        has_issues BOOLEAN DEFAULT TRUE,
        has_projects BOOLEAN DEFAULT TRUE,
        has_wiki BOOLEAN DEFAULT TRUE,
        has_pages BOOLEAN DEFAULT FALSE,
        license_name VARCHAR(100),
        topics TEXT,
        github_created_at DATETIME,
        github_updated_at DATETIME,
        github_pushed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_repo (user_id, full_name),
        INDEX idx_user_id (user_id),
        INDEX idx_name (name),
        INDEX idx_language (language),
        INDEX idx_stars (stars_count),
        INDEX idx_updated (github_updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla tagów/kategorii repozytoriów
    const createRepositoryTagsTable = `
      CREATE TABLE IF NOT EXISTS github_repository_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        repository_id INT NOT NULL,
        tag_name VARCHAR(100) NOT NULL,
        color VARCHAR(7) DEFAULT '#0366d6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_repo_tag (repository_id, tag_name),
        INDEX idx_tag_name (tag_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla notatek do repozytoriów
    const createRepositoryNotesTable = `
      CREATE TABLE IF NOT EXISTS github_repository_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        repository_id INT NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_repository_id (repository_id),
        INDEX idx_user_id (user_id),
        INDEX idx_pinned (is_pinned)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla ulubionych repozytoriów
    const createFavoriteRepositoriesTable = `
      CREATE TABLE IF NOT EXISTS github_favorite_repositories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        repository_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_favorite (user_id, repository_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla konfiguracji GitHub API
    const createGitHubConfigTable = `
      CREATE TABLE IF NOT EXISTS github_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        github_username VARCHAR(255),
        github_token VARCHAR(500),
        api_rate_limit INT DEFAULT 5000,
        api_rate_remaining INT DEFAULT 5000,
        api_rate_reset DATETIME,
        last_sync DATETIME,
        auto_sync BOOLEAN DEFAULT FALSE,
        sync_interval_hours INT DEFAULT 24,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_config (user_id),
        INDEX idx_user_id (user_id),
        INDEX idx_last_sync (last_sync)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Wykonaj tworzenie tabel
    console.log('📋 Creating github_repositories table...');
    await connection.execute(createRepositoriesTable);
    console.log('✅ github_repositories table created');

    // Ensure AI description columns exist (for existing installations)
    try {
      await connection.execute("ALTER TABLE github_repositories ADD COLUMN IF NOT EXISTS ai_description TEXT");
      await connection.execute("ALTER TABLE github_repositories ADD COLUMN IF NOT EXISTS ai_description_provider VARCHAR(64)");
      await connection.execute("ALTER TABLE github_repositories ADD COLUMN IF NOT EXISTS ai_description_model VARCHAR(128)");
      await connection.execute("ALTER TABLE github_repositories ADD COLUMN IF NOT EXISTS ai_description_updated_at DATETIME");
      console.log('✅ Ensured ai_description columns exist');
    } catch (e) {
      console.warn('ℹ️ Could not ensure ai_description columns (maybe not MySQL 8+). Proceeding...', e?.message || e);
    }
    
    console.log('📋 Creating github_repository_tags table...');
    await connection.execute(createRepositoryTagsTable);
    console.log('✅ github_repository_tags table created');
    
    console.log('📋 Creating github_repository_notes table...');
    await connection.execute(createRepositoryNotesTable);
    console.log('✅ github_repository_notes table created');
    
    console.log('📋 Creating github_favorite_repositories table...');
    await connection.execute(createFavoriteRepositoriesTable);
    console.log('✅ github_favorite_repositories table created');
    
    console.log('📋 Creating github_config table...');
    await connection.execute(createGitHubConfigTable);
    console.log('✅ github_config table created');
    
    // Sprawdź utworzone tabele
    const [tables] = await connection.execute("SHOW TABLES LIKE 'github_%'");
    console.log('📊 Created GitHub tables:', tables);
    
    // Sprawdź strukturę głównej tabeli repozytoriów
    const [repoStructure] = await connection.execute('DESCRIBE github_repositories');
    console.log('📋 github_repositories structure:', repoStructure);
    
    console.log('🎉 All GitHub tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create GitHub tables:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createGitHubTables();