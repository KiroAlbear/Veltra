<div align="center">

# Veltra

### The Clinic Operating System

**Technology disappears. Care remains.**

[Website](https://veltrahealth.co) · [Security](https://veltrahealth.co/security) · [Constitution](https://veltrahealth.co/constitution)

**Brand:** Veltra
**Product:** Veltra — The Clinic Operating System
**Company:** Veltra Technologies
**Domain:** veltrahealth.co

</div>

---

## What is Veltra?

Veltra is the operating system for modern healthcare clinics. It runs the entire clinic — from the first phone call to the final follow-up — as one continuous, intelligent workflow.

**Not an EMR. Not a CRM. Not a billing tool.**
A Clinic Operating System.

## The Three Laws

Every decision in Veltra is governed by three laws:

1. **Remember everything** — Every action creates memory. Every memory becomes context.
2. **Reduce every click** — Three clicks or fewer to any primary action.
3. **Never interrupt care** — A doctor's flow through a patient visit is sacred.

If a feature breaks one of these laws, it is not built.

## Core Pillars

| Pillar | What it means |
|--------|--------------|
| **Today's Brief** | Every morning, Veltra prepares the doctor's day — what matters, what's flagged, what's open. |
| **Clinical Memory** | Every visit, every lab, every voice note — remembered. Nothing important is ever forgotten. |
| **Chief of Staff** | A calm intelligence that surfaces what matters and silences what doesn't. |
| **Workflow Engine** | Appointments, billing, labs, prescriptions, insurance — all flowing through one nervous system. |

## Specialties

Veltra supports 19 specialties out of the box — each with its own vocabulary, patients, conditions, and workflows:

General Practice · Dental · Cardiology · Dermatology · Pediatrics · Orthopedics · Neurology · Cosmetic · Ophthalmology · OBGYN · ENT · Gastroenterology · Hematology · Endocrinology · Pulmonology · Internal Medicine · Oral Surgery · Physiotherapy · Multi-Specialty

## Pricing

| Plan | Price | Best for |
|------|-------|----------|
| **Veltra Platform** | Starting at $999/mo | Clinics (3 locations, 15 users) — Most Popular |
| **Enterprise** | Custom | Healthcare organizations (unlimited) |

**Veltra Launch Program** — Starting at $3,000 (one-time, scoped to clinic size).

**Founding Partner Program** — $699/mo for 3 years + Launch included. Limited to 10 clinics.

Billing options: Monthly · Annual ($9,990, −17%) · 3-Year ($26,000 one-time).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State | Zustand |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Payments | Stripe |
| Email | Resend |
| Realtime | WebSockets (Socket.IO) |
| Deploy | Vercel |
| Security | Cloudflare (WAF, Rate Limiting, DDoS) |

## Compliance

Veltra is built to meet the requirements of:

- **HIPAA** (United States)
- **GDPR** (European Union)
- **NPHIES** (Saudi Arabia)
- **PDPL** (Saudi Arabia)
- **DHA** (Dubai)
- **DOH** (Abu Dhabi)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/veltra.git
cd veltra

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start the development server
bun run dev
```

Visit `http://localhost:3000`

## Demo Access

The demo is gated. Use password: `veltra2030`

Demo users (password for all: `Veltra2026`):

| Role | Email |
|------|-------|
| Doctor | james@veltrahealth.co |
| Doctor | emily@veltrahealth.co |
| Receptionist | sophia@veltrahealth.co |
| Nurse | olivia@veltrahealth.co |
| Admin | admin@veltrahealth.co |

Or type `demo` in the email field for quick access.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (workspace)/        # Authenticated workspace
│   ├── api/                # API route handlers
│   ├── constitution/       # Public constitution page
│   ├── security/           # Public security page
│   ├── signup/             # Subscription checkout
│   └── globals.css         # Design system + tokens
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── veltra/             # Veltra-specific components
├── lib/
│   ├── veltra-store.ts     # Zustand store (state management)
│   ├── specialties.ts      # 19 specialty configurations
│   ├── subscription-tiers.ts # Platform / Enterprise + Founding Partner + Sales Matrix
│   ├── locales.ts          # Localization (11 languages)
│   ├── validations.ts      # Zod schemas for API
│   └── db.ts               # Prisma client
├── hooks/                  # Custom React hooks
└── types/                  # Shared TypeScript types
```

## The Veltra Engineering Constitution

Every line of code in Veltra is governed by [The Engineering Constitution](./VELTRA-CONSTITUTION.md) — a 24-section document covering:

- What Veltra Is (and Is Not)
- Decision Priority (Patient Safety > Clinical Workflow > Simplicity > ...)
- Definition of Done (16-point checklist)
- Security & Compliance (HIPAA / GDPR / NPHIES)
- Data Philosophy (4 Laws of Clinical Memory)
- Database, API, UX, and Brand Voice rules
- Final Principle: *If a feature makes the product more complicated than valuable, reject it.*

## Browser Tab titles

Dynamic page titles follow the pattern: `Screen Name — Veltra`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command Palette (search everything) |
| `1` | Today's Brief |
| `2` | Patients |
| `3` | Appointments |
| `4` | Timeline |
| `5` | Audit Log |
| `6` | Settings |
| `⌘D` | Toggle Dark/Light mode |
| `⌘Z` | Undo last action |

## Languages

- ✅ English (default)
- ✅ العربية (full RTL support)
- 🚧 Español, Français, Deutsch, Italiano, Português, Türkçe, 日本語, 한국어, 中文 (coming per market)

## License

Proprietary. © 2026 Veltra Technologies. All rights reserved.

---

<div align="center">

**Technology disappears. Care remains.**

</div>
