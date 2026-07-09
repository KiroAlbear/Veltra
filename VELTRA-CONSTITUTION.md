# VELTRA ENGINEERING CONSTITUTION
### Version 1.0 — The Operating System of Healthcare

> The constitution. Every AI, engineer, designer, and product manager must read and obey this before writing a single line of code, designing a single screen, or proposing a single feature. When there is conflict, this document wins.
>
> _Technology disappears. Care remains._

---

## TABLE OF CONTENTS

0. Preamble
1. What Veltra Is — and Is Not
2. Decision Priority
3. Definition of Done
4. Performance Targets
5. Security & Compliance (HIPAA / GDPR / NPHIES)
6. Data Philosophy
7. Database Rules
8. API Rules
9. UX Rules
10. Brand Voice & Copywriting
11. Demo Data Standards
12. Typography
13. Color
14. Spacing & Layout
15. Motion
16. Auth & Permissions
17. Search
18. Polish & States
19. Demo Mode
20. Mobile
21. Accessibility
22. Server Stability
23. Future Expansion
24. Final Principle

---

## 0. PREAMBLE

Veltra is not a project. Veltra is a **product**, a **company**, and a **philosophy**.

This document is the **single source of truth** for every decision made inside Veltra — code, design, copy, data, security, and direction. It exists so that when the project reaches 200,000 lines of code, when the team grows from 3 to 30, when the AI assistants multiply, the **soul of the product is preserved** without anyone needing to re-explain it.

This is not a suggestion. This is a **contract**.

Any code, design, copy, or product decision that violates this constitution must be fixed immediately — or rejected before it ships.

---

## 1. WHAT VELTRA IS — AND IS NOT

### 1.1 Veltra IS

- A **Clinic Operating System** — the layer that runs the entire clinic, from the first call to the final follow-up.
- A **Clinical Memory Layer** — every interaction becomes context for the next decision. Nothing important is forgotten.
- A **Workflow Engine** — appointments, billing, labs, prescriptions, insurance, inventory — all flowing through one nervous system.
- A **Chief of Staff** — a calm intelligence that briefs the doctor every morning, surfaces what matters, and silences what does not.
- A **Healthcare Operations Platform** — global by design, multi-specialty by default, multi-location by architecture.

### 1.2 Veltra is NOT

- An Electronic Medical Record only.
- A scheduling app.
- A CRM.
- A billing software.
- A generic ERP.
- A chatbot bolted onto a clinic tool.
- An AI product masquerading as a clinic tool.

### 1.3 The North Star

> Every decision must move Veltra closer to becoming **the operating system of healthcare**.

If a proposed feature does not move Veltra closer to that, it does not ship.

---

## 2. DECISION PRIORITY

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

A beautiful animation that delays a clinical decision is rejected.
A clever abstraction that hides patient risk is rejected.
A fast shortcut that bypasses audit is rejected.

---

## 3. DEFINITION OF DONE

A feature is **only** complete when **all** of the following are true:

- ✓ Works on Desktop (1440px+)
- ✓ Works on Laptop (1024–1440px)
- ✓ Works on Tablet (768–1024px)
- ✓ Works on Mobile (320–768px)
- ✓ Accessible (WCAG AA, keyboard-navigable, screen-reader tested)
- ✓ Responsive (no horizontal scroll, no overflow, no broken layouts)
- ✓ Production Ready (no `console.log`, no `TODO`, no `any` without comment, no mocks in prod paths)
- ✓ Secure (server-side validation, role-checked, audit-logged)
- ✓ Fast (meets Performance Targets in §4)
- ✓ Tested (at least one happy-path test, one edge-case test)
- ✓ Uses reusable components (no copy-pasted UI blocks)
- ✓ Documented (component props, API contract, or schema documented inline)
- ✓ Empty state designed (not "No data")
- ✓ Error state designed (not a red screen of death)
- ✓ Loading state designed (not a bare spinner)
- ✓ Reviewed against this Constitution

If any of these are false, the feature is **not done**. It is "in progress."

---

## 4. PERFORMANCE TARGETS

### 4.1 Landing Page

