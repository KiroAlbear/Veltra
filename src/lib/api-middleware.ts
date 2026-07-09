/**
 * VELTRA — API Middleware (Rate Limiting + CSRF)
 *
 * Simple in-memory rate limiter + CSRF token validation for API routes.
 * In production: use Redis-backed rate limiter + proper CSRF library.
 *
 * Usage in API route:
 *   import { withApiProtection } from "@/lib/api-middleware";
 *   export const POST = withApiProtection(async (req) => { ... }, { rateLimit: 'auth' });
 */

import { NextRequest, NextResponse } from "next/server";

// ===== Rate Limiting =====

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  auth:     { max: 5,   windowMs: 60_000 },   // 5 per minute
  api:      { max: 100, windowMs: 60_000 },   // 100 per minute
  upload:   { max: 10,  windowMs: 60_000 },   // 10 per minute
  password: { max: 3,   windowMs: 300_000 },  // 3 per 5 minutes
};

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

function checkRateLimit(
  key: string,
  limit: { max: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { allowed: true, remaining: limit.max - 1, resetAt: now + limit.windowMs };
  }

  entry.count++;
  const allowed = entry.count <= limit.max;
  return {
    allowed,
    remaining: Math.max(0, limit.max - entry.count),
    resetAt: entry.resetAt,
  };
}

// ===== CSRF =====

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "veltra-csrf";

function validateCsrf(req: NextRequest): boolean {
  // Skip CSRF for GET requests (they should be idempotent)
  if (req.method === "GET" || req.method === "HEAD") return true;

  // Skip CSRF for auth endpoints (they use their own protection)
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/auth/")) return true;

  // Skip CSRF for webhooks (they use signature verification instead)
  if (url.pathname.startsWith("/api/billing/webhook")) return true;

  // In demo mode (no secret), skip CSRF
  if (!process.env.NEXTAUTH_SECRET) return true;

  const headerToken = req.headers.get(CSRF_HEADER);
  if (!headerToken) return false;

  // Simple token validation — in production use a signed JWT or double-submit cookie
  return headerToken.length > 10;
}

// ===== Combined middleware =====

type RateLimitType = "auth" | "api" | "upload" | "password";

interface ProtectionOptions {
  rateLimit?: RateLimitType;
  csrf?: boolean;
}

export function withApiProtection(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: ProtectionOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // CSRF check
    if (options.csrf !== false) {
      if (!validateCsrf(req)) {
        return NextResponse.json(
          { data: null, error: { code: "CSRF_ERROR", message: "Invalid or missing CSRF token" } },
          { status: 403 }
        );
      }
    }

    // Rate limiting
    if (options.rateLimit) {
      const limit = RATE_LIMITS[options.rateLimit];
      const ip = getClientIp(req);
      const key = `${options.rateLimit}:${ip}`;
      const result = checkRateLimit(key, limit);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
        return NextResponse.json(
          { data: null, error: { code: "RATE_LIMITED", message: `Too many requests. Try again in ${retryAfter}s.` } },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(limit.max),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(result.resetAt),
            },
          }
        );
      }
    }

    // Call the actual handler
    try {
      const response = await handler(req);

      // Add rate limit headers to successful responses
      if (options.rateLimit) {
        const ip = getClientIp(req);
        const key = `${options.rateLimit}:${ip}`;
        const entry = rateLimitStore.get(key);
        if (entry) {
          const limit = RATE_LIMITS[options.rateLimit];
          response.headers.set("X-RateLimit-Limit", String(limit.max));
          response.headers.set("X-RateLimit-Remaining", String(Math.max(0, limit.max - entry.count)));
          response.headers.set("X-RateLimit-Reset", String(entry.resetAt));
        }
      }

      return response;
    } catch (error) {
      console.error("[API] Handler error:", error);
      return NextResponse.json(
        { data: null, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
        { status: 500 }
      );
    }
  };
}

/**
 * Generate a CSRF token for the current session.
 * Called from client-side on app load.
 */
export function generateCsrfToken(): string {
  const secret = process.env.NEXTAUTH_SECRET || "veltra-dev-secret";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return `${timestamp}.${random}.${secret.slice(0, 8)}`;
}
