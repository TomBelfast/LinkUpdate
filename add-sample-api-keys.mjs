import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function addSampleApiKeys() {
  let connection;
  
  try {
    console.log('=== ADDING SAMPLE API KEYS ===');
    
    const config = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT)
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Sprawdź czy użytkownik Tomasz istnieje
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ User tomaszpasiekauk@gmail.com not found');
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ Found user:', users[0]);
    
    // Przykładowe klucze API
    const sampleApiKeys = [
      {
        service_name: 'OpenAI',
        api_name: 'GPT-4 API',
        website_url: 'https://platform.openai.com',
        api_key: 'sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef',
        description: 'API key for GPT-4 and other OpenAI models'
      },
      {
        service_name: 'Google Cloud',
        api_name: 'Vision API',
        website_url: 'https://cloud.google.com/vision',
        api_key: 'AIzaSyD1234567890abcdef1234567890abcdef123',
        description: 'Google Cloud Vision API for image analysis'
      },
      {
        service_name: 'GitHub',
        api_name: 'Personal Access Token',
        website_url: 'https://github.com/settings/tokens',
        api_key: 'ghp_1234567890abcdef1234567890abcdef12345678',
        description: 'GitHub PAT for repository access and automation'
      },
      {
        service_name: 'Anthropic',
        api_name: 'Claude API',
        website_url: 'https://console.anthropic.com',
        api_key: 'sk-ant-api03-1234567890abcdef1234567890abcdef1234567890abcdef',
        description: 'Anthropic Claude API for AI conversations'
      },
      {
        service_name: 'Stripe',
        api_name: 'Payment API',
        website_url: 'https://dashboard.stripe.com/apikeys',
        api_key: 'sk_test_1234567890abcdef1234567890abcdef1234567890abcdef',
        description: 'Stripe test API key for payment processing'
      }
    ];
    
    // Dodaj przykładowe klucze API
    for (const apiKey of sampleApiKeys) {
      const [result] = await connection.execute(`
        INSERT INTO api_keys (
          user_id, service_name, api_name, website_url, api_key, description
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          website_url = VALUES(website_url),
          api_key = VALUES(api_key),
          description = VALUES(description)
      `, [
        userId, apiKey.service_name, apiKey.api_name, apiKey.website_url,
        apiKey.api_key, apiKey.description
      ]);
      
      console.log(`✅ Added API key: ${apiKey.service_name} - ${apiKey.api_name}`);
    }
    
    // Sprawdź dodane klucze API
    const [apiKeys] = await connection.execute(`
      SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC
    `, [userId]);
    
    console.log('📊 Added API keys:', apiKeys.length);
    apiKeys.forEach(key => {
      console.log(`  - ${key.service_name}: ${key.api_name}`);
    });
    
    console.log('🎉 Sample API keys added successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add sample API keys:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addSampleApiKeys();