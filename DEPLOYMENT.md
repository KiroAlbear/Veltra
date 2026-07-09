# VELTRA — Deployment Guide

Complete guide to deploy Veltra to production: GitHub → Vercel → Supabase.

---

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- Bun installed locally

---

## Step 1 — Push to GitHub

```bash
# Create a new repo on GitHub: https://github.com/new
# Name: veltra
# Private (recommended — healthcare data)

# Then push:
git remote add origin git@github.com:YOUR_USERNAME/veltra.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy to Vercel

### Option A: Dashboard (recommended — automatic deploys)

1. Go to https://vercel.com/new
2. Import the `veltra` repo from GitHub
3. Framework: Next.js (auto-detected)
4. Build command: `bun run build`
5. Install command: `bun install`
6. Click **Deploy**
7. Get your URL: `veltra-xxx.vercel.app`

### Option B: CLI (one-time deploy)

```bash
# Install Vercel CLI
bun add -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
#   - Set up and deploy: Y
#   - Project name: veltra
#   - Directory: ./
#   - Settings: default (vercel.json handles it)
```

---

## Step 3 — Set Up Supabase

1. Go to https://app.supabase.com/new
2. Project name: `veltra-prod`
3. Database password: generate a strong one (save it!)
4. Region: Singapore (closest to Vercel sin1)
5. Click **Create new project**
6. Wait ~2 minutes for provisioning

### Get connection strings

1. Project Settings → Database
2. Copy:
   - **Connection string (pooling)** → `DATABASE_URL`
   - **Connection string (direct)** → `DIRECT_URL`

Format:
```
postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].supabase.com:5432/postgres
```

### Push schema to Supabase

```bash
# Set DATABASE_URL in .env.local
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run setup script
./scripts/setup-supabase.sh

# Or manually:
bunx prisma generate
bunx prisma db push
```

---

## Step 4 — Set Environment Variables in Vercel

Go to: Vercel project → Settings → Environment Variables

Add these (all from `.env.example`):

| Variable | Source | Required for demo |
|---|---|---|
| `DATABASE_URL` | Supabase | No (demo uses localStorage) |
| `DIRECT_URL` | Supabase | No |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | No |
| `NEXTAUTH_URL` | Your Vercel URL | No |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook | No |
| `RESEND_API_KEY` | Resend | No |
| `TWILIO_ACCOUNT_SID` | Twilio | No |
| `TWILIO_AUTH_TOKEN` | Twilio | No |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | Yes |

**For the demo deploy, only `NEXT_PUBLIC_APP_URL` is required.**

---

## Step 5 — Custom Domain (optional)

1. Vercel project → Settings → Domains
2. Add `veltrahealth.co`
3. Add DNS records at your registrar:
   - `A` record → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
4. Wait for SSL certificate (~5 minutes)

---

## Step 6 — Verify Deployment

Check these endpoints after deploy:

```bash
# Replace YOUR_URL with your Vercel URL
YOUR_URL="https://veltra-xxx.vercel.app"

curl -sI $YOUR_URL | grep -i "x-frame\|strict-transport\|content-security"
# Should show: X-Frame-Options: DENY, HSTS, CSP

curl -s $YOUR_URL/api/health
# Should return: {"status":"ok","version":"1.0.0",...}

curl -sI $YOUR_URL/signup | head -1
# Should return: HTTP/2 200
```

---

## Demo Credentials (for testing)

After deploy, test with these:

### Demo Gate (was used, now removed)
- Demo password: `veltra2030` (no longer required in product flow)

### Login Screen
| Email | Role |
|---|---|
| `james@veltrahealth.co` | Senior Physician |
| `emily@veltrahealth.co` | Cardiologist |
| `sophia@veltrahealth.co` | Reception Lead |
| `olivia@veltrahealth.co` | Head Nurse |
| `admin@veltrahealth.co` | Administrator |

Password for all: `Veltra2026`

Or type `demo` in the email field for instant login.

---

## Production Checklist

- [ ] GitHub repo created and pushed
- [ ] Vercel project deployed
- [ ] Custom domain configured (optional)
- [ ] Supabase project created
- [ ] Prisma schema pushed (`bunx prisma db push`)
- [ ] Environment variables set in Vercel
- [ ] All endpoints return HTTP 200
- [ ] Security headers verified
- [ ] Stripe webhook endpoint configured (when ready for payments)
- [ ] Resend sender domain verified (when ready for emails)

---

## Troubleshooting

### Build fails on Vercel
```bash
# Check build locally with strict TS
bun run build
```

### Prisma client not generated
```bash
bunx prisma generate
```

### Database connection failed
- Verify `DATABASE_URL` format
- Check Supabase project is not paused
- Test with: `bunx prisma studio`

### 404 on /api/health
- Check Vercel function logs
- Verify `output: "standalone"` in next.config.ts

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Vercel (Frontend + API)                │
│                                                              │
│  Next.js 16 App Router                                       │
│  ├── / (landing page — public)                              │
│  ├── /signup (3-step checkout)                              │
│  ├── /security, /constitution                               │
│  └── /api/* (11 endpoints)                                   │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│                                                              │
│  18 models: Tenant, User, Patient, Appointment, etc.         │
│  Multi-tenant with Row-Level Security                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

External Services:
  • Stripe (payments)
  • Resend (email)
  • Twilio (WhatsApp + SMS)
```

---

## Cost Estimate (Free Tiers)

| Service | Free Tier | Paid When |
|---|---|---|
| Vercel | 100 GB bandwidth | >100 GB/mo |
| Supabase | 500 MB DB, 50k MAU | >500 MB or >50k users |
| GitHub | Private repos free | Advanced features |
| Stripe | 2.9% + 30¢ per transaction | — |
| Resend | 3k emails/mo | >3k emails |
| Twilio | Pay per message | — |

**Monthly cost at 10 clinics**: ~$50-100 (Supabase Pro + Vercel Pro)
