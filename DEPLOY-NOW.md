# VELTRA — Deploy in 3 Commands

You're 90 seconds from production. Run these commands in your terminal.

---

## ⚡ The 3-Command Deploy

```bash
# 1. Push to GitHub (create a private repo first at github.com/new — name: veltra)
git remote add origin git@github.com:YOUR_USERNAME/veltra.git
git branch -M main
git push -u origin main

# 2. Login to Vercel (one-time)
npm install -g vercel
vercel login

# 3. Deploy to production
vercel --prod --yes
```

That's it. You'll get a URL like `veltra-xxx.vercel.app`.

---

## 🔐 After Deploy: Set Environment Variables

In Vercel dashboard → your project → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your Supabase Postgres URL | ✅ Yes (for production) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` | ✅ Yes |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | ✅ Yes |
| `SUPABASE_URL` | From Supabase dashboard | Optional (Phase 2) |
| `SUPABASE_ANON_KEY` | From Supabase dashboard | Optional (Phase 2) |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard | Optional (Phase 2) |

For the demo to work without a database, no env vars are required — the app uses in-memory + localStorage.

---

## 🌐 Custom Domain (after first deploy)

1. Vercel dashboard → your project → Settings → Domains
2. Add `veltrahealth.co` (or your domain)
3. Update DNS records as Vercel instructs
4. SSL is automatic

---

## ✅ Verify Deploy

```bash
# After deploy, verify these endpoints return 200:
curl -s -o /dev/null -w "%{http_code}" https://YOUR_URL.vercel.app/           # → 200
curl -s -o /dev/null -w "%{http_code}" https://YOUR_URL.vercel.app/signup     # → 200
curl -s -o /dev/null -w "%{http_code}" https://YOUR_URL.vercel.app/api/health # → 200

# Verify security headers:
curl -sI https://YOUR_URL.vercel.app/ | grep -iE "x-frame|x-content|strict-transport"
```

You should see:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000...`

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| `vercel: command not found` | Run `npm install -g vercel` first |
| `No existing credentials` | Run `vercel login` first |
| Build fails on Vercel | Check that `bun` isn't required — switch to npm in vercel.json if needed |
| Blank page on load | Check browser console for CSP errors; verify `NEXTAUTH_URL` matches exactly |
| 404 on /api/* | Make sure `output: "standalone"` is NOT set in next.config.ts |

---

## 📊 What You Get After Deploy

- ✅ 19 pages, all static-rendered
- ✅ 11 API endpoints with Zod validation
- ✅ 6 security headers (X-Frame, CSP, HSTS, etc.)
- ✅ PWA (manifest + service worker)
- ✅ SEO (sitemap, robots, JSON-LD, OG tags)
- ✅ 11-language landing page
- ✅ 100 tested scenarios, 0 critical bugs
- ✅ Apple-grade design (Inter + Instrument Serif, Emerald brand)
- ✅ Sidebar reduced to 5 primary items (radical simplicity)

---

## 🎯 Next: First Customer

After deploy, the goal is **one paying customer**. See `FIRST-CUSTOMER-PLAYBOOK.md`.
