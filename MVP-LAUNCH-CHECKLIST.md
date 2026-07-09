# VELTRA — MVP Launch Checklist

**Goal:** First paying customer (Dr. Balu) can use VELTRA in production with real patients.

**Rule:** No item is "done" until it's tested in production with real data.

---

## ✅ DONE — Foundation (24 items)

### RBAC & Permissions
- [x] 10 roles: admin, doctor, receptionist, nurse, pharmacist, lab_tech, radiologist, finance, it_support, operations
- [x] 25+ granular permission flags (canPrescribe, canDispense, canAdjustInventory, canManageBilling, etc.)
- [x] Permission-based UI gating (not role=== checks)
- [x] Audit log role-filtered (IT sees system only, doctor sees clinical only, etc.)
- [x] Inventory adjust gated by canAdjustInventory permission

### UX Foundation
- [x] Sidebar — 5 primary items only (Brief, Patients, Schedule, Messages, Settings)
- [x] TopBar — sticky, with page title + date + search + notifications
- [x] Command Palette (⌘K) — navigation + 10 executable actions
- [x] Notification Center — 420px right side sheet, 6 categories, action buttons
- [x] Keyboard shortcuts — 1-5 primary, letters secondary, ⌘K, ⌘D, N, F
- [x] Mobile responsive — all 19 pages work on phone
- [x] Dark mode — WCAG AA compliant
- [x] Print layout — logo + clinic + doctor + stamp + notes + signature

### Clinical Core
- [x] Today's Brief — proactive morning intelligence
- [x] Clinic Intelligence — 6 computed alert types (no-show, inventory, claims, critical labs, revenue, overdue follow-up)
- [x] Patient timeline — every event in order
- [x] Appointments — full lifecycle (book/confirm/check-in/complete/cancel)
- [x] Calendar — month view
- [x] Recurring appointments
- [x] Doctor availability
- [x] Prescriptions — write + drug interaction check (10 rules)
- [x] Allergy warnings — blocks prescription if conflict
- [x] Lab orders + results
- [x] Vitals recording (BP, HR, temp, glucose, SpO2, weight)
- [x] Voice notes (mock recording)
- [x] Patient messages — WhatsApp-style individual chats
- [x] Documents

### Intelligence
- [x] Health Score — computed per patient (vitals + labs + conditions + adherence + recency)
- [x] Health Score breakdown — 5 factors, each explainable
- [x] Patient Flags — 5 categories (attendance, medication, communication, clinical, financial)
- [x] Care Quality metrics — Trust Engine (8 metrics, NOT ratings)
- [x] Smart Import Center — upload + simulated OCR/AI pipeline + review + commit

### Business
- [x] Billing — invoices, payments, balances
- [x] Insurance claims — 4 providers, full lifecycle
- [x] Inventory — stock, low-stock alerts, permission-gated dispense
- [x] Reports — revenue, visits, satisfaction
- [x] Audit log — categorized, role-filtered, 16 seeded events

### Platform
- [x] Next.js 16 + TypeScript + Tailwind v4
- [x] PWA (manifest + service worker)
- [x] SEO (sitemap, robots, OG, JSON-LD)
- [x] 11-language landing page
- [x] Security headers (6)
- [x] i18n architecture

---

## 🔴 BLOCKING — Must Do Before Launch (17 items)

### Backend (Critical)
- [ ] **Real database** — PostgreSQL + Prisma migrations (replace in-memory Zustand)
  - Effort: 1 week
  - Blocker: Can't persist anything beyond session
- [ ] **Real authentication** — JWT + password hashing + MFA option
  - Effort: 1-2 weeks
  - Blocker: Currently password is "Veltra2026" for everyone
- [ ] **Real audit log persistence** — store in database, not in-memory
  - Effort: 2-3 days
  - Blocker: Compliance requirement
- [ ] **Encryption at rest** — database + file storage encrypted
  - Effort: 3-5 days
  - Blocker: HIPAA/GDPR requirement
- [ ] **Backup automation** — daily backups + on-demand + tested restore
  - Effort: 3-5 days
  - Blocker: Data loss = company death

### Smart Import (Critical for Adoption)
- [ ] **Real OCR** — Tesseract (free) or Google Cloud OCR (paid)
  - Effort: 1 week
  - Blocker: Smart Import must actually work, not just simulate
- [ ] **Real LLM for medical extraction** — OpenAI/Anthropic API integration
  - Effort: 1-2 weeks
  - Blocker: Confidence scores must be real
- [ ] **OR clearly label as "coming soon"** — don't ship fake AI

### Clinical Safety (Critical)
- [ ] **Real drug interaction database** — RxNorm or DrugBank integration (not 10 hardcoded rules)
  - Effort: 1 week
  - Blocker: Patient safety — fake interactions = liability
