import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email]
    ) as any[];

    // For security reasons, we don't want to reveal if a user exists or not
    // So we'll always return a success message, even if the user doesn't exist
    if (!users || users.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Najpierw upewnijmy się, że tabela users ma kolumny reset_token i reset_token_expires
    try {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME DEFAULT NULL
      `, []);
    } catch (alterError) {
      // Jeśli błąd dotyczy składni (niektóre wersje MySQL nie obsługują IF NOT EXISTS dla ADD COLUMN)
      // spróbujmy inaczej - sprawdzając czy kolumny istnieją
      try {
        const columns = await executeQuery(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?
          AND COLUMN_NAME IN ('reset_token', 'reset_token_expires')
        `, [process.env.DATABASE_NAME]) as any[];
        
        if (!columns || columns.length < 2) {
          // Dodajemy brakujące kolumny bez IF NOT EXISTS
          if (!columns.find(c => c.COLUMN_NAME === 'reset_token')) {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL`, []);
          }
          if (!columns.find(c => c.COLUMN_NAME === 'reset_token_expires')) {
            await executeQuery(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`, []);
          }
        }
      } catch (schemaError) {
        // Kontynuujmy mimo błędu, użytkownik dostanie komunikat o sukcesie, ale funkcja nie zadziała
      }
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    try {
      await executeQuery(
        "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
        [resetToken, resetTokenExpiry, email]
      );
    } catch (updateError: any) {
      // Nadal zwracamy sukces, aby nie ujawniać informacji o użytkowniku
      return NextResponse.json({ success: true });
    }

    // Create reset URL
    const resetUrl = `https://link.aihub.ovh/auth/reset-password?token=${resetToken}`;

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      text: `Please use the following link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Link Manager account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
