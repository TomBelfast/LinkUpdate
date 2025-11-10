import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db-pool";

async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Credential comparison error:", error);
    return false;
  }
}

if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET || !process.env.NEXTAUTH_SECRET) {
  console.error("Missing required environment variables for authentication");
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const users = await executeQuery(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
          ) as any[];
          if (!users || users.length === 0) {
            return null;
          }
          const user = users[0];
          if (!user.password || typeof user.password !== 'string') {
            return null;
          }
          const password = credentials.password as string;
          const isPasswordValid = await comparePassword(password, user.password);
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: 'user',
          };
        } catch (error) {
          console.error("Authentication error occurred");
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (account?.provider === "google" && profile) {
        try {
          const users = await executeQuery(
            "SELECT id FROM users WHERE email = ?",
            [profile.email]
          ) as any[];
          if (users && users.length > 0) {
            token.id = users[0].id;
            token.role = 'user';
          } else {
            const newUserId = crypto.randomUUID();
            await executeQuery(
              "INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)",
              [newUserId, profile.email, profile.name, 'user']
            );
            token.id = newUserId;
            token.role = 'user';
          }
        } catch (error) {
          console.error("Error handling Google user in DB:", error);
        }
      } else if (user) {
        if (user.id) {
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
