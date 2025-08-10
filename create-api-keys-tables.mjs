import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function createApiKeysTables() {
  let connection;
  
  try {
    console.log('=== CREATING API KEYS TABLES ===');
    
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
    
    // Tabela dla kluczy API
    const createApiKeysTable = `
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        api_name VARCHAR(255) NOT NULL,
        website_url VARCHAR(500),
        api_key VARCHAR(1000) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at DATETIME,
        usage_count INT DEFAULT 0,
        last_used_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_service (user_id, service_name, api_name),
        INDEX idx_user_id (user_id),
        INDEX idx_service_name (service_name),
        INDEX idx_is_active (is_active),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla kategorii/tagów API
    const createApiCategoriesTable = `
      CREATE TABLE IF NOT EXISTS api_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#0366d6',
        icon VARCHAR(50) DEFAULT '🔑',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela łącząca klucze API z kategoriami
    const createApiKeyCategoriesTable = `
      CREATE TABLE IF NOT EXISTS api_key_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        api_key_id INT NOT NULL,
        category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_api_category (api_key_id, category_id),
        INDEX idx_api_key_id (api_key_id),
        INDEX idx_category_id (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Tabela dla logów użycia API
    const createApiUsageLogsTable = `
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        api_key_id INT NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        response_status INT,
        response_time_ms INT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_api_key_id (api_key_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Wykonaj tworzenie tabel
    console.log('📋 Creating api_keys table...');
    await connection.execute(createApiKeysTable);
    console.log('✅ api_keys table created');
    
    console.log('📋 Creating api_categories table...');
    await connection.execute(createApiCategoriesTable);
    console.log('✅ api_categories table created');
    
    console.log('📋 Creating api_key_categories table...');
    await connection.execute(createApiKeyCategoriesTable);
    console.log('✅ api_key_categories table created');
    
    console.log('📋 Creating api_usage_logs table...');
    await connection.execute(createApiUsageLogsTable);
    console.log('✅ api_usage_logs table created');
    
    // Dodaj domyślne kategorie
    const defaultCategories = [
      { name: 'AI/ML', color: '#ff6b6b', icon: '🤖', description: 'Artificial Intelligence and Machine Learning APIs' },
      { name: 'Social Media', color: '#4ecdc4', icon: '📱', description: 'Social media platform APIs' },
      { name: 'Cloud Services', color: '#45b7d1', icon: '☁️', description: 'Cloud computing and storage APIs' },
      { name: 'Payment', color: '#96ceb4', icon: '💳', description: 'Payment processing APIs' },
      { name: 'Analytics', color: '#feca57', icon: '📊', description: 'Analytics and tracking APIs' },
      { name: 'Communication', color: '#ff9ff3', icon: '💬', description: 'Email, SMS, and messaging APIs' },
      { name: 'Development', color: '#54a0ff', icon: '⚙️', description: 'Development tools and services' },
      { name: 'Database', color: '#5f27cd', icon: '🗄️', description: 'Database and storage APIs' }
    ];
    
    console.log('📋 Adding default categories...');
    for (const category of defaultCategories) {
      await connection.execute(`
        INSERT INTO api_categories (name, color, icon, description)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          color = VALUES(color),
          icon = VALUES(icon),
          description = VALUES(description)
      `, [category.name, category.color, category.icon, category.description]);
    }
    console.log('✅ Default categories added');
    
    // Sprawdź utworzone tabele
    const [tables] = await connection.execute("SHOW TABLES LIKE 'api_%'");
    console.log('📊 Created API tables:', tables);
    
    // Sprawdź strukturę głównej tabeli
    const [apiKeysStructure] = await connection.execute('DESCRIBE api_keys');
    console.log('📋 api_keys structure:', apiKeysStructure);
    
    // Sprawdź kategorie
    const [categories] = await connection.execute('SELECT * FROM api_categories');
    console.log('📂 Available categories:', categories);
    
    console.log('🎉 All API keys tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create API keys tables:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createApiKeysTables();