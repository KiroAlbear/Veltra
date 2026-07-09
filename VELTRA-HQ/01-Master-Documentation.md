# VELTRA — Master Documentation
### Version 1.0 · The Operating System of Healthcare

> This is the **single source of truth** for everything Veltra.
> If a question is not answered here, the answer is "not yet decided" — never "guess."
> When this document and any other document disagree, **this document wins.**
>
> _Technology disappears. Care remains._

---

## Table of Contents

1. [What Veltra Is](#1-what-veltra-is)
2. [Mission · Vision · North Star](#2-mission--vision--north-star)
3. [Decision Priority](#3-decision-priority)
4. [The Seven Principles](#4-the-seven-principles)
5. [Banned Words & Phrases](#5-banned-words--phrases)
6. [Brand Voice](#6-brand-voice)
7. [Product Architecture](#7-product-architecture)
8. [Tech Stack](#8-tech-stack)
9. [Pricing Model](#9-pricing-model)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Security & Compliance Posture](#11-security--compliance-posture)
12. [Performance Targets](#12-performance-targets)
13. [Definition of Done](#13-definition-of-done)
14. [Team Operating Principles](#14-team-operating-principles)
15. [Roadmap (Q3 2026 → Q4 2026)](#15-roadmap)
16. [Glossary](#16-glossary)
17. [Document Maintenance](#17-document-maintenance)

---

## 1. What Veltra Is

Veltra is the **Clinic Operating System** — the layer that runs an entire clinic from the first phone call to the final follow-up.

| Veltra IS | Veltra is NOT |
|-----------|---------------|
| A Clinic Operating System | An EMR only |
| A Clinical Memory Layer | A scheduling app |
| A Workflow Engine | A CRM |
| A Chief of Staff for doctors | A billing software |
| A Healthcare Operations Platform | A generic ERP |
| Global by design, multi-specialty by default | A chatbot bolted onto a clinic tool |
| A premium product ($999+/mo) | A "cheap SaaS for small clinics" |

**Veltra does not replace the doctor.** Veltra replaces the seven disconnected systems the doctor's team is forced to use today — and gives them back the time to do medicine.

---

## 2. Mission · Vision · North Star

### Mission
> Run the clinic so the doctor can practice medicine.

### Vision
> Become the operating system of healthcare — the layer every clinic on Earth runs on, the way every modern office runs on Windows or macOS.

### North Star
> Every decision must move Veltra closer to becoming **the operating system of healthcare**.

If a proposed feature, hire, or partnership does not move Veltra closer to that North Star, it does not ship.

### The Promise (used once, only in the final CTA, login, and error pages)
> _Technology disappears. Care remains._

---

## 3. Decision Priority

When there is a trade-off — and there is always a trade-off — prioritize in this exact order:

| # | Priority | Example |
|---|----------|---------|
| 1 | **Patient Safety** | A medication interaction warning must surface before a billing shortcut. |
| 2 | **Clinical Workflow** | A doctor's flow through a patient visit is sacred. Don't interrupt it. |
| 3 | **Simplicity** | Fewer screens. Fewer fields. Fewer clicks. Fewer concepts. |
| 4 | **Reliability** | The system must work the same way at 2 AM as at 2 PM. |
| 5 | **Performance** | Fast is a feature, but never at the cost of safety or correctness. |
| 6 | **Developer Experience** | Code must be readable by the next engineer who touches it. |
| 7 | **Visual Design** | Beauty matters, but it serves the experience — never the other way around. |

**Never sacrifice a higher priority for a lower one.**

- A beautiful animation that delays a clinical decision is **rejected**.
- A clever abstraction that hides patient risk is **rejected**.
- A fast shortcut that bypasses audit is **rejected**.

---

## 4. The Seven Principles

### Principle 1 — Memory is sacred
Every visit, every lab, every voice note, every missed appointment becomes part of a pattern. Veltra sees the pattern before the doctor does. Nothing important is ever forgotten.

### Principle 2 — Calm over clever
A clinic at 9 AM Monday is chaos. Veltra's job is to make it feel calm. If a notification, animation, or feature adds noise, it gets removed — no matter how clever it is.

### Principle 3 — Show, don't tell
The landing page shows the product in the first 2 seconds. The Today's Brief shows the morning before the doctor reads it. Marketing copy sells outcomes, not features.

### Principle 4 — Privacy is the default, not a setting
Patient data is encrypted at rest. Every access is logged. Every tenant is isolated. These are not features — they are the floor.

### Principle 5 — The doctor is the user, not the patient
Veltra is built for the clinic team. Patient-facing surfaces (intake forms, voice notes) are secondary. If a design decision forces a choice, the doctor wins.

### Principle 6 — Fewer surfaces, deeper ones
Apple ships 4 iPhone models, not 40. Veltra ships 2 pricing tiers, not 5. Two fonts, not four. The discipline of "fewer but deeper" is the brand.

### Principle 7 — The product is the brand
No ad campaign can fix a bad product. No amount of marketing copy can replace a doctor who loves using Veltra. The product comes first, always.

---

## 5. Banned Words & Phrases

These words are **banned from every surface** — UI, marketing, docs, emails, sales decks:

| Word | Why | Say instead |
|------|-----|-------------|
| AI / artificial intelligence | Overused, meaningless, scares doctors | "system", "memory", "intelligence" (when necessary) |
| smart, intelligent | Lazy marketing | describe what it actually does |
| seamless | Meaningless | "connected", "integrated" |
| leverage | Corporate jargon | "use" |
| automagically | Cute, not professional | "automatically" |
| next-gen, revolutionary, game-changing, cutting-edge | Hype | describe the specific improvement |
| innovative, disruptive, synergy | Buzzwords | describe the actual change |
| world-class, best-in-class | Self-praise | let the customer say it |
| robust, scalable | Empty | describe the specific capability |
| solution | Vague | name the thing |
| empower | Patronizing | "let", "allow" |
| streamline | Overused | "simplify", "remove steps" |
| unlock | Marketing cliché | "enable", "allow" |

**Rule:** If a sentence reads the same with the word removed, remove the word.

### The "AI" rule (critical)
The word "AI" must never appear on any **product surface** — UI, marketing site, sales deck, customer email. Inside internal engineering docs, "AI" is acceptable when referring to the actual model architecture (LLM, RAG, embedding). The Constitution explicitly bans it; this rule is enforced by grep in CI.

---

## 6. Brand Voice

### The voice in one sentence
> We sound like the calmest person in the room — the chief of staff who has seen everything and never raises their voice.

### Voice attributes

| We are | We are not |
|--------|------------|
| Calm | Excited |
| Precise | Vague |
| Confident | Arrogant |
| Warm | Cute |
| Direct | Cold |
| Human | Corporate |
| Specific | Generic |
| Quiet | Loud |

### Sentence rules
- Short sentences. Especially in UI.
- One idea per sentence. Two is a paragraph; three is a meeting.
- Active voice. "Veltra remembers" — not "It is remembered by Veltra."
- Concrete numbers. "$18,000 recovered" — not "significant revenue recovered."
- No exclamation marks in product copy. Ever. (Except in chat agents, sparingly.)
- Periods, not ellipses, in UI. Ellipses feel uncertain.
- Oxford comma: yes, always.

### The tagline rule
The phrase _"Technology disappears. Care remains."_ appears in exactly three places:
1. The final CTA on the landing page
2. The login screen (small, italic, under the form)
3. Error pages (404, 500, generic)

It does **not** appear in:
- The navbar
- The footer (except as the brand voice, never as a tagline)
- Marketing emails
- Sales decks
- The dashboard

This scarcity is what makes it land.

---

## 7. Product Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VELTRA PLATFORM                       │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Today's     │  │ Clinical    │  │ Workflow    │          │
│  │ Brief       │  │ Memory      │  │ Engine      │          │
│  │ (morning)   │  │ (timeline)  │  │ (automation)│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            THE 17 WORKSPACE SCREENS                 │    │
│  │  Brief · Patients · Appointments · Calendar ·       │    │
│  │  Timeline · Labs · Billing · Reports · Insurance ·   │    │
│  │  Messages · Documents · Inventory · Availability ·   │    │
│  │  Recurring · Intake · Audit · Settings               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Reception   │  │ Chief of    │  │ Voice       │          │
│  │ (24/7)      │  │ Staff (Dr.B)│  │ Notes       │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
   │ Multi-  │   │ Audit     │  │ Tenant  │
   │ tenant  │   │ Log       │  │ Isolation│
   │ (RLS)   │   │ (7-year)  │  │ (HIPAA) │
   └─────────┘   └───────────┘  └─────────┘
```

### The four product layers

1. **Today's Brief** — the morning view. The doctor's first 30 seconds of the day.
2. **Clinical Memory** — the timeline. Every patient, every event, remembered forever.
3. **Workflow Engine** — appointments, billing, labs, prescriptions, insurance, inventory.
4. **Chief of Staff** — proactive intelligence that surfaces what matters and silences what doesn't.

### The 17 workspace screens
Brief · Patients · Appointments · Calendar · Timeline · Labs · Billing · Reports · Insurance · Messages · Documents · Inventory · Availability · Recurring · Intake · Audit · Settings

(Plus Network Memory on Enterprise tier = 18 screens.)

---

## 8. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Best-in-class React framework, Vercel-native |
| Language | TypeScript (strict) | Type safety = patient safety |
| Styling | Tailwind CSS v4 | Atomic, fast, no CSS naming debates |
| Components | shadcn/ui | Owned, not vendored — full control |
| State | Zustand (persisted) | Simpler than Redux, more predictable than Context |
| Database | PostgreSQL (Supabase) | Battle-tested, RLS for HIPAA-grade isolation |
| ORM | Prisma | Type-safe queries, migrations, schema as source of truth |
| Auth | NextAuth.js | Industry standard, httpOnly cookies, JWT rotation |
| Payments | Stripe | The only serious option for SaaS billing |
| Email | Resend | Developer-first, clean API, good deliverability |
| WhatsApp / SMS | Twilio | WhatsApp Business API + SMS in one SDK |
| Voice | Whisper API (future) | Transcription for patient voice notes |
| Hosting | Vercel (frontend + API) | Edge network, automatic HTTPS, instant deploys |
| Database hosting | Supabase (managed Postgres) | Free tier, pooling, RLS, real-time, storage |
| DNS / CDN | Cloudflare (future) | WAF, rate limiting, DDoS protection |
| Monitoring | Vercel Analytics + Sentry (future) | Real user metrics + error tracking |

### The "two fonts only" rule
Veltra uses exactly two typefaces:
1. **Inter** — body, UI, all sans-serif text
2. **Instrument Serif** — editorial italic accents only (headlines, tagline)

No third font. No icon-font. No variable-font experiments. This rule is enforced by the constitution.

---

## 9. Pricing Model

### Public pricing (website)

| Plan | Price | Best for |
|------|-------|----------|
| **Veltra Platform** | From $999/month | Clinics (3 locations, 15 users) |
| **Enterprise** | Custom | Healthcare organizations (unlimited) |

**Veltra Launch Program** — From $3,000 (one-time, scoped to clinic size).

Billing options: Monthly · Annual ($9,990, −17%).

### Founding Partner Program (private — sales-only)
- $699/month for 3 years (not lifetime)
- Launch Program included ($3,000 value)
- 30-day money-back guarantee
- Annual commitment required
- Limited to 10 clinics
- Founding Partner badge + referral rewards

### Internal Sales Matrix (not public)

| Tier | Doctors | Monthly | Launch |
|------|---------|---------|--------|
| Foundation | 1–3 | $999 | From $3,000 |
| Growth | 4–15 | $1,499 | From $5,000 |
| Multi-Site | 2+ branches | $2,499 | From $7,500 |
| Enterprise | Hospitals | Custom | From $10,000+ |

### Pricing philosophy
- The price is part of the brand identity. Offers change, not the price.
- $999 is the floor. Anything cheaper breaks the positioning.
- The Launch Program is **not** a setup fee. It is a clinic transformation. The copy reflects that.
- Sales qualifies the customer first (ROI-based), then prices. We reject leads that aren't ROI-positive.

---

## 10. Go-to-Market Strategy

### Year 1 markets (in order)
1. 🇦🇪 UAE
2. 🇸🇦 Saudi Arabia
3. 🇶🇦 Qatar
4. 🇰🇼 Kuwait

### Year 2 markets
5. 🇪🇬 Egypt (when we have case studies)
6. 🇧🇭 Bahrain
7. 🇴🇲 Oman

### Year 3+ markets
8. 🇬🇧 UK (if Dr. Balu succeeds)
9. 🇺🇸 US (last — highest CAC)

### Ideal customer (Year 1)
- Polyclinic or medical center with 3–15 doctors
- 1,000+ patient visits/month
- Spending on reception staff, WhatsApp, marketing
- Established (2+ years operating)
- Willing to be a case study

### Reject these customers (Year 1)
- Solo doctor with one receptionist
- Clinic with 5 patients/day
- "Let's try it cheap" leads
- Leads that demand a discount before demo

---

## 11. Security & Compliance Posture

### Compliance frameworks
| Framework | Region | Status |
|-----------|--------|--------|
| HIPAA | USA | Architecture-ready |
| GDPR | EU | Architecture-ready |
| NPHIES | Saudi Arabia | Architecture-ready |
| PDPL | Saudi Arabia | Architecture-ready |
| DHA | UAE | Architecture-ready |
| DOH | UAE | Architecture-ready |

### The Twelve Security Rules
1. **Least privilege** — every user, service, token gets the minimum access required.
2. **Server-side validation** — never trust the client. Every mutation validated server-side.
3. **Audit logging** — every PHI access, mutation, login is logged with `userId, action, target, timestamp, before, after`.
4. **Role-based permissions** — enforced server-side, not just hidden in the UI.
5. **Encryption at rest** — AES-256 for databases, object storage, backups.
6. **Encryption in transit** — TLS 1.3 everywhere. No HTTP except localhost.
7. **No secrets in client bundles** — env vars are server-only. `NEXT_PUBLIC_*` forbidden for anything sensitive.
8. **No client-side trust** — UI hiding a button does not remove the user's permission. The API still checks.
9. **Token rotation** — access tokens expire in 15 minutes. Refresh tokens rotate on use.
10. **PHI minimization in logs** — never log a full patient name, full phone, or full medical record. Mask: `Ahmed H. +966 ••• ••• 4567`.
11. **Breach readiness** — every breach path has an alert. Every alert has an on-call owner.
12. **Right to erasure** — any patient can request deletion. Hard-delete with audit trail of the deletion itself.

### Security headers (enforced in `next.config.ts` + `vercel.json`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`

---

## 12. Performance Targets

### Landing page (public)
- LCP: < 1.5s on 4G
- TTI: < 2.5s
- CLS: 0
- Bundle size: < 250 KB gzipped (initial)
- Lighthouse score: 95+ on all four metrics

### Workspace (authenticated app)
- First paint: < 800ms
- Screen transitions: < 200ms perceived
- Patient timeline load: < 500ms for 1,000 events
- Search results: < 100ms (debounced 150ms)

### Forbidden
- Spinners that last > 800ms without a skeleton.
- Layout shift on data load.
- Blocking the main thread for > 50ms.

---

## 13. Definition of Done

A feature is "done" when **all** of these are true:

- [ ] Code is written, reviewed, and merged.
- [ ] TypeScript strict mode passes (zero errors).
- [ ] ESLint passes (zero errors, zero warnings).
- [ ] All screens have empty, loading, error, and success states.
- [ ] Mobile + tablet + desktop tested.
- [ ] Dark + light mode tested.
- [ ] Keyboard accessible (Tab order, Enter/Space, Esc to close).
- [ ] Screen reader tested (VoiceOver or NVDA).
- [ ] Audit log entry added for every mutation.
- [ ] No PHI in console logs, error messages, or URLs.
- [ ] Copy is reviewed (no banned words, follows voice rules).
- [ ] Performance budget met (LCP < 1.5s, no layout shift).
- [ ] Documented in this Master Doc if it changes architecture.

If any box is unchecked, the feature is not done. It does not ship.

---

## 14. Team Operating Principles

### How we ship
1. **Small PRs.** A PR that touches > 400 lines is rejected unless explicitly justified.
2. **Atomic commits.** One commit = one logical change. "Fix typo" and "Refactor auth" are not the same commit.
3. **Ship daily.** A feature that takes 2 weeks to ship is too big. Break it.
4. **Revert is not failure.** A bad ship is worse than no ship. Revert fast, fix, reship.

### How we decide
1. **Decide once.** Re-deciding the same thing wastes the team's energy. Write the decision down.
2. **Disagree and commit.** After a decision is made, the team commits — even those who disagreed.
3. **Default to "no."** Every new feature must earn its place. "Why not?" is not a reason to ship.
4. **Boring is good.** We use boring, proven technology. Innovation goes into the product, not the stack.

### How we communicate
1. **Written first.** If it isn't written, it didn't happen. Decisions live in docs, not Slack.
2. **Async by default.** Sync meetings are expensive. Use them sparingly.
3. **Direct over diplomatic.** Say what you mean. The team trusts each other to handle the truth.
4. **Customer voice > internal opinion.** A single user interview beats ten internal debates.

---

## 15. Roadmap

### Q3 2026 (current)
- ✅ Landing page v1.0 (Apple-grade)
- ✅ Pricing model signed off (Platform $999 + Enterprise + Founding Partner)
- ✅ Security audit (6 headers, CSP, strict TS, RLS-ready schema)
- ✅ Demo flow (no password gate — direct interactive demo)
- 🔄 First 10 Founding Partner outreach (UAE + KSA)
- 🔄 Dr. Balu (London/Dubai) — first paying customer target

### Q4 2026
- ⬜ Supabase production database live
- ⬜ Stripe checkout integration (real payments)
- ⬜ Resend email integration (real reminders)
- ⬜ Twilio WhatsApp integration (real messaging)
- ⬜ First 3 paying Founding Partners
- ⬜ Case study #1 published

### Q1 2027
- ⬜ Mobile PWA install verified on iOS + Android
- ⬜ Arabic RTL full audit
- ⬜ NPHIES integration (Saudi insurance claims)
- ⬜ 10 paying customers
- ⬜ Seed round exploration

### Q2 2027
- ⬜ Multi-site analytics dashboard
- ⬜ Network Memory (collective intelligence) beta
- ⬜ 25 paying customers
- ⬜ Series A preparation

### Year 2 (2027)
- ⬜ 100 paying clinics
- ⬜ $100k MRR
- ⬜ UK market entry
- ⬜ First hire (engineer #1)

### Year 3 (2028)
- ⬜ 500 paying clinics
- ⬜ $500k MRR
- ⬜ US market entry
- ⬜ Series A close

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Brief** | The doctor's morning view. Today's patients, flagged items, recovered revenue. |
| **Timeline** | A patient's complete history in chronological order. |
| **Clinical Memory** | The system that remembers every event, every pattern, across every patient. |
| **Chief of Staff** | The proactive layer that surfaces what matters (formerly "Dr. B"). |
| **Launch Program** | The paid implementation service ($3,000+). Not a setup fee — a clinic transformation. |
| **Founding Partner** | A private offer for the first 10 clinics. $699/mo for 3 years + Launch included. |
| **PHI** | Protected Health Information. Any data that identifies a patient + their health. |
| **Tenant** | A clinic. The unit of data isolation. |
| **Tier** | The subscription level. PLATFORM or ENTERPRISE. |
| **Tenant isolation** | The guarantee that Clinic A can never see Clinic B's data. Enforced by RLS. |
| **RLS** | Row-Level Security. Postgres feature that enforces tenant isolation at the database layer. |
| **The tagline** | _"Technology disappears. Care remains."_ Used in exactly 3 places (see §6). |

---

## 17. Document Maintenance

### Ownership
- This document is owned by the **CEO**.
- Any change requires CEO approval.
- The Constitution (`VELTRA-CONSTITUTION.md`) is the engineering-specific supplement. When the two disagree on engineering matters, the Constitution wins. When they disagree on product/brand/strategy, this Master Doc wins.

### Review cadence
- **Quarterly review** — full read-through by leadership.
- **After every major release** — update the Roadmap section.
- **After every customer interview** — update the Glossary if new terms emerge.

### Version history
| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-07-08 | Veltra Technologies | Initial master doc. Extracted from Constitution v1.0 + Q3 2026 decisions. |

---

_This document ends here. There is no closing tagline, no "thank you for reading," no call-to-action. The work begins._
