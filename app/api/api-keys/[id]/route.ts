import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

// PUT - Update an API key
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyId = parseInt(params.id);
    if (isNaN(apiKeyId)) {
      return NextResponse.json({ error: 'Invalid API key ID' }, { status: 400 });
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
      
      const userId = (users[0] as any).id;
      
      // Check if API key exists and belongs to user
      const [apiKeys] = await connection.execute(
        'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
        [apiKeyId, userId]
      );
      
      if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }
      
      // Update API key
      await connection.execute(`
        UPDATE api_keys 
        SET service_name = ?, api_name = ?, website_url = ?, api_key = ?, 
            description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        service_name, api_name, website_url || null, api_key, 
        description || null, apiKeyId, userId
      ]);
      
      // Fetch the updated API key
      const [updatedApiKey] = await connection.execute(
        'SELECT * FROM api_keys WHERE id = ?',
        [apiKeyId]
      );
      
      return NextResponse.json(updatedApiKey[0]);
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyId = parseInt(params.id);
    if (isNaN(apiKeyId)) {
      return NextResponse.json({ error: 'Invalid API key ID' }, { status: 400 });
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
      
      const userId = (users[0] as any).id;
      
      // Check if API key exists and belongs to user
      const [apiKeys] = await connection.execute(
        'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
        [apiKeyId, userId]
      );
      
      if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }
      
      // Delete related records first
      await connection.execute(
        'DELETE FROM api_key_categories WHERE api_key_id = ?',
        [apiKeyId]
      );
      
      await connection.execute(
        'DELETE FROM api_usage_logs WHERE api_key_id = ?',
        [apiKeyId]
      );
      
      // Delete the API key
      await connection.execute(
        'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
        [apiKeyId, userId]
      );
      
      return NextResponse.json({ message: 'API key deleted successfully' });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}