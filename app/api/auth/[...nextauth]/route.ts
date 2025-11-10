import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

// Rozszerzamy typy dla next-auth
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
