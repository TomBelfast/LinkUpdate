// Auth.js v5 - Route Handler
// All configuration is now in /auth.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Export authOptions for backward compatibility with existing code
export { authOptions } from "@/auth";
