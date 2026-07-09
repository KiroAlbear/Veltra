# VELTRA — Software Architecture Document

**Version:** 1.0
**Last updated:** July 9, 2026
**Status:** Living document

---

## 1. System Overview

VELTRA is a healthcare clinic operating system built as a multi-tenant SaaS platform.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Web App  │  │ Patient  │  │ Mobile   │  │  API    │ │
│  │ (Next.js)│  │ Portal   │  │ (PWA)    │  │ Clients │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
└───────┼──────────────┼──────────────┼──────────────┼──────┘
        │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼──────┐
│                   API Layer (Next.js API Routes)          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Auth │ │ Ptnt │ │ Appt │ │ Labs │ │ Bill │ │ Audit │  │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘  │
└─────┼────────┼────────┼────────┼────────┼────────┼────────┘
      │        │        │        │        │        │
┌─────▼────────▼────────▼────────▼────────▼────────▼────────┐
│                 Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  data-access.ts (Prisma wrapper)                     │ │
│  │  auth.ts (bcrypt + JWT)                              │ │
│  │  health-score.ts (intelligence engine)               │ │
│  │  global-search.ts (search engine)                    │ │
│  └──────────────────────┬───────────────────────────────┘ │
└─────────────────────────┼─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                  Persistence Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │S3/Storage│  │  Vercel  │  │
│  │(Prisma)  │  │(cache)   │  │(files)   │  │  (edge)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **State:** Zustand (persisted to localStorage)
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 20+ (via Next.js)
- **Database:** PostgreSQL 15 (via Prisma ORM)
- **Cache:** Redis (sessions, rate limiting)
- **Auth:** bcryptjs (password hashing) + jsonwebtoken (JWT)
- **File Storage:** S3-compatible (Supabase Storage)
- **Queue:** BullMQ (background jobs)

### Infrastructure
- **Hosting:** Vercel (frontend + API) + Supabase (database)
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry (errors) + Vercel Analytics
- **CI/CD:** GitHub Actions → Vercel
- **DNS:** Cloudflare

---

## 3. Database Schema

### Multi-Tenant Model
```
Tenant (Clinic)
  ├── Users (Staff)
  ├── Locations (Branches)
  ├── Patients
  │     ├── Timeline Events
  │     ├── Prescriptions
  │     ├── Lab Results
  │     ├── Vitals
  │     ├── Voice Notes
  │     ├── Documents
  │     └── Patient Flags
  ├── Appointments
  ├── Insurance Claims
  ├── Medications (Inventory)
  ├── Audit Logs
  └── Subscriptions
```

### Key Design Decisions
- **Row-Level Security:** Every query is scoped by `tenantId`
- **Soft Deletes:** Records have `deletedAt` field, never hard-deleted
- **Audit Trail:** Every mutation creates an `AuditLog` entry
- **Encryption:** PHI fields encrypted at application layer (in addition to DB encryption)
- **Indexing:** Composite indexes on `(tenantId, patientId, timestamp)` for common queries

---

## 4. Authentication & Authorization

### Auth Flow
```
1. User submits email + password
2. Server verifies password (bcrypt.compare)
3. If MFA enabled → verify TOTP code
4. Issue JWT token (24h expiry)
5. Client stores token in httpOnly cookie
6. Every request: verify JWT → attach user to request
```

### RBAC Model
- **10 Roles:** admin, doctor, receptionist, nurse, pharmacist, lab_tech, radiologist, finance, it_support, operations
- **25+ Permissions:** canPrescribe, canDispense, canAdjustInventory, canManageBilling, canManageClaims, canViewAudit, canResetDemo, canManageUsers, canImportFiles, etc.
- **Permission Check:** `canAccessWithTier(role, screen, tierScreens)` on every screen + API endpoint

### Session Management
- JWT in httpOnly cookie (XSS-proof)
- Refresh token in secure cookie (7-day expiry)
- Session timeout: 15 minutes inactivity (configurable)
- Concurrent session limit: 5 per user

---

## 5. API Design

### REST Conventions
- `GET /api/patients` — list
- `POST /api/patients` — create
- `GET /api/patients/:id` — get one
- `PATCH /api/patients/:id` — update
- `DELETE /api/patients/:id` — soft delete

