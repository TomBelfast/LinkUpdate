import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

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

// Get user from session token
async function getUserFromSession() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("next-auth.session-token")?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
    // Verify and decode the JWT token
    const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(sessionToken, secret) as any;

    if (!decoded || !decoded.email) {
      return null;
    }

    // Get user from database
    const users = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [decoded.email]
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

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { message: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { message: "Invalid role. Role must be 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Update user role
    await executeQuery(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "An error occurred while updating user role" },
      { status: 500 }
    );
  }
}
