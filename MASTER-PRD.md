# VELTRA — Master Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Living document — updated as we learn
**Last updated:** July 9, 2026
**Owner:** VELTRA Product Team

---

## 1. Product Vision

> **VELTRA is the Healthcare Operating System for the Middle East, then the world.**

Not a clinic management app. Not an EHR. Not a billing system. An **Operating System** that runs the entire clinic — clinical, operational, financial, and intelligence layers — with the doctor's experience at the center.

**The test:** When there's a health problem, people should say "call Veltra" — not "call the doctor" or "call the ambulance." That requires building trust over years, layer by layer.

---

## 2. The 5 Laws of VELTRA

Every feature, every decision, every line of code must obey these:

1. **No feature unless it saves time.** Every feature must save time, reduce errors, or improve care quality. If it doesn't, it doesn't ship.
2. **No manual entry if it can be extracted.** If AI, OCR, or integration can fetch the data, the user never types it.
3. **Every screen must deliver value in 5 seconds.** Not just display data — deliver an insight or an action.
4. **Every step has a reason.** If a user has to click 6 times, the design is wrong. 3-click rule.
5. **Speed is part of the product.** Not an optimization for later. From the first line of code: open patient <200ms, search <100ms, page transitions instant.

---

## 3. Target Users (Personas)

### Primary: Dr. Ahmed (Doctor)
- 45 years old, runs a 30-patient/day clinic
- Hates software, loves medicine
- Has 15 minutes per patient
- Will adopt VELTRA if it saves him 1+ hour/day
- **Success metric:** Opens VELTRA first thing every morning

### Secondary: Layla (Receptionist)
- 28, manages bookings + check-ins
- Needs to confirm 50 appointments/day
- Will adopt VELTRA if booking takes <30 seconds
- **Success metric:** Uses VELTRA for 100% of bookings

### Tertiary: Mr. Hassan (Patient)
- 54, diabetic, visits every 90 days
- Wants to message doctor, see labs, pay bills
- Will use Patient Portal if it's simpler than calling
- **Success metric:** Books next appointment via portal (not phone)

### Quaternary: Dr. Balu (Clinic Owner)
- 50, owns 3 clinics, deciding whether to switch from legacy software
- Cares about: data migration, ROI, staff training time
- **Success metric:** Migrates all 3 clinics within 30 days

---

## 4. The 5 Moats (Competitive Advantages)

| Moat | What it means | How we win |
|------|---------------|------------|
| 1. Speed of execution | Idea → production in days, not months | CI/CD + staging + small team |
| 2. Unforgettable UX | First 60 seconds makes doctor say "this is different" | Radical simplicity + proactive intelligence |
| 3. Integrated AI | AI in every step, not a chatbot in corner | Real OCR + LLM + voice + pattern detection |
| 4. Learning system | Gets smarter with every clinic | Anonymized aggregation + ML pipeline |
| 5. Fast setup | New clinic → first patient in <15 minutes | Onboarding wizard + VELTRA Switch migration |

---

## 5. Product Phases

### Phase 1: Launch MVP (Now → 8 weeks)
**Goal:** First 10 paying customers (Founding Partners).

Must-have (blocking):
- [x] 10 roles + Permission Matrix (✅ done)
- [x] Sidebar (5 primary items) (✅ done)
- [x] Command Palette with Actions (✅ done)
- [x] Notification Center (420px side sheet) (✅ done)
- [x] Smart Import Center (simulated pipeline) (✅ done)
- [x] Health Score (✅ done — this session)
- [x] Clinic Intelligence (✅ done — this session)
- [x] Patient Flags (✅ done — this session)
- [x] Care Quality metrics (Trust Engine) (✅ done — this session)
- [x] Print layout (logo + doctor + stamp + notes + signature) (✅ done)
- [ ] Real database (PostgreSQL + Prisma migrations)
- [ ] Real authentication (JWT + MFA)
- [ ] Real audit log persistence
- [ ] Encryption at rest
- [ ] Backup automation
- [ ] Global Search
- [ ] Onboarding wizard (15-min setup)
- [ ] VELTRA Switch (migration from other systems)
- [ ] Real OCR for Smart Import (or label "coming soon")
- [ ] Real drug interaction database (RxNorm)
- [ ] Stripe integration (real payments)
- [ ] Email + SMS sending (real)
- [ ] Production monitoring (Sentry + uptime)
- [ ] GDPR/HIPAA compliance review
- [ ] Terms of Service + Privacy Policy + BAA
- [ ] Deploy to production Vercel + Supabase