- [ ] **Allergy database** — cross-reactivity checking
  - Effort: 3-5 days
  - Blocker: Patient safety

### Operations (Critical)
- [ ] **Stripe integration** — real payment processing
  - Effort: 3-5 days
  - Blocker: Can't collect subscription revenue
- [ ] **Email + SMS sending** — real (SendGrid/Twilio), not mock
  - Effort: 3-5 days
  - Blocker: Patient communication
- [ ] **Production monitoring** — Sentry (errors) + Better Uptime (status)
  - Effort: 1 day
  - Blocker: Can't debug what we can't see

### Migration (Critical for Adoption)
- [ ] **VELTRA Switch** — import from Excel/CSV/other systems
  - Effort: 1 week
  - Blocker: #1 barrier to customer acquisition
- [ ] **Onboarding wizard** — clinic setup in <15 minutes
  - Effort: 1 week
  - Blocker: Setup friction = lost customers

### Compliance (Critical)
- [ ] **GDPR/HIPAA review** — legal review of data handling
  - Effort: 1-2 weeks (legal)
  - Blocker: Can't process patient data without it
- [ ] **Terms of Service + Privacy Policy + BAA** — legal documents
  - Effort: 1 week (legal)
  - Blocker: Can't accept customers without ToS

### Deployment (Critical)
- [ ] **Deploy to production Vercel + Supabase** — real URL, real database
  - Effort: 1 day
  - Blocker: Currently localhost only

---

## 🟡 IMPORTANT — Should Do Before Scale (12 items)

### UX Improvements
- [ ] **Global Search** — search across patients, labs, meds, files, appointments
  - Effort: 3-5 days
- [ ] **Skeleton loading** — replace spinners with content-shaped skeletons
  - Effort: 2-3 days
- [ ] **Empty states** — every screen needs a beautiful empty state
  - Effort: 2-3 days
- [ ] **Autosave** — every 2 seconds on forms
  - Effort: 2-3 days

### Patient-Facing
- [ ] **Patient Portal (web)** — book appointments, see labs, message doctor, pay bills
  - Effort: 4-6 weeks
- [ ] **Smart Follow-up** — automated patient outreach after visits
  - Effort: 1 week

### Clinical
- [ ] **AI Scribe** — voice → SOAP notes (needs real LLM)
  - Effort: 2-3 weeks
- [ ] **Digital Consent** — tablet signature capture
  - Effort: 3-5 days

### Admin
- [ ] **User Management** — invite, suspend, deactivate, sessions
  - Effort: 1 week
- [ ] **Security Center** — failed logins, suspicious activity, devices
  - Effort: 1-2 weeks
- [ ] **Multi-location** — single org, multiple branches
  - Effort: 1 week

### Performance
- [ ] **Real-time sync** — WebSocket for live updates
  - Effort: 1 week

---

## 🟢 DEFER — Phase 2+ (After 100 Customers)

- Multi-Organization (Platform → Org → Hospital)
- Native mobile apps (iOS/Android)
- FHIR/HL7 integration
- PACS/LIS integration
- ERP integration
- Workflow Builder (no-code)
- Dashboard Builder (visual)
- Developer Portal (REST API + GraphQL + SDK + Webhooks)
- Marketplace
- White Label
- AI Diagnosis suggestions (real LLM)
- AI Drug recommendations
- Predictive care models
- Cross-clinic benchmarking
- Offline mode + conflict resolution

---

## 📊 Launch Decision Framework

**Can we launch VELTRA to Dr. Balu today?**

```
If all 17 BLOCKING items are done → YES, launch
If any BLOCKING item is not done → NO, finish it first
```

**Current status (July 9, 2026):**
- ✅ 24 DONE items
- 🔴 17 BLOCKING items remaining
- 🟡 12 IMPORTANT items remaining
- 🟢 15+ DEFER items

**Estimated time to launch-ready:** 4-6 weeks of focused engineering work.

---

## 🎯 The Honest Truth

VELTRA today is a **beautiful, well-architected frontend** with a **simulated backend**.

The UI is production-ready. The backend is not.

To launch:
1. Spend 4-6 weeks on the 17 BLOCKING items
2. Don't add new features until those are done
3. Don't deploy until real database + real auth + real OCR are in place
4. Don't accept a paying customer until GDPR/HIPAA review is complete

**The good news:** The foundation (RBAC, permissions, UI patterns, design system, Health Score engine, Clinic Intelligence engine) is solid. We won't need to rebuild it. We just need to make the backend real.

---

**This checklist is the gate. No shortcuts. No "we'll fix it later." Launch only when every BLOCKING item is checked.**
