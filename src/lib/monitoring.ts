/**
 * VELTRA — Error Tracking & Monitoring
 *
 * Wraps Sentry for production error tracking.
 * In development: logs to console.
 * In production: sends to Sentry (requires SENTRY_DSN env var + @sentry/nextjs installed).
 *
 * Setup:
 *   1. npm install @sentry/nextjs
 *   2. Create account at sentry.io
 *   3. Get SENTRY_DSN from project settings
 *   4. Add to .env: SENTRY_DSN=https://xxx@sentry.io/xxx
 *   5. Errors will automatically be captured
 */

import { dataAccess } from "./data-access";

type ErrorContext = Record<string, string | number | boolean | undefined>;

class ErrorTracker {
  private sentryDsn: string | undefined;
  private initialized = false;

  constructor() {
    this.sentryDsn = process.env.SENTRY_DSN;
  }

  /**
   * Initialize Sentry (lazy load — only if DSN is configured and package installed).
   */
  async init(): Promise<void> {
    if (this.initialized || !this.sentryDsn) return;

    try {
      // Dynamic import — fails silently if @sentry/nextjs not installed
// @ts-expect-error — optional dependency, loaded dynamically
      const Sentry = await import(/* webpackIgnore: true */ "@sentry/nextjs").catch(() => null);
      if (!Sentry || typeof Sentry.init !== "function") return;

      Sentry.init({
        dsn: this.sentryDsn,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.05,
        replaysOnErrorSampleRate: 1.0,
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version,
      });

      this.initialized = true;
    } catch (error) {
      console.error("[Veltra] Failed to initialize Sentry:", error);
    }
  }

  /**
   * Capture an error and send to monitoring.
   */
  captureError(error: Error | unknown, context?: ErrorContext): void {
    console.error("[Veltra Error]", error, context);

    if (this.initialized) {
// @ts-expect-error — optional dependency, loaded dynamically
      import(/* webpackIgnore: true */ "@sentry/nextjs").catch(() => null).then((Sentry) => {
        if (Sentry && typeof Sentry.captureException === "function") {
          Sentry.captureException(error, { extra: context });
        }
      });
    }
  }

  /**
   * Capture a message (non-error event).
   */
  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
    console.log(`[Veltra ${level.toUpperCase()}]`, message);

    if (this.initialized) {
// @ts-expect-error — optional dependency, loaded dynamically
      import(/* webpackIgnore: true */ "@sentry/nextjs").catch(() => null).then((Sentry) => {
        if (Sentry && typeof Sentry.captureMessage === "function") {
          Sentry.captureMessage(message, level);
        }
      });
    }
  }

  /**
   * Set user context for error tracking (PII-safe — only ID and role, not email).
   */
  setUser(userId: string, role: string): void {
    if (this.initialized) {
// @ts-expect-error — optional dependency, loaded dynamically
      import(/* webpackIgnore: true */ "@sentry/nextjs").catch(() => null).then((Sentry) => {
        if (Sentry && typeof Sentry.setUser === "function") {
          Sentry.setUser({ id: userId, role });
        }
      });
    }
  }

  /**
   * Clear user context on logout.
   */
  clearUser(): void {
    if (this.initialized) {
// @ts-expect-error — optional dependency, loaded dynamically
      import(/* webpackIgnore: true */ "@sentry/nextjs").catch(() => null).then((Sentry) => {
        if (Sentry && typeof Sentry.setUser === "function") {
          Sentry.setUser(null);
        }
      });
    }
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Health check endpoint helper.
 * Returns system status for monitoring.
 */
export async function getSystemHealth(): Promise<{
  status: "ok" | "degraded" | "down";
  services: Record<string, "ok" | "down">;
  timestamp: string;
  version: string;
}> {
  const services: Record<string, "ok" | "down"> = {
    api: "ok",
    database: "down",
    auth: "ok",
  };

  // Check database
  try {
    const dbOk = await dataAccess.healthCheck();
    services.database = dbOk ? "ok" : "down";
  } catch {
    services.database = "down";
  }

  const allOk = Object.values(services).every((s) => s === "ok");
  const someOk = Object.values(services).some((s) => s === "ok");

  return {
    status: allOk ? "ok" : someOk ? "degraded" : "down",
    services,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.3.0",
  };
}

// Initialize on module load (in production)
if (process.env.NODE_ENV === "production") {
  errorTracker.init();
}
