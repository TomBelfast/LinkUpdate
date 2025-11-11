/**
 * Rate Limiting Middleware
 *
 * Provides comprehensive rate limiting for API endpoints to prevent:
 * - Brute force attacks on authentication endpoints
 * - DoS attacks on expensive AI operations
 * - Resource exhaustion from spam requests
 *
 * @security CRITICAL - Protects all API routes from abuse
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

// Default rate limit configs by endpoint type
const RATE_LIMITS = {
  // Authentication endpoints - strict limits to prevent brute force
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },

  // AI endpoints - cost protection
  AI: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'AI request limit exceeded. Please wait before making more requests.',
  },

  // Write operations (POST, PUT, DELETE)
  WRITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 writes per minute
    message: 'Too many write requests. Please slow down.',
  },

  // Read operations (GET)
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 reads per minute
    message: 'Too many requests. Please slow down.',
  },
} as const;

// ============================================================================
// In-Memory Rate Limit Store
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && Date.now() >= entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, value: RateLimitEntry): void {
    this.store.set(key, value);
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const existing = this.get(key);
    if (existing) {
      existing.count++;
      return existing;
    }

    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: Date.now() + windowMs,
    };
    this.set(key, newEntry);
    return newEntry;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global store instance
const store = new InMemoryRateLimitStore();

// ============================================================================
// Rate Limit Helper Functions
// ============================================================================

/**
 * Gets client identifier for rate limiting
 * Prioritizes: IP address > User ID > Generic
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';

  // Could add user ID here if authenticated
  // const userId = req.headers.get('x-user-id');
  // if (userId) return `user:${userId}`;

  return `ip:${ip}`;
}

/**
 * Checks rate limit for a request
 */
function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime: number; remaining: number } {
  const entry = store.increment(identifier, config.windowMs);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    resetTime: entry.resetTime,
    remaining,
  };
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

/**
 * Creates a rate limit middleware for a specific configuration
 *
 * @example
 * ```typescript
 * import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit';
 *
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await rateLimitMiddleware(req, RATE_LIMITS.AUTH);
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Your route logic here
 * }
 * ```
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req);
  const key = `${req.nextUrl.pathname}:${identifier}`;

  const { allowed, resetTime, remaining } = checkRateLimit(key, config);

  // Add rate limit headers to all responses
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: config.message || 'Too many requests',
        retryAfter,
        resetAt: new Date(resetTime).toISOString(),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Rate limit passed - attach headers to the request for the handler to use
  // (Next.js doesn't allow direct header modification, so we'll return null and let the handler add them)
  return null;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Rate limit for authentication endpoints (strict)
 */
export function rateLimitAuth(req: NextRequest) {
  return rateLimitMiddleware(req, RATE_LIMITS.AUTH);
}

/**
 * Rate limit for AI endpoints (cost protection)
 */
export function rateLimitAI(req: NextRequest) {
  return rateLimitMiddleware(req, RATE_LIMITS.AI);
}

/**
 * Rate limit for write operations
 */
export function rateLimitWrite(req: NextRequest) {
  return rateLimitMiddleware(req, RATE_LIMITS.WRITE);
}

/**
 * Rate limit for read operations
 */
export function rateLimitRead(req: NextRequest) {
  return rateLimitMiddleware(req, RATE_LIMITS.READ);
}

/**
 * Smart rate limiter - automatically detects endpoint type
 */
export function rateLimitSmart(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const method = req.method;

  // Auth endpoints
  if (path.includes('/auth/') || path.includes('/login') || path.includes('/register')) {
    return rateLimitAuth(req);
  }

  // AI endpoints
  if (path.includes('/ai/')) {
    return rateLimitAI(req);
  }

  // Write vs Read
  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
    return rateLimitWrite(req);
  }

  return rateLimitRead(req);
}

// ============================================================================
// Export Rate Limit Configs
// ============================================================================

export { RATE_LIMITS, type RateLimitConfig };

// ============================================================================
// Cleanup on process termination
// ============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    store.destroy();
  });

  process.on('SIGTERM', () => {
    store.destroy();
  });
}
