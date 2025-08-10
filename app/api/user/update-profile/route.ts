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
    // Check if user is authenticated
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Update user in database
    await executeQuery(
      "UPDATE users SET name = ? WHERE email = ?",
      [name, user.email]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "An error occurred while updating your profile" },
      { status: 500 }
    );
  }
}