### Phase 2: Scale (Months 3-6)
**Goal:** 100 paying customers.

- Multi-Organization (Platform → Org → Hospital → Branch → Department)
- Patient Portal (web app)
- AI Scribe (voice → SOAP notes — needs real LLM)
- Smart Follow-up (automated patient outreach)
- Digital Consent (tablet signature)
- User Management (invite, suspend, sessions, MFA)
- Security Center (failed logins, suspicious activity, devices)
- Reception Display (waiting room screen)
- Pharmacy Mode (separate UI)
- Lab Mode (separate UI)
- Real-time sync (WebSocket)
- Offline mode + conflict resolution
- Advanced analytics (benchmarks, cohort analysis)

### Phase 3: Hospital Market (Months 7-18)
**Goal:** Hospital networks, multi-country.

- Radiology Workspace (image upload + AI-assisted reporting)
- FHIR/HL7 integration
- PACS/LIS integration
- ERP integration
- Workflow Builder (no-code automation)
- Dashboard Builder (visual editor)
- Developer Portal (REST API + GraphQL + SDK + Webhooks)
- Marketplace
- White Label
- Native mobile apps (iOS/Android — Doctor, Nurse, Patient)

### Phase 4: Intelligence (Months 19-36)
**Goal:** Network effects, predictive care.

- Anonymized cross-clinic benchmarking
- Predictive care models (who will no-show, who will be readmitted)
- AI Diagnosis suggestions (real LLM)
- AI Drug recommendations
- AI Documentation (auto-write visit notes)
- AI Voice Dictation (speech-to-text)
- AI Medical Chat (real conversational AI)
- Hallucination detection + confidence calibration

---

## 6. Feature Priorities (This Quarter)

### Tier 1 — Ship Now (Weeks 1-4)
| Feature | Why | Status |
|---------|-----|--------|
| Real database | Can't launch without persistence | Not started |
| Real auth | Security + multi-user | Not started |
| VELTRA Switch | Migration is #1 barrier to adoption | Not started |
| Onboarding wizard | 15-min setup is a moat | Not started |
| Global Search | Doctor's #1 daily frustration | Not started |
| Real OCR | Smart Import must actually work | Not started |
| Production monitoring | Can't ship without it | Not started |

### Tier 2 — Ship Next (Weeks 5-8)
| Feature | Why | Status |
|---------|-----|--------|
| Patient Portal (web) | Patient retention + acquisition | Not started |
| AI Scribe | Saves doctor 30+ min/day | Not started |
| Smart Follow-up | Reduces no-shows + improves outcomes | Not started |
| Digital Consent | Compliance + paperless | Not started |
| Security Center | Compliance + trust | Not started |
| Stripe + Email + SMS | Real business operations | Not started |

### Tier 3 — Defer (Phase 2+)
Multi-Org, native mobile, FHIR/HL7, PACS/LIS, Workflow Builder, Dashboard Builder, Marketplace, White Label.

---

## 7. Success Metrics

### North Star Metric
**Weekly Active Doctors (WAD)** — doctors who open VELTRA 5+ days/week.

### Phase 1 Targets (Month 3)
- 10 paying Founding Partners
- 80% WAD among customers
- <2 sec average page load
- 95% uptime
- NPS >50

### Phase 2 Targets (Month 6)
- 100 paying customers
- $50k MRR
- 70% of bookings via Patient Portal
- 30% reduction in doctor's admin time (measured)

### Phase 3 Targets (Month 18)
- 500+ clinics
- $500k MRR
- 5+ hospital networks
- 2+ countries

---

## 8. Design Principles

### Radical Simplicity
- 5 primary nav items. That's it.
- Every secondary feature reachable via ⌘K or context.
- Apple's iOS has 200 screens. Users see 7 in the dock.

### Proactive, Not Reactive
- VELTRA tells the doctor what needs attention. The doctor never searches for problems.
- Today's Brief surfaces 3-6 intelligence alerts every morning.

### Show Outcomes, Hide Mechanism
- Drug interaction alert → "Don't prescribe Metformin — patient has Sulfa allergy"
- Not → "AI model v2.3 detected contraindication with 94% confidence"
- Apple doesn't say "Neural Engine A17, 19 trillion ops/sec." Apple says "Camera shoots in the dark."