### Response Format
```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

### Error Format
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

### Authentication
All endpoints (except `/api/health` and `/api/auth/login`) require:
```
Authorization: Bearer <jwt-token>
```

### Rate Limiting
- Auth endpoints: 5 requests / minute / IP
- API endpoints: 100 requests / minute / user
- File upload: 10 requests / minute / user

---

## 6. Security Architecture

### Defense in Depth
1. **Network:** Cloudflare WAF + DDoS protection
2. **Application:** CSP headers, XSS prevention, CSRF tokens
3. **Authentication:** bcrypt + JWT + MFA
4. **Authorization:** RBAC + tier-based feature flags
5. **Data:** AES-256 at rest, TLS 1.3 in transit
6. **Audit:** Every action logged, tamper-evident

### Security Headers (6)
- `X-Frame-Options: DENY` — clickjacking prevention
- `X-Content-Type-Options: nosniff` — MIME sniffing prevention
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000` — HSTS
- `Content-Security-Policy: default-src 'self'` — CSP

### Compliance
- **HIPAA:** BAA available, encryption, audit trail, access controls
- **GDPR:** Right to erasure, data portability, consent tracking
- **PDPL:** Saudi data residency option, local storage
- **SOC 2:** Type II audit scheduled Q4 2026
- **ISO 27001:** ISMS implementation Q1 2027

---

## 7. Scalability

### Horizontal Scaling
- Vercel serverless functions auto-scale
- Database read replicas for read-heavy queries
- Redis cluster for cache + sessions
- CDN for static assets

### Performance Targets
- Page load: < 2s (LCP)
- API response: < 200ms (p95)
- Search: < 100ms
- Patient open: < 200ms

### Capacity Planning
- 1 clinic (1-50 users): single database instance
- 100 clinics: read replicas + connection pooling
- 1000 clinics: sharding by region, separate databases per region
- 10000 clinics: multi-region deployment, eventual consistency

---

## 8. Disaster Recovery

### Backup Strategy
- **Database:** Daily full backup + continuous WAL streaming (point-in-time recovery, 30 days)
- **Files:** S3 cross-region replication
- **Configuration:** Git version control
- **Secrets:** AWS Secrets Manager (encrypted)

### Recovery Objectives
- **RPO (Recovery Point Objective):** 15 minutes (max data loss)
- **RTO (Recovery Time Objective):** 4 hours (max downtime)
- **RTO (Critical):** 1 hour (with failover to standby)

### Failover Plan
1. Detect failure (health check every 30s)
2. Automatic failover to standby region
3. DNS switch (Cloudflare)
4. Notify admins
5. Investigate root cause
6. Failback when primary is healthy

---

## 9. Development Workflow

### Branching Strategy
- `main` — production-ready
- `develop` — staging
- `feature/*` — new features
- `fix/*` — bug fixes
- `hotfix/*` — urgent production fixes

### CI/CD Pipeline
```
Push → Lint → Type Check → Unit Tests → Build → Deploy to Staging
  → E2E Tests → Manual Approval → Deploy to Production
```

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Husky pre-commit hooks
- Code review required (2 approvals)
- 80% test coverage required for critical paths

---

## 10. Monitoring & Observability

### Metrics
- **Application:** Request rate, error rate, response time
- **Database:** Query time, connection pool, slow queries
- **Infrastructure:** CPU, memory, disk, network
- **Business:** Active users, appointments booked, prescriptions written

### Logging
- **Application logs:** Structured JSON (Winston)
- **Audit logs:** Separate database table (7-year retention)
- **Access logs:** Vercel + Cloudflare
- **Error logs:** Sentry (with PII scrubbing)

### Alerting
- Error rate > 1% → Slack + email
- Response time > 500ms → Slack
- Database connection pool > 80% → PagerDuty
- Failed login attempts > 10/min → Security alert

---

## 11. Future Architecture (Phase 2+)

### Microservices Migration
When monolith becomes too large:
- **Auth Service** — authentication + authorization
- **Patient Service** — patient CRUD + timeline
- **Clinical Service** — prescriptions + labs + vitals
- **Billing Service** — invoices + claims + payments
- **Notification Service** — email + SMS + WhatsApp
- **AI Service** — OCR + LLM + clinical decision support

### Event-Driven Architecture
```
Patient Created → Event Bus →
  ├── Notification Service (send welcome)
  ├── Audit Service (log event)
  ├── Analytics Service (track metric)
  └── AI Service (generate summary)
```

### Multi-Region
- Primary: Saudi Arabia (Riyadh)
- Secondary: UAE (Dubai)
- Tertiary: EU (Frankfurt) — for GDPR compliance

---

## 12. Open Questions

1. **Database sharding strategy** — by tenant? by region? by date?
2. **Real-time sync** — WebSocket vs Server-Sent Events vs polling?
3. **AI model hosting** — OpenAI API vs self-hosted Llama?
4. **Mobile strategy** — React Native vs native iOS/Android?
5. **Offline mode** — conflict resolution strategy?
6. **FHIR/HL7** — which version? R4 or R5?

---

*This document is the single source of truth for VELTRA's architecture. Update it when the architecture changes.*
