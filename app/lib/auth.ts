import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export type Session = {
  user: User;
};

// Database queries are now handled by the connection pool in lib/db-pool.ts

// Secure password hashing using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // High security level
  return await bcrypt.hash(password, saltRounds);
}

// Secure password comparison using bcrypt
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Credential comparison error:", error);
    return false;
  }
}

// Register a new user
export async function registerUser(name: string, email: string, password: string) {
  try {
    // Check if user already exists
    const existingUsers = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    ) as any[];

    if (existingUsers && existingUsers.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - sprawdź czy tabela istnieje, jeśli nie, utwórz ją
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

    // Generuj unikalny identyfikator
    const userId = crypto.randomUUID();

    // Dodaj użytkownika
    await executeQuery(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [userId, name, email, hashedPassword]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(error.message || "An error occurred during registration");
  }
}
