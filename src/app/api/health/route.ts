import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Public health check endpoint — no auth required.
 * Monitored by deployment platform.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    time: new Date().toISOString(),
    service: "veltra-api",
  });
}
