import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db-pool";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function POST(request: NextRequest) {
  try {
    
    // Get request body
    const body = await request.json();
    const { name, email, password } = body;
    

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    
    try {
      // Check if user already exists
      const existingUsers = await executeQuery(
        "SELECT * FROM users WHERE email = ?",
        [email]
      ) as any[];


      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error: any) {
      console.error("Error checking existing users:", error);
      // Jeśli błąd dotyczy nieistniejącej tabeli, kontynuujemy
      if (error.message && !error.message.includes("doesn't exist")) {
        throw error;
      }
    }

    console.log("Creating users table if not exists");
    
    // Create users table if it doesn't exist
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          reset_token VARCHAR(255) DEFAULT NULL,
          reset_token_expires DATETIME DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `, []);
      
      // Sprawdź czy wszystkie potrzebne kolumny istnieją
      try {
        const columns = await executeQuery(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
          AND COLUMN_NAME IN ('reset_token', 'reset_token_expires', 'password')
        `, [process.env.DATABASE_NAME]) as any[];
        
        const requiredColumns = ['reset_token', 'reset_token_expires', 'password'];
        const missingColumns = [];
        
        for (const col of requiredColumns) {
          if (!columns.find(c => c.COLUMN_NAME === col)) {
            missingColumns.push(col);
          }
        }
        
        // Dodaj brakujące kolumny
        if (missingColumns.length > 0) {
          console.log(`Brakujące kolumny: ${missingColumns.join(', ')}`);
          
          for (const col of missingColumns) {
            if (col === 'reset_token') {
              await executeQuery(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`, []);
            } else if (col === 'reset_token_expires') {
              await executeQuery(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`, []);
            } else if (col === 'password') {
              await executeQuery(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''`, []);
            }
          }
          
          console.log("Dodano brakujące kolumny w tabeli users");
        }
      } catch (error) {
        console.error("Błąd podczas sprawdzania kolumn tabeli users:", error);
      }
      
      console.log("Users table created or already exists");
    } catch (error: any) {
      console.error("Error creating users table:", error);
      throw error;
    }

    console.log("Hashing password");
    
    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate UUID
    const userId = crypto.randomUUID();
    
    console.log("Inserting new user with ID:", userId);

    // Insert user
    await executeQuery(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [userId, name, email, hashedPassword]
    );
    
    console.log("User registered successfully");

    return NextResponse.json({ 
      success: true,
      message: "User registered successfully" 
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred during registration" },
      { status: 500 }
    );
  }
} 