| Metric | Target |
|--------|--------|
| Lighthouse (overall) | ≥ 95 |
| Lighthouse (Performance) | ≥ 90 |
| CLS (Cumulative Layout Shift) | < 0.1 |
| LCP (Largest Contentful Paint) | < 2.0s |
| FID (First Input Delay) | < 100ms |
| TBT (Total Blocking Time) | < 200ms |
| Bundle size (initial) | < 250 KB gzipped |

### 4.2 Workspace (authenticated app)

| Metric | Target |
|--------|--------|
| First load (TTI) | < 2.0s |
| Route transition | < 300ms |
| Search results (debounced) | < 150ms |
| List render (100 items) | < 100ms |
| Form submit response | < 500ms (perceived) |

### 4.3 Real-time

- WebSocket messages: < 100ms latency to UI update.
- Optimistic UI for every mutation that the user initiated.
- Rollback within 400ms if the server rejects.

### 4.4 Forbidden

- No blocking the main thread for > 50ms.
- No synchronous calls to external services on the request path.
- No unbounded queries (always paginate or limit).
- No client-side loops over > 1000 items without virtualization.

---

## 5. SECURITY & COMPLIANCE

### 5.1 The Default

> Always assume healthcare data is sensitive. Always.

Every patient name, every lab value, every medication, every voice note is **Protected Health Information (PHI)** until proven otherwise.

### 5.2 Compliance Frameworks

Veltra must be designed to satisfy — and be auditable against — the following:

- **HIPAA** (United States) — Privacy Rule, Security Rule, Breach Notification.
- **GDPR** (European Union) — Lawful basis, right to erasure, data portability, DPA.
- **NPHIES** (Saudi Arabia) — National e-Health Information Exchange integration readiness.
- **PDPL** (Saudi Personal Data Protection Law) — consent, retention, cross-border transfer.
- **DHA / DOH** (Dubai Health Authority / Abu Dhabi DOH) — local data residency options.

### 5.3 The Twelve Security Rules

1. **Least privilege** — every user, every service, every token gets the minimum access required.
2. **Server-side validation** — never trust the client. Every mutation is validated on the server.
3. **Audit logging** — every PHI access, every mutation, every login is logged with `userId, action, target, timestamp, before, after`.
4. **Role-based permissions** — enforced server-side, not just hidden in the UI.
5. **Encryption at rest** — AES-256 for databases, object storage, backups.
6. **Encryption in transit** — TLS 1.3 everywhere. No HTTP except localhost.
7. **No secrets in client bundles** — env vars are server-only. Next.js `NEXT_PUBLIC_*` is forbidden for anything sensitive.
8. **No client-side trust** — UI hiding a button does not remove the user's permission. The API still checks.
9. **Token rotation** — access tokens expire in 15 minutes. Refresh tokens rotate on use.
10. **PHI minimization in logs** — never log a full patient name, full phone, or full medical record. Mask in logs: `Ahmed H. +966 ••• ••• 4567`.
11. **Breach readiness** — every breach path has an alert. Every alert has an on-call owner.
12. **Right to erasure** — any patient can request deletion. The system must support hard-delete with audit trail of the deletion itself.

### 5.4 Authentication

- Every user logs in with email + password (or SSO at the Enterprise tier).
- No "guest" mode. No "demo without login" outside of investor demos (clearly labeled).
- 2FA optional at Platform, mandatory at Enterprise.
- Session timeout: 8 hours of inactivity, 30 days maximum.

### 5.5 Data Residency

- Default region: EU (Frankfurt) for GDPR.
- Saudi deployment: Riyadh region for NPHIES compliance.
- Dubai deployment: UAE region for DHA compliance.
- Cross-region replication: only with explicit patient consent or legal requirement.

---

## 6. DATA PHILOSOPHY

> Every action must create memory.
> Every memory must be searchable.
> Every patient interaction must become context for future decisions.
> Nothing important should ever be forgotten.

### 6.1 The Four Laws of Veltra Memory

1. **Everything is an event.** A booking, a call, a prescription, a payment, a voice note — all are events on a patient's timeline.
2. **Events are immutable.** You can add a correction event. You cannot delete history.
3. **Memory compounds.** A single lab result is data. Six months of lab results is insight. Two years is pattern recognition.
4. **Memory is private to the clinic.** Patient data does not leave the clinic's tenant — except for Network Memory, which is anonymized and aggregated.

