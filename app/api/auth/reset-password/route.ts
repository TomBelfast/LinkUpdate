import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import crypto from "crypto";

// Funkcja hashowania hasła - zastępuje bcrypt
async function hashPassword(password: string): Promise<string> {
  // Generowanie soli - prosta implementacja
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Zastosowanie funkcji skrótu SHA-256
  const hash = crypto.createHash('sha256');
  hash.update(salt + password);
  const hashedValue = salt + '$' + hash.digest('hex');
  
  return hashedValue;
}

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

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Upewnijmy się, że kolumny reset_token i reset_token_expires istnieją
    try {
      // Sprawdź czy kolumny istnieją
      const columns = await executeQuery(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
        AND COLUMN_NAME IN ('reset_token', 'reset_token_expires', 'password')
      `, [process.env.DATABASE_NAME]) as any[];
      
      // Sprawdź czy wszystkie potrzebne kolumny istnieją
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
        
        console.log("Dodano brakujące kolumny potrzebne do resetowania hasła");
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania i dodawania kolumn:", error);
      // Kontynuujemy, użytkownik prawdopodobnie dostanie błąd, ale przynajmniej będzie wiedział, że token jest nieprawidłowy
    }

    // Find user with valid reset token
    let users;
    try {
      users = await executeQuery(
        "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token]
      ) as any[];
    } catch (error) {
      console.error("Błąd podczas wyszukiwania użytkownika z tokenem resetowania:", error);
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password and clear reset token
    await executeQuery(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?",
      [hashedPassword, token]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
