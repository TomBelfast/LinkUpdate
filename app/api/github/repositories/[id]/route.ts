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

// PUT - Update a repository
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repositoryId = parseInt(params.id);
    if (isNaN(repositoryId)) {
      return NextResponse.json({ error: 'Invalid repository ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, full_name, description, html_url, language, topics } = body;
    
    if (!name || !full_name || !html_url) {
      return NextResponse.json(
        { error: 'Name, full_name, and html_url are required' },
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
      
      // Check if repository exists and belongs to user
      const [repos] = await connection.execute(
        'SELECT id FROM github_repositories WHERE id = ? AND user_id = ?',
        [repositoryId, userId]
      );
      
      if (!Array.isArray(repos) || repos.length === 0) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      }
      
      // Generate clone and SSH URLs from html_url
      const clone_url = html_url.replace('https://github.com/', 'https://github.com/').replace(/\/tree\/.*$/, '') + '.git';
      const ssh_url = html_url.replace('https://github.com/', 'git@github.com:').replace(/\/tree\/.*$/, '') + '.git';
      
      // Update repository
      await connection.execute(`
        UPDATE github_repositories 
        SET name = ?, full_name = ?, description = ?, html_url = ?, 
            clone_url = ?, ssh_url = ?, language = ?, topics = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        name, full_name, description || null, html_url, clone_url, ssh_url,
        language || null, topics || null, repositoryId, userId
      ]);
      
      // Fetch the updated repository
      const [updatedRepo] = await connection.execute(
        'SELECT * FROM github_repositories WHERE id = ?',
        [repositoryId]
      );
      
      return NextResponse.json((updatedRepo as any)[0]);
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error updating repository:', error);
    return NextResponse.json(
      { error: 'Failed to update repository' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a repository
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repositoryId = parseInt(params.id);
    if (isNaN(repositoryId)) {
      return NextResponse.json({ error: 'Invalid repository ID' }, { status: 400 });
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
      
      // Check if repository exists and belongs to user
      const [repos] = await connection.execute(
        'SELECT id FROM github_repositories WHERE id = ? AND user_id = ?',
        [repositoryId, userId]
      );
      
      if (!Array.isArray(repos) || repos.length === 0) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      }
      
      // Delete related records first (tags, notes, favorites)
      await connection.execute(
        'DELETE FROM github_repository_tags WHERE repository_id = ?',
        [repositoryId]
      );
      
      await connection.execute(
        'DELETE FROM github_repository_notes WHERE repository_id = ?',
        [repositoryId]
      );
      
      await connection.execute(
        'DELETE FROM github_favorite_repositories WHERE repository_id = ?',
        [repositoryId]
      );
      
      // Delete the repository
      await connection.execute(
        'DELETE FROM github_repositories WHERE id = ? AND user_id = ?',
        [repositoryId, userId]
      );
      
      return NextResponse.json({ message: 'Repository deleted successfully' });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error deleting repository:', error);
    return NextResponse.json(
      { error: 'Failed to delete repository' },
      { status: 500 }
    );
  }
}