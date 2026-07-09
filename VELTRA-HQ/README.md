# VELTRA HQ — The Operating System of the Company

> This is the company's brain. Every document, every decision, every standard lives here.
> When a new person joins, they read these files in order. When a decision is made, it's written here.
>
> _The company is the documentation. The documentation is the company._

---

## The 3 Master Files (read in order)

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | [`01-Master-Documentation.md`](./01-Master-Documentation.md) | 523 | The single source of truth. Mission, vision, principles, banned words, architecture, pricing, roadmap. |
| 2 | [`02-Brand-Book.md`](./02-Brand-Book.md) | 468 | The identity. Logo, colors, typography, voice, motion, iconography, do-not list. |
| 3 | [`03-Design-System.md`](./03-Design-System.md) | 908 | The pixels. Tokens, spacing, components, accessibility, QA checklist. |

**Total:** 1,899 lines of operating documentation.

---

## How to Use These Files

### If you're new to Veltra
1. Read `01-Master-Documentation.md` completely (30 min).
2. Read `02-Brand-Book.md` completely (20 min).
3. Skim `03-Design-System.md` (30 min — refer back as needed).
4. Read `VELTRA-CONSTITUTION.md` (engineering supplement, 977 lines).

### If you're making a decision
1. Check `01-Master-Documentation.md` §3 (Decision Priority).
2. Check the relevant section in `02` or `03`.
3. If still unclear, the CEO decides. The decision is then written into these files.

### If you're shipping a feature
1. Follow `03-Design-System.md` §20 (Design QA Checklist).
2. Follow `VELTRA-CONSTITUTION.md` §3 (Definition of Done).
3. If the feature changes architecture, update `01-Master-Documentation.md` §7.

---

## Document Hierarchy (when documents disagree)

| Priority | Document | Scope |
|----------|----------|-------|
| 1 | `01-Master-Documentation.md` | Product, brand, strategy, pricing |
| 2 | `VELTRA-CONSTITUTION.md` | Engineering, security, data, code |
| 3 | `02-Brand-Book.md` | Visual identity, voice, motion |
| 4 | `03-Design-System.md` | Tokens, components, accessibility |
| 5 | All other docs | Subject-specific (PRD, Roadmap, etc.) |

When `01` and `02`/`03` disagree on brand matters, `01` wins.
When `01` and the Constitution disagree on engineering, the Constitution wins.

---

## Future Files (planned, not yet created)

| # | File | Status | Priority |
|---|------|--------|----------|
| 04 | Product Requirements Document (PRD) | Planned | High |
| 05 | Website Specification | Planned | High |
| 06 | Component Library Inventory | Planned | Medium |
| 07 | Roadmap + Sprint Board | Planned | High |
| 08 | Sales Playbook | Planned | Medium |
| 09 | Marketing Playbook | Planned | Medium |
| 10 | Launch Program Operations | Planned | Low |
| 11 | Security Posture | Planned | Medium |
| 12 | Investor Materials | Future | Low |
| 13 | HR + Onboarding | Future | Low |
| 14 | Legal Templates | Future | Low |

---

## Maintenance

- **Owner:** CEO
- **Review cadence:** Quarterly (full read-through)
- **Update triggers:** Major release, customer interview, market shift, new hire
- **Version:** 1.0 (2026-07-08)

---

_VELTRA HQ is not a folder of documents. It is the operating system of the company._
