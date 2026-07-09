#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VELTRA — One-Command Deploy Script
#
# Usage:
#   ./scripts/deploy.sh
#
# This will:
#   1. Login to Vercel (if not already)
#   2. Deploy to production
#   3. Print the live URL
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "🚀 Veltra Production Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1) Verify build passes
echo "📦 Verifying production build..."
bun run build 2>&1 | tail -3

# 2) Check if logged in to Vercel
if ! vercel whoami &>/dev/null; then
  echo ""
  echo "🔐 Not logged in to Vercel. Opening login..."
  vercel login
fi

# 3) Deploy to production
echo ""
echo "🌐 Deploying to Vercel production..."
DEPLOY_URL=$(vercel --prod --yes 2>&1 | grep -oE "https://[a-z0-9-]+\.vercel\.app" | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Deploy failed. Check output above."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployed successfully!"
echo ""
echo "🌐 Live URL: $DEPLOY_URL"
echo ""

# 4) Verify endpoints
echo "🔍 Verifying endpoints..."
for endpoint in "/" "/signup" "/security" "/api/health" "/robots.txt"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL$endpoint")
  printf "   %-20s HTTP %s\n" "$endpoint" "$STATUS"
done

# 5) Verify security headers
echo ""
echo "🔒 Security headers:"
curl -sI "$DEPLOY_URL" | grep -iE "x-frame|x-content|strict-transport|content-security" | sed 's/^/   /'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Add custom domain (veltrahealth.co)"
echo "  3. Set up Supabase (see DEPLOYMENT.md)"
echo ""
echo "Docs: ./DEPLOYMENT.md"
