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

// GET - Fetch all repositories for the authenticated user
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
      
      const userId = (users[0] as any).id;
      
      // Fetch repositories with tags and notes count
      const [repositories] = await connection.execute(`
        SELECT r.*, 
               GROUP_CONCAT(DISTINCT t.tag_name) as tags,
               COUNT(DISTINCT n.id) as notes_count,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM github_repositories r
        LEFT JOIN github_repository_tags t ON r.id = t.repository_id
        LEFT JOIN github_repository_notes n ON r.id = n.repository_id
        LEFT JOIN github_favorite_repositories f ON r.id = f.repository_id AND f.user_id = r.user_id
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `, [userId]);
      
      return NextResponse.json(repositories);
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

// POST - Add a new repository
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      
      const userId = (users[0] as any).id;
      
      // Generate clone and SSH URLs from html_url
      const clone_url = html_url.replace('https://github.com/', 'https://github.com/').replace(/\/tree\/.*$/, '') + '.git';
      const ssh_url = html_url.replace('https://github.com/', 'git@github.com:').replace(/\/tree\/.*$/, '') + '.git';
      
      // Insert repository
      const [result] = await connection.execute(`
        INSERT INTO github_repositories (
          user_id, name, full_name, description, html_url, clone_url, ssh_url,
          language, topics, stars_count, forks_count, watchers_count, size,
          default_branch, is_private, is_fork, is_archived, has_issues,
          has_projects, has_wiki, has_pages
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'main', 0, 0, 0, 1, 0, 0, 0)
      `, [
        userId, name, full_name, description || null, html_url, clone_url, ssh_url,
        language || null, topics || null
      ]);
      
      const insertResult = result as any;
      const repositoryId = insertResult.insertId;
      
      // Fetch the created repository
      const [newRepo] = await connection.execute(
        'SELECT * FROM github_repositories WHERE id = ?',
        [repositoryId]
      );
      
      return NextResponse.json(newRepo[0], { status: 201 });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error creating repository:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}