import { NextRequest, NextResponse } from 'next/server';
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

// GET - Fetch all API categories
export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();
    
    try {
      // Fetch all categories
      const [categories] = await connection.execute(`
        SELECT * FROM api_categories
        ORDER BY name ASC
      `);
      
      return NextResponse.json(categories);
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error fetching API categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API categories' },
      { status: 500 }
    );
  }
}