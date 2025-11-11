/**
 * NextAuth API Route Handler
 *
 * Main authentication endpoint for NextAuth.js
 * Configuration is in lib/auth/auth-config.ts to avoid Next.js 15 export issues
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
