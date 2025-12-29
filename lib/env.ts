/**
 * Environment Variables Validation Module
 *
 * Provides type-safe environment variable validation with fail-fast behavior.
 * All required environment variables are validated at application startup.
 *
 * @security CRITICAL - Never use fallback values for credentials in production
 */

import { z } from 'zod';

// ============================================================================
// Environment Variable Schema Definition
// ============================================================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database Configuration (REQUIRED - no fallbacks)
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
  DATABASE_PORT: z.string().regex(/^\d+$/, 'DATABASE_PORT must be a number').transform(Number),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),

  // NextAuth Configuration (REQUIRED)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Google OAuth (REQUIRED for Google login)
  GOOGLE_ID: z.string().min(1, 'GOOGLE_ID is required for OAuth'),
  GOOGLE_SECRET: z.string().min(1, 'GOOGLE_SECRET is required for OAuth'),

  // AI Provider API Keys (OPTIONAL - only required if using specific providers)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  PPLX_API_KEY: z.string().optional(),
  PPLX_MODEL: z.string().optional(),

  // Email Configuration (OPTIONAL - for password reset)
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// ============================================================================
// Type Inference from Schema
// ============================================================================

export type Env = z.infer<typeof envSchema>;

// ============================================================================
// Validation Function
// ============================================================================

let cachedEnv: Env | null = null;

/**
 * Validates environment variables against the schema.
 *
 * @throws {Error} If validation fails with detailed error messages
 * @returns {Env} Validated and typed environment variables
 *
 * @example
 * ```typescript
 * import { validateEnv } from '@/lib/env';
 *
 * const env = validateEnv();
 * console.log(env.DATABASE_HOST); // Type-safe access
 * ```
 */
export function validateEnv(): Env {
  // Return cached result if already validated
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    const parsed = envSchema.parse(process.env);
    cachedEnv = parsed;
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      }).join('\n');

      const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ENVIRONMENT VALIDATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following environment variables are missing or invalid:

${missingVars}

Please ensure all required environment variables are set in:
  - .env.local (for local development)
  - Deployment platform settings (for production)

See .env.example for a template with all required variables.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      console.error(errorMessage);
      throw new Error('Environment validation failed. Check console for details.');
    }

    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a specific environment variable is set
 */
export function hasEnvVar(key: keyof Env): boolean {
  const env = validateEnv();
  return env[key] !== undefined && env[key] !== '';
}

/**
 * Gets environment variable with type safety
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  const env = validateEnv();
  return env[key];
}

/**
 * Checks if running in production
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV') === 'production';
}

/**
 * Checks if running in development
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV') === 'development';
}

/**
 * Checks if running in test environment
 */
export function isTest(): boolean {
  return getEnvVar('NODE_ENV') === 'test';
}

// ============================================================================
// Startup Validation
// ============================================================================

/**
 * Validates environment on module load (fail-fast)
 * This ensures the application won't start with invalid configuration
 */
if (typeof window === 'undefined') {
  // Only validate on server-side (not in browser)
  try {
    // Skip validation during build phase or if explicitly requested
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.CI === 'true' ||
      process.env.SKIP_ENV_VALIDATION === 'true';

    if (!isBuildPhase) {
      validateEnv();
      console.log('✅ Environment variables validated successfully');
    } else {
      console.log('ℹ️ Skipping detailed environment validation during build phase');
    }
  } catch (error) {
    console.error('❌ Environment validation failed during module load');
    // In production, we want to fail fast unless it's the build phase
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      process.exit(1);
    }
  }
}

// ============================================================================
// Export Validated Environment
// ============================================================================

/**
 * Pre-validated environment object
 * Use this instead of process.env for type safety
 *
 * @example
 * ```typescript
 * import { env } from '@/lib/env';
 *
 * const dbConfig = {
 *   host: env.DATABASE_HOST,
 *   port: env.DATABASE_PORT,
 *   user: env.DATABASE_USER,
 *   password: env.DATABASE_PASSWORD,
 *   database: env.DATABASE_NAME,
 * };
 * ```
 */
export const env = typeof window === 'undefined' ? validateEnv() : {} as Env;