### 6.2 What "Memory" Means in Practice

- A doctor opening a patient chart sees the **last 5 visits** by default, the **last 3 lab trends** as sparklines, the **last voice note** as a transcript, and the **next planned action** as a highlighted card.
- A doctor opening the morning brief sees **what changed overnight**: new labs, no-show patterns, overdue follow-ups, recovered revenue.
- A doctor searching for "all diabetic patients overdue for HbA1c" gets the answer in < 200ms.

### 6.3 What Must Never Be Forgotten

- A patient's allergy.
- A patient's medication interaction warning.
- A missed appointment and the reason given.
- A doctor's verbal instruction recorded as a voice note.
- A billing correction.
- A patient's preferred channel and language.
- A patient's consent (or withdrawal of consent).

### 6.4 What May Be Forgotten

- Drafts that were never saved.
- Transient UI state (filter selections, scroll positions).
- Deleted documents (after a 30-day grace period).

---

## 7. DATABASE RULES

### 7.1 Stack

- **Prisma** as the ORM (typed, schema-first, migration-friendly).
- **PostgreSQL** as the primary database (ACID, JSONB, full-text search).
- **Redis** for sessions, rate-limiting, and ephemeral state.
- **Object storage (S3-compatible)** for documents, images, voice notes — never the database.

### 7.2 Schema Principles

