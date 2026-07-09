#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VELTRA — Supabase Setup Script
# Run this after creating your Supabase project.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "🚀 Veltra Supabase Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1) Install Prisma CLI if not installed
if ! command -v prisma &>/dev/null; then
  echo "📦 Installing Prisma CLI..."
  bun add -d prisma
fi

# 2) Generate Prisma Client
echo "🔧 Generating Prisma Client..."
bunx prisma generate

# 3) Push schema to Supabase (creates tables)
echo "🗄️  Pushing schema to Supabase..."
bunx prisma db push

# 4) Seed demo data (optional)
if [ "${1:-}" = "--seed" ]; then
  echo "🌱 Seeding demo data..."
  bunx prisma db seed
fi

echo ""
echo "✅ Supabase setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your real Supabase credentials"
echo "  2. Run: bun run dev"
echo "  3. Test the connection at /api/health"
echo ""
echo "Database URL format:"
echo "  postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