### Trust Engine, Not Rating System
- No ⭐⭐⭐⭐⭐ for doctors.
- Care Quality metrics: Communication, Empathy, Clinical Compliance, Documentation, Waiting Time, Patient Understanding, Follow-up Completion, Prescription Accuracy.
- Patient flags are operational (attendance, adherence), NOT personal ratings.

### Speed is a Feature
- Open patient <200ms
- Search <100ms
- Page transitions instant
- Autosave every 2 seconds
- Undo for any destructive action

---

## 9. Architecture Principles

### Multi-Tenant from Day 1
- Even with 1 customer, build for 10,000.
- Organization → Hospital → Branch → Department → Unit → Room.
- Row-level security in database.

### API-First
- Every feature accessible via REST API.
- Webhooks for every event.
- SDK in TypeScript, Python, Swift, Kotlin.

### Real-Time
- WebSocket for live updates (appointments, messages, vitals).
- Optimistic UI updates.
- Conflict resolution for offline mode.

### Privacy-Preserving Intelligence
- Aggregated benchmarks use anonymized data only.
- No patient-identifiable data leaves the clinic without explicit consent.
- GDPR + HIPAA compliant by architecture, not by policy.

---

## 10. The 3-Click Rule

Any action a doctor does daily must be reachable in 3 clicks or fewer.

| Action | Clicks | Path |
|--------|--------|------|
| Start visit | 1 | Click "Start Visit" on patient header |
| Write prescription | 2 | Start Visit → Prescription pad opens |
| Order lab | 2 | Start Visit → Order Labs |
| Print chart | 1 | Click "Print" on patient header |
| Message patient | 1 | Click "Message" on patient header |
| Search patient | 1 | ⌘K → type name |
| Book appointment | 2 | Schedule → click slot |
| View today's brief | 0 | Default screen on login |

If any daily action takes >3 clicks, redesign.

---

## 11. The VELTRA Switch (Migration Feature)

**The single most important feature for adoption.**

Most clinics won't switch because of data migration fear. VELTRA Switch removes that barrier:

1. Doctor uploads files (PDF, Excel, CSV, images, exports from any system)
2. VELTRA's OCR + AI extracts patients, visits, labs, prescriptions
3. Confidence scores flag low-confidence fields for review
4. Doctor reviews + approves
5. Data written to VELTRA database with full audit trail

**Demo flow (for first customer):**
- Doctor uploads 5 PDFs (old patient records)
- VELTRA processes in 30 seconds
- Shows: "2,384 patients imported · 6,291 visits · 14,002 labs · 1,832 prescriptions · 98.7% accuracy"
- Doctor says: "We'll buy VELTRA."

---

## 12. What VELTRA is NOT

- ❌ Not a chatbot in a corner
- ❌ Not a dashboard that waits for input
- ❌ Not a feature list to compete on quantity
- ❌ Not a rating system for doctors
- ❌ Not a black-box AI
- ❌ Not a tool that adds steps to the doctor's day

---

## 13. Open Questions (Need Answers)

1. **Real LLM provider?** OpenAI / Anthropic / local Llama? Cost per clinic?
2. **Real OCR?** Tesseract (free, lower accuracy) vs Google Cloud OCR (paid, higher)?
3. **Hosting region?** Saudi Arabia (data residency) vs global?
4. **Pricing for Phase 2?** Per-doctor vs per-clinic vs per-patient?
5. **Mobile strategy?** PWA first vs React Native vs native?
6. **Insurance integrations?** Which providers first (Bupa, Tawuniya, etc.)?
7. **Localization?** Arabic-first or English-first in product UI?

---

## 14. References

- `HONEST-AUDIT.md` — what's actually built vs simulated vs missing
- `VELTRA-HQ/01-Master-Documentation.md` — single source of truth
- `VELTRA-HQ/02-Brand-Book.md` — brand identity
- `VELTRA-HQ/03-Design-System.md` — design tokens
- `DEPLOY-NOW.md` — 3-command deploy guide
- `FIRST-CUSTOMER-PLAYBOOK.md` — Dr. Balu onboarding
- `src/lib/health-score.ts` — Health Score + Clinic Intelligence + Care Quality engine
- `src/lib/veltra-store.ts` — PERMISSIONS matrix (10 roles, 25+ flags)

---

**This PRD is the single source of truth. When in doubt, refer here. When this PRD is wrong, update it.**