- Every table has `id` (UUID v4), `createdAt`, `updatedAt`, `tenantId` (for multi-tenancy).
- Every PHI field is annotated in the Prisma schema with `/// PHI` for audit-tooling.
- Every foreign key has `onDelete: Restrict` by default — only `Cascade` for owned children (e.g., a patient's timeline events).
- No raw SQL in app code without a code review.
- No `SELECT *` — always explicit columns.

### 7.3 Migration Discipline

- Every schema change is a Prisma migration with a clear name: `add_patient_consent_field`, not `update_schema_3`.
- Migrations are **forward-only**. Down migrations are forbidden in production.
- Destructive migrations (column drops, table drops) require a 30-day deprecation window with a feature flag.

### 7.4 Multi-Tenancy

- Row-Level Security (RLS) on every tenant-scoped table.
- Every query is automatically scoped by `tenantId` via a Prisma extension.
- Cross-tenant queries require explicit `bypassRLS` and an admin role.

### 7.5 Indexing

- Every foreign key is indexed.
- Every column used in `WHERE`, `ORDER BY`, or `JOIN` is indexed.
- Composite indexes only when a single-column index cannot serve the query.
- EXPLAIN ANALYZE every slow query (> 100ms).

### 7.6 Backups

- Full backup nightly. Incremental every 15 minutes.
- 30-day retention minimum. 7-year retention for audit (read-only, cold storage).
- Quarterly restore drill — backups that have never been restored are not backups.

---

## 8. API RULES

### 8.1 Architecture

- **Next.js Route Handlers** (App Router) for all API endpoints.
- **tRPC or REST** for typed client-server contracts. No untyped fetch.
- **Zod** for input validation on every endpoint. No exceptions.
- **WebSockets** for real-time (patient check-ins, live activity feed, voice note transcription status).

### 8.2 Versioning

- URL versioning: `/api/v1/...`. No breaking changes inside a version.
- Deprecation: 6-month window, `Deprecation` header, sunset notice in changelog.

### 8.3 Response Shape

```typescript
// Success
{ "data": T, "meta"?: { "cursor"?: string, "total"?: number } }

// Error
{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }
```

- HTTP status codes follow REST conventions strictly.
- 200 for success, 201 for created, 204 for no content.
- 400 for validation, 401 for unauthenticated, 403 for unauthorized, 404 for missing, 409 for conflict, 429 for rate-limited, 500 for server error.

### 8.4 Rate Limiting

- 100 requests/minute per authenticated user.
- 20 requests/minute per IP for unauthenticated endpoints.
- 429 response includes `Retry-After` header.

### 8.5 Idempotency

- Every mutating endpoint accepts an optional `Idempotency-Key` header.
- The same key returns the same response within 24 hours.

### 8.6 Pagination

- Cursor-based, never offset-based (offset breaks under concurrent writes).
- Default page size: 20. Maximum: 100.

### 8.7 Forbidden

- No `GET` requests that mutate state.
- No `POST` requests without input validation.
- No endpoints that bypass authentication.
- No endpoints that bypass tenant scoping.

---

## 9. UX RULES

### 9.1 The Single Focus

> Every screen has **one** focal point. The user's eye must know where to land within 200ms.

- Brief → the revenue hero number.
- Patients → the grid of patient cards.
- Timeline → the patient name + context box.
- Appointments → the time column.
- Labs → the most recent abnormal result.

### 9.2 The Three-Click Rule

Any primary action must be reachable in **3 clicks or fewer** from any screen in the workspace.

- Book appointment: ⌘K → "Book" → confirm.
- View patient: ⌘K → type name → Enter.
- Record payment: open patient → "Record payment" → confirm.

### 9.3 The No-Surprise Rule

- Every destructive action (delete, cancel, void) requires confirmation.
- Every irreversible action shows the consequence in plain language: "This will permanently remove Sarah Chen and 14 timeline events."
- Every async action shows progress: spinner, toast, or live status.

### 9.4 The Calm Rule

- No infinite animations except the LIVE pulse.
- No autoplay carousels.
- No modal stacking (one modal at a time, ever).
- No toast stacking more than 3.
- No notification badge above 99 — show "99+".

### 9.5 The Honest Empty State

- Every empty state is **designed**, not defaulted.
- It says one true sentence (editorial italic) + one helpful CTA.
- "No one here. Try a different search." + clear filter button.
- "Nothing needs you. Enjoy the quiet." + dismiss.
- Never "No data found." Never "Error."

### 9.6 The Three Loading Tiers

| Tier | When | What |
|------|------|------|
| 1. Skeleton | < 200ms expected | Bone-white placeholder of the final layout |
| 2. Spinner | 200ms–2s | Loader2 with verb: "Saving..." "Loading..." |
| 3. Progress | > 2s | Progress bar with stage labels |

Every spinner has an 8-second timeout that surfaces a retry CTA.

### 9.7 The Mobile-First Mirror

- Every screen is designed mobile-first, then expanded.
- Touch targets: minimum 44×44px.
- No hover-dependent interactions on mobile.
- The sidebar collapses to a hamburger drawer under 768px.

---

## 10. BRAND VOICE & COPYWRITING

### 10.1 The Voice

Veltra speaks **calmly**.

- Reliable.
- Quiet.
- Confident.
- Human.
- Professional.

### 10.2 The Forbidden Vocabulary

These words are **banned** from every surface — UI, marketing, docs, emails:

- AI, smart, intelligent, seamless, leverage, automagically
- next-gen, revolutionary, game-changing, cutting-edge
- innovative, disruptive, synergy
- world's best, number one, leading, premier
- revolutionary, paradigm shift, holy grail

If a feature is good, **show it working**. Do not tell the user it is "revolutionary."

### 10.3 The Pronoun Rule

- Veltra never says "I" or "we."
- Veltra states what happened, in the third person, past tense.
- "Appointment booked." — not "We booked your appointment."
- "Reminder sent." — not "I sent a reminder."
- "Lab result received." — not "We've got your results!"

### 10.4 The Editorial Moment Rule

Serif italic (Instrument Serif Italic) is reserved for **emotional** moments — never for UI labels or instructions:

- Greetings: _"Good morning,"_
- Empty states: _"Nothing needs you. Enjoy the quiet."_
- Signatures: _"Technology disappears. Care remains."_
- Transitions: _"Preparing today's brief..."_

### 10.5 The Copywriting Rules

- **Short.** One idea per sentence.
- **Clear.** Plain English at a 9th-grade reading level.
- **Precise.** "14 patients" not "many patients." "$3,280" not "thousands of dollars."
- **Active.** "Dr. Sarah prescribed Metformin" not "Metformin was prescribed."
- **Honest.** Never overpromise. "Recovered revenue" not "guaranteed revenue."

### 10.6 The Number Rule

- Always use `tabular-nums` for any number.
- Always localize currency ($, SAR, AED, €, £).
- Always include units: "8.4 %" not "8.4".
- Spell out one through nine in prose, use numerals for 10+.

### 10.7 The "We Remember" Rule

> Prefer: **"We remember."**
> Instead of: "We leverage advanced technology to intelligently remember."

Three words. Subject, verb. Done.

---

## 11. DEMO DATA STANDARDS

### 11.1 The Demo Conviction Rule

> Demo data must never feel fake.

The demo is the **first impression** for an investor, a doctor, a clinic owner. If they sense fake data, they lose trust in the product. The demo must convince them that Veltra is **already live** at a real clinic.

### 11.2 Realistic Names

- Mix of **Arabic names** (Ahmed Hassan, Fatima Al-Zahra, Khalid Al-Otaibi) and **international names** (Sarah Chen, James Wilson, Christina Yang).
- Names appropriate to the specialty: pediatric patients have child names (Emma, Liam); geriatric patients have older names (Margaret, Arthur).
- Phone numbers in real country formats: `+966 50 123 4567`, `+971 50 123 4567`, `+1 555 0123`.

### 11.3 Realistic Clinical Data

- Lab values in real units with real reference ranges (HbA1c: 4.0–5.6 % normal, 5.7–6.4 % prediabetic, ≥ 6.5 % diabetic).
- Vital signs in real ranges (BP 110/70 to 160/100 across the demo).
- Medication names with real dosages (Metformin 1000mg twice daily, Atorvastatin 20mg at bedtime).
- Conditions appropriate to the specialty (Cardiology: hypertension, arrhythmia; Pediatrics: fever, asthma, vaccination due).

### 11.4 Realistic Operations

- Insurance providers by region: Bupa Arabia, Tawuniya, MedGulf (Saudi); Daman, Nextcare, Oman Insurance (UAE); Cigna, Bupa Global (international).
- Invoice amounts that match the specialty's price list.
- Appointments at realistic times (9 AM–5 PM, 30-minute slots).
- Voice notes that sound like a real doctor dictating (transcript, not bullet points).

### 11.5 Realistic Activity

- The activity feed shows what would actually happen in a busy clinic: bookings, check-ins, lab results arriving, prescriptions sent, payments collected, reminders fired.
- Timestamps are recent (today, yesterday, 2 days ago) — never "3 weeks ago" in a demo.
- Notifications are clinically meaningful, not filler.

### 11.6 The Specialty Vocabulary Rule

Each specialty demo must use **that specialty's vocabulary** — not generic placeholders:

- Dental: "Crown follow-up," "Root canal," "CBCT scan," "Implant placement."
- Cardiology: "ECG review," "Troponin result," "Echo scheduled," "Holter monitor."
- Dermatology: "Botox follow-up," "Mole biopsy," "Laser session," "Wood's lamp exam."
- Pediatrics: "Vaccination due," "Well-child visit," "Growth chart," "School medical."

A dental clinic demo that shows "ECG reviews" is broken. Fix it.

### 11.7 The Demo Reset Rule

- "Reset Demo" returns the data to its seeded state.
- The reset is **fast** (< 500ms perceived) and confirms with a toast.
- The reset is logged in the audit trail.

---

## 12. TYPOGRAPHY

### 12.1 Font Families

- **Inter** — body text, UI, numbers. Default for everything.
- **Instrument Serif (Italic)** — editorial moments only: greetings, empty states, signatures. Never for UI labels.
- **JetBrains Mono** — numbers requiring tabular alignment (times, IDs, amounts), code, keyboard hints.

### 12.2 Type Scale (fixed, no improvisation)

| Role | Size | Weight | Line-height | Letter-spacing |
|------|------|--------|-------------|----------------|
| Display (h1) | 2.5rem (40px) | 600 | 1.05 | -0.03em |
| Title (h2) | 1.25rem (20px) | 600 | 1.25 | -0.02em |
| Heading (h3) | 1rem (16px) | 600 | 1.3 | -0.015em |
| Body | 0.9375rem (15px) | 400 | 1.5 | -0.01em |
| Caption | 0.8125rem (13px) | 400 | 1.45 | -0.005em |
| Micro | 0.6875rem (11px) | 600 | 1.4 | 0.08em uppercase |

### 12.3 Forbidden

- No font-size below 11px.
- No font-weight below 400 for body text.
- No pure white text in dark mode — use warm off-white (#EDE9E0).
- No pure black text in light mode — use deep navy (#1A2238).
- No pure white background in light mode — use warm off-white (#FAF8F4).
- No pure black background in dark mode — use warmer midnight.
- All numbers use `tabular-nums` for alignment.

---

## 13. COLOR

### 13.1 Brand

- **Veltra Emerald** (#39CFA2) — brand accent only: logo, primary CTAs, success states.
- Dark mode: desaturated variant (oklch 0.72 0.13 165) to reduce chromatic aberration.
- Light mode: darker variant (oklch 0.62 0.13 165) for contrast.

### 13.2 Semantic Colors

| Color | Meaning | Examples |
|-------|---------|----------|
| Emerald | success | confirmed, paid, completed |
| Amber | warning | pending, due, reminder |
| Red | danger | no-show, overdue, destructive |
| Violet | neutral-warm | waiting, checked-in |
| Blue / Cyan | info | calls, lab results |

**Emerald is for success only.** Never use emerald for informational states.

### 13.3 Opacity Pattern

- Badges: `bg-{color}-500/10 text-{color}-300 border-{color}-500/20`
- Forbidden in dark mode: `bg-{color}-50` (renders too dark).

### 13.4 The Three Brand Anchors

| Name | Hex | Role |
|------|-----|------|
| Midnight | #071323 | Dark mode background |
| Veltra Emerald | #39CFA2 | Accent, success, brand |
| Warm White | #FAF8F5 | Light mode background |

---

## 14. SPACING & LAYOUT

### 14.1 Scale (8px base)

| Token | Value | Use |
|-------|-------|-----|
| 1 | 4px | Micro adjustments |
| 2 | 8px | Tight gaps |
| 3 | 12px | Default small |
| 4 | 16px | Default |
| 5 | 20px | Section padding |
| 6 | 24px | Section gaps |
| 8 | 32px | Section breaks |
| 12 | 48px | Hero padding |

### 14.2 Cards

- Padding: `p-6` (24px) standard, `p-8` (32px) for hero/feature cards.
- Border: **forbidden** on cards — use shadow only.
- Radius: `rounded-2xl` (16px) for large cards, `rounded-lg` (8px) for inline.

### 14.3 Rows

- List rows: `px-6 py-4` (24px / 16px).
- Dividers between rows: `border-b border-border/40` — never `divide-y`.
- The last row has no border.

### 14.4 Section Rhythm

- Section padding: `py-12` minimum between major sections.
- Card padding: `p-6` minimum.
- Never stack more than 4 cards in a column without a visual break.

---

## 15. MOTION

### 15.1 The Single Easing

- All motion uses **one** easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` — the "Veltra Ease."
- Durations:
  - `0.2s` for micro-interactions.
  - `0.3s` for page transitions.
  - `0.5s` for entrances.

### 15.2 Entrances

- Stagger: 0.05–0.08s between items.
- Initial: `opacity: 0, y: 8–12px`.
- Hover lift: `y: -2 to -4px` with spring (stiffness 400, damping 25).

### 15.3 Forbidden

- No infinite animations except the LIVE pulse.
- No autoplay carousels.
- No spinners without an 8-second timeout fallback.
- No bounce easing. No elastic easing. No back-easing.
- No motion that triggers vestibular discomfort (respect `prefers-reduced-motion`).

---

## 16. AUTH & PERMISSIONS

### 16.1 Login

- Every user logs in with email + password.
- No "guest" mode. No "demo without login" outside labeled investor demos.
- Demo mode: demo users appear in a one-click dropdown for investors.

### 16.2 Roles (4 roles)

| Role | Can View | Can Edit |
|------|----------|----------|
| **Admin** | Everything | Everything |
| **Doctor** | patients, appointments, timeline, brief | appointments (confirm/complete), patient notes, prescriptions |
| **Receptionist** | appointments, patients (basic) | appointments (book/check-in/cancel), patient contact info |
| **Nurse** | patients, timeline, vitals | vitals, check-in, notes |

### 16.3 Permission Guards

- Every screen checks `canAccess(role, screen)`.
- Every action button checks `canDo(role, action)`.
- If the user lacks permission, the button **does not render** — it is not disabled.

### 16.4 Audit Log

- Every action is logged: `userId, action, target, timestamp, before, after`.
- The Admin can view the complete audit log.
- The audit log is **immutable** — append-only.

### 16.5 Session

- 8-hour idle timeout.
- 30-day maximum session.
- 2FA: optional at Platform, mandatory at Enterprise.

---

## 17. SEARCH

### 17.1 Command Palette (⌘K)

- Available on every screen.
- Searches: screens, patients, appointments, actions, demo controls.
- Fuzzy match, recent searches, keyboard navigation (↑↓ Enter).

### 17.2 Patient Search

- Searches by: name, condition, doctor, phone, balance status, specialty, city, tags.
- Results appear within 200ms (debounced).
- Empty state: _"No one here. Try a different search."_

### 17.3 Global Search

- ⌘K opens the command palette from anywhere.
- Recent searches persist across sessions.
- Keyboard-only navigation is fully supported.

---

## 18. POLISH & STATES

### 18.1 Visual Hierarchy

> One focal point per screen. The eye knows where to land within 200ms.

### 18.2 Empty States

- Every empty state has: editorial italic message + CTA button.
- Forbidden: "No data" alone.

### 18.3 Loading States

- Every async action has: spinner (Loader2) + disabled state + 8s timeout → error toast with retry.

### 18.4 Error States

- Every error toast has: title + description + optional action button.
- Forbidden: red screen of death. Always graceful fallback.

### 18.5 Optimistic UI

- Every user-initiated mutation updates the UI immediately.
- If the server rejects, rollback within 400ms with an explanatory toast.

---

## 19. DEMO MODE

### 19.1 Banner

- The demo banner is sticky at the top, emerald-tinted glass.
- It shows: "Demo Clinic" + "Switch to Live" + "Reset."

### 19.2 Reset

- Reset returns all data to its seeded state.
- Toast: "Demo reset — All data restored."

### 19.3 Live Mode

- Same data, but the banner reads "Live Mode."
- No data change — it is psychological (the user "owns" the data for this session).

### 19.4 Specialty Switching

- The sidebar contains a Specialty Switcher that regenerates the entire dataset for the selected specialty.
- Switching is logged in the audit trail.
- Switching never loses the user's session.

### 19.5 Tier Switching

- The sidebar contains a Tier Badge that switches the active subscription tier (Platform / Enterprise).
- Switching tiers updates the visible feature set (Enterprise adds Network Memory, cross-location analytics, custom API).

---

## 20. MOBILE

### 20.1 Layout

- Sidebar collapses to a hamburger drawer.
- Stat grids: 4 cols → 2 cols.
- Card grids: 3 cols → 1 col.
- Touch targets: minimum 44×44px.

### 20.2 Top Bar

- Hamburger + screen title + (theme toggle + notifications bell).

### 20.3 Forbidden on Mobile

- Hover-dependent interactions.
- Modals wider than the viewport.
- Tables wider than the viewport (use cards instead).
- Fixed elements that overlap the system status bar.

---

## 21. ACCESSIBILITY

### 21.1 Contrast

- All text meets WCAG AA (4.5:1 for body, 3:1 for large text).
- No text below 11px.

### 21.2 Keyboard

- Every interactive element is reachable via Tab.
- Focus ring is always visible (`outline-ring`).
- Shortcuts: 1–6 for primary screens, ⌘K for palette, ⌘/ for shortcuts help, ⌘Z for undo, ⌘D for theme toggle.

### 21.3 Screen Readers

- Every icon button has an `aria-label`.
- Every dialog has `DialogTitle` + `DialogDescription` (sr-only acceptable).
- Every form input has an associated `<Label>`.
- Every status update (toast, notification) uses `aria-live="polite"`.

### 21.4 Reduced Motion

- `prefers-reduced-motion: reduce` disables all non-essential animations.
- The LIVE pulse remains (it carries information).
- Page transitions become crossfades only.

---

## 22. SERVER STABILITY

### 22.1 No Crashes

- Any runtime error displays a fallback — never a white screen.
- An error boundary catches every client error.
- A global error boundary catches fatal errors and offers "Reload" or "Go Home."

### 22.2 No 404s

- Every route, every asset, every icon must exist.
- `apple-touch-icon`, `favicon`, `og-image` — all present.
- A custom 404 page that is on-brand and offers next steps.

### 22.3 No Console Errors

- No hydration mismatches.
- No missing dependencies in `useEffect`.
- No a11y warnings in the console.
- No `console.log` in production builds.

### 22.4 Health Checks

- `GET /api/health` returns `{ "status": "ok", "version": "x.y.z", "time": "ISO" }`.
- The endpoint does not require authentication.
- It is monitored by the deployment platform.

---

## 23. FUTURE EXPANSION

### 23.1 The Scale Rule

> The architecture must support 10 clinics, 100 clinics, 1,000 clinics, 100,000 clinics — without redesigning the core system.

### 23.2 Design for Global

- Multi-currency from day one.
- Multi-language from day one (English, Arabic, with RTL support).
- Multi-timezone from day one.
- Multi-region data residency from day one.

### 23.3 Design for the Network

- Every clinic is a tenant.
- Every tenant can join a network (with consent).
- Network Memory is anonymized and aggregated — never raw PHI.
- Cross-clinic analytics require explicit, audited opt-in.

### 23.4 Design for the Long Now

- Every database migration is forward-only.
- Every API version is supported for at least 24 months.
- Every feature flag has a documented sunset date.
- The system must be operable for 20 years without a full rewrite.

### 23.5 Design for the Ecosystem

- Veltra will eventually expose APIs to third-party developers.
- Every endpoint is designed as if it will be public one day.
- Webhooks are versioned and signed.

---

## 24. FINAL PRINCIPLE

> If a proposed feature makes the product more complicated than valuable, **reject it**.

Veltra is not a feature factory. Veltra is a **clinic operating system** that earns its place by disappearing.

Every line of code is a liability. Every feature is a maintenance burden. Every abstraction is a tax on the next engineer.

The best feature is the one we **did not build** — because the existing system already solved the problem.

> _Technology disappears._
> _Care remains._

---

## APPENDIX A: The Veltra Product Process

This constitution assumes the following product process, inspired by Apple:

1. **Vision** — What problem? Why must this exist?
2. **Product Principles** — What will we not do? What feeling must the user have?
3. **User Flows** — How does the doctor use Veltra from the first minute to the end of the day?
4. **Information Architecture** — What are the screens? Their relationships? Their states?
5. **Wireframes** — Boxes only. No color. No UI polish.
6. **Prototype** — Full flow. Transitions. Edge cases.
7. **High Fidelity Design (Figma)** — Colors, fonts, spacing, finalized here.
8. **Design System** — Buttons, cards, inputs, typography, icons, tokens, components.
9. **Engineering** — Implementation begins.

**The engineer implements, not decides.** UX decisions happen in Figma, not in code. If the Figma is wrong, fix the Figma — do not improvise in code.

Figma is the **Single Source of Truth**. Every Next.js screen is a faithful copy of the Figma, never the reverse.

---

## APPENDIX B: The Veltra Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State | Zustand (client) + TanStack Query (server) |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Real-time | WebSockets (Socket.IO) |
| Voice | Web Speech API + Whisper (server) |
| Storage | S3-compatible (MinIO in dev) |
| Auth | NextAuth.js + JWT + 2FA TOTP |
| Monitoring | Sentry (errors) + Vercel Analytics (product) |
| Deployment | Vercel (web) + Railway (backend) + Fly.io (region-specific) |

---

## APPENDIX C: The Veltra File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, signup, 2FA
│   ├── (workspace)/        # Authenticated workspace
│   ├── api/                # API route handlers
│   └── globals.css         # Global styles + design tokens
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── veltra/             # Veltra-specific components
├── lib/
│   ├── veltra-store.ts     # Zustand store
│   ├── specialties.ts      # Specialty configurations
│   ├── subscription-tiers.ts # Tier configurations
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Shared utilities
├── hooks/                  # Custom React hooks
└── types/                  # Shared TypeScript types
```

---

## SIGNATURE

This is **Veltra Engineering Constitution v1.0**.

It is the constitution that any AI, engineer, designer, or product manager must obey before writing a single line of code.

It will be versioned. It will evolve. But its **soul** will not change:

> _Technology disappears._
> _Care remains._

— Veltra, 2026
