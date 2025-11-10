import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import mysql from 'mysql2/promise';

// Database connection
async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT || '3306')
  });
}

// GET - Fetch all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await getConnection();
    
    try {
      // Get user ID
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [session.user.email]
      );
      
      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = ((users as any)[0] as any).id;
      
      // Fetch API keys with categories
      const [apiKeys] = await connection.execute(`
        SELECT ak.*, 
               GROUP_CONCAT(DISTINCT c.name) as categories
        FROM api_keys ak
        LEFT JOIN api_key_categories akc ON ak.id = akc.api_key_id
        LEFT JOIN api_categories c ON akc.category_id = c.id
        WHERE ak.user_id = ?
        GROUP BY ak.id
        ORDER BY ak.created_at DESC
      `, [userId]);
      
      return NextResponse.json(apiKeys);
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Add a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service_name, api_name, website_url, api_key, description } = body;
    
    if (!service_name || !api_name || !api_key) {
      return NextResponse.json(
        { error: 'Service name, API name, and API key are required' },
        { status: 400 }
      );
    }

    const connection = await getConnection();
    
    try {
      // Get user ID
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [session.user.email]
      );
      
      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = ((users as any)[0] as any).id;
      
      // Insert API key
      const [result] = await connection.execute(`
        INSERT INTO api_keys (
          user_id, service_name, api_name, website_url, api_key, description
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId, service_name, api_name, website_url || null, api_key, 
        description || null
      ]);
      
      const insertResult = result as any;
      const apiKeyId = insertResult.insertId;
      
      // Fetch the created API key
      const [newApiKey] = await connection.execute(
        'SELECT * FROM api_keys WHERE id = ?',
        [apiKeyId]
      );
      
      return NextResponse.json((newApiKey as any)[0], { status: 201 });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}