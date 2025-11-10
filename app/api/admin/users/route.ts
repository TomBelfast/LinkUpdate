import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/auth";

// Database connection function
async function executeQuery(query: string, values: any[] = []) {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
  });

  try {
    const [results] = await connection.execute(query, values);
    return results;
  } finally {
    await connection.end();
  }
}

// Get user from session
async function getUserFromSession() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    const users = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [session.user.email]
    ) as any[];

    if (!users || users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "You do not have permission to access this resource" },
        { status: 403 }
      );
    }

    // Get all users
    const allUsers = await executeQuery(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
      []
    );

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}
