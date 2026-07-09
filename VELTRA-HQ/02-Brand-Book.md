# VELTRA — Brand Book
### Version 1.0 · The Identity of the Clinic Operating System

> This is the brand. Every pixel, every word, every motion is a brand decision.
> When in doubt, ask: _"Does this feel like Veltra?"_
>
> If the answer is "it feels like every other SaaS," the answer is no.

---

## Table of Contents

1. [Brand Essence](#1-brand-essence)
2. [Logo](#2-logo)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Voice & Tone](#5-voice--tone)
6. [Motion](#6-motion)
7. [Iconography](#7-iconography)
8. [Photography & Imagery](#8-photography--imagery)
9. [Logo Usage Rules](#9-logo-usage-rules)
10. [Do Not](#10-do-not)
11. [Brand Assets Inventory](#11-brand-assets-inventory)

---

## 1. Brand Essence

### The one-sentence brand
> Veltra is the calm operating system for healthcare — the chief of staff every clinic wishes it had.

### Brand attributes

| We are | We are not |
|--------|------------|
| Calm | Frantic |
| Premium | Cheap |
| Quiet | Loud |
| Precise | Vague |
| Human | Corporate |
| Confident | Arrogant |
| Editorial | Generic |
| Considered | Rushed |

### The brand in three words
**Calm. Premium. Considered.**

### Brand promise (internal — never say this to customers)
> _We make the chaos of running a clinic disappear._

### The tagline (used in exactly 3 places)
> _Technology disappears. Care remains._

---

## 2. Logo

### The Veltra mark

The Veltra logo is a single character: **`V`** inside a rounded square.

```
┌──────┐
│      │
│  V   │   ← Veltra Emerald (#39CFA2) background
│      │      White "V" character
└──────┘
```

### Logo specifications

| Property | Value |
|----------|-------|
| Shape | Rounded square (`rounded-lg`) |
| Background color | Veltra Emerald `#39CFA2` |
| Character | "V" (uppercase, bold, sans-serif / Inter) |
| Character color | White `#FFFFFF` |
| Aspect ratio | 1:1 (always square) |
| Min size | 24×24 px (digital) / 8×8 mm (print) |
| Border radius | 8px at 28px size (scales proportionally) |

### Logo variants

| Variant | Usage | File |
|---------|-------|------|
| **Primary (symbol)** | Favicon, app icon, navbar | `/public/logo-symbol.png` |
| **Symbol + wordmark** | Footer, login, marketing | Inline HTML (V + "Veltra") |
| **Wordmark only** | Never alone — always with symbol | — |
| **Monochrome** | Print, partner co-branding | `/public/logo.svg` |

### Logo clear space

The logo needs breathing room equal to **half its height** on all sides.

```
        ┌── clear space ──┐
        │                  │
   ┌────┴──────────────────┴────┐
   │                            │
   │      ┌──────────────┐      │
   │      │              │      │
   │      │      V       │      │
   │      │              │      │
   │      └──────────────┘      │
   │                            │
   └────────────────────────────┘
```

---

## 3. Color System

### Primary palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Veltra Emerald** | `#39CFA2` | Primary accent, CTAs, brand color |
| **Veltra Emerald Dark** | `#2BB888` | Hover states, pressed states |
| **Veltra Emerald Light** | `#E6FAF3` | Subtle backgrounds, badges |
| **Veltra Emerald Glow** | `rgba(57, 207, 162, 0.35)` | Glow effects, ambient lighting |
| **Veltra Midnight** | `#071323` | Dark mode background, premium surfaces |
| **Veltra Midnight Deep** | `#050D1A` | Deepest dark, modal overlays |
| **Veltra Slate** | `#5B6772` | Secondary text, muted elements |
| **Veltra Warm White** | `#FAFAF7` | Light mode background (warm, not pure) |
| **Veltra Warm Gray** | `#F0F0F5` | Card backgrounds, dividers in light mode |

### Semantic colors

| Color | Hex | Usage |
|-------|-----|-------|
| Success / Live | `#10B981` (emerald-500) | Positive states, online indicators |
| Warning | `#F59E0B` (amber-500) | Cautions, flagged items |
| Error / Danger | `#EF4444` (red-500) | Errors, destructive actions |
| Info | `#3B82F6` (blue-500) | Informational badges |

### Light mode (default)

```css
--background: oklch(0.985 0.003 90);    /* warm off-white #FAF8F4 */
--foreground: oklch(0.18 0.02 240);     /* deep slate #1A1F2E */
--card: oklch(0.99 0.002 90);           /* near-white */
--muted-foreground: oklch(0.45 0.01 240); /* slate gray */
--border: oklch(0.92 0.005 90);         /* warm gray border */
```

### Dark mode (premium)

```css
--background: oklch(0.13 0.02 240);     /* midnight #071323 */
--foreground: oklch(0.93 0.004 60);     /* warm off-white #EDE9E0 */
--card: oklch(0.16 0.02 240);           /* elevated midnight */
--muted-foreground: oklch(0.62 0.01 240); /* muted slate */
--border: oklch(0.22 0.02 240);         /* subtle midnight border */
```

### Color rules

1. **Emerald is the only brand color.** Use it sparingly — CTAs, active states, brand moments.
2. **Never use pure black (`#000`) or pure white (`#FFF`).** Always the warm variants.
3. **Dark mode is the premium default.** Light mode is for daytime clinics.
4. **Emerald on Midnight = the Veltra signature.** Use this combination for hero moments.
5. **WCAG AA contrast minimum.** All text combinations pass 4.5:1 (body) or 3:1 (large text).

### Forbidden color combinations
- ❌ Emerald on warm white (low contrast in small text)
- ❌ Red on emerald (vibration)
- ❌ Pure black background (too harsh — use Midnight)
- ❌ More than 3 accent colors in one screen

---

## 4. Typography

### The two-font rule

Veltra uses **exactly two typefaces**. No third font. No icon-font. No exceptions.

| Font | Role | Source |
|------|------|--------|
| **Inter** | Body, UI, all sans-serif text | Google Fonts (`next/font/google`) |
| **Instrument Serif** | Editorial italic accents only | Google Fonts (`next/font/google`) |

### Why these two?

- **Inter** is the modern SaaS standard — Stripe, Vercel, Linear, GitHub, Figma all use it. It's the closest open-source equivalent to Apple's SF Pro.
- **Instrument Serif** adds editorial elegance without being a traditional serif (like Times). It's used in NYT digital, Linear's blog, Vercel's blog. It signals "premium publication," not "bank."

### Type scale

| Token | Size | Line height | Weight | Letter spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| `text-display` (h1) | 2.5rem (40px) | 1.08 | 600 | -0.032em | Hero headlines |
| `text-title` (h2) | 1.25rem (20px) | 1.3 | 600 | -0.02em | Section titles |
| `text-heading` (h3) | 1rem (16px) | 1.3 | 600 | -0.015em | Card titles |
| `text-body` | 0.9375rem (15px) | 1.6 | 400 | -0.01em | Paragraphs, default |
| `text-caption` | 0.8125rem (13px) | 1.55 | 400 | -0.005em | Labels, secondary |
| `text-micro` | 0.6875rem (11px) | 1.4 | 600 | 0.08em uppercase | Eyebrows, badges |

### Display sizes (hero only)

| Class | Size | Usage |
|-------|------|-------|
| `text-[3rem]` | 48px | Hero h1 (mobile) |
| `text-[4.5rem]` | 72px | Hero h1 (desktop) |
| `text-[3.5rem]` | 56px | Section h2 (large) |
| `text-[5rem]` | 80px | Signature text (e.g., "is ever forgotten.") |

### The editorial italic

The italic serif is the **Veltra signature**. It appears in headlines to add warmth and personality:

```html
<h1>
  The Clinic
  <br />
  <span class="text-editorial-italic text-muted-foreground">
    Operating System.
  </span>
</h1>
```

**Rules for editorial italic:**
- Use only on the **second line** of a headline, or a single emphasized word.
- Always paired with `text-muted-foreground` (slightly dimmed).
- Never used for body text, buttons, or UI labels.
- Never bold. Never underlined. Never colored.

### Typography rules

1. **No font weights below 400.** Light weights feel weak in healthcare.
2. **No font weights above 600.** Bold (700+) feels aggressive.
3. **Letter spacing is negative** for large text, positive for `text-micro`.
4. **Tabular numbers** (`font-variant-numeric: tabular-nums`) for all data tables and stats.
5. **Sentence case** everywhere. Title case only for `text-micro` eyebrows.
6. **No all-caps** in body or headlines. Only in `text-micro` eyebrows.

---

## 5. Voice & Tone

### The voice in one sentence
> We sound like the calmest person in the room.

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

### Tone by context

| Context | Tone | Example |
|---------|------|---------|
| Marketing site | Confident, calm | "Runs your clinic from the first call to the final follow-up." |
| UI labels | Terse, precise | "Book appointment" (not "Schedule a new appointment now") |
| Empty states | Warm, helpful | "No patients yet. Add your first patient to get started." |
| Error states | Calm, specific | "Couldn't reach the server. Try again in a moment." |
| Success states | Quiet, confirmed | "Saved." (not "🎉 Successfully saved your changes!") |
| Sales | Direct, respectful | "From $999/month. Talk to us about the Founding Partner Program." |
| Chat agents | Warm, slightly informal | "Happy to help. Are you interested in seeing the demo?" |

### Sentence rules
- Short sentences. Especially in UI.
- One idea per sentence.
- Active voice. "Veltra remembers" — not "It is remembered by Veltra."
- Concrete numbers. "$18,000 recovered" — not "significant revenue."
- No exclamation marks in product copy. (Chat agents: sparingly.)
- Periods, not ellipses, in UI.
- Oxford comma: yes, always.

### The tagline rule
_"Technology disappears. Care remains."_ appears in exactly three places:
1. The final CTA on the landing page
2. The login screen (small, italic)
3. Error pages (404, 500, generic)

It does **not** appear in: navbar, footer (as tagline), emails, sales decks, dashboard.

### Banned words (see Master Doc §5)
AI, smart, intelligent, seamless, leverage, automagically, next-gen, revolutionary, game-changing, cutting-edge, innovative, disruptive, synergy, world-class, best-in-class, robust, scalable, solution, empower, streamline, unlock.

---

## 6. Motion

### The single easing
Veltra uses **one easing curve** for all motion:

```css
--veltra-ease: cubic-bezier(0.16, 1, 0.3, 1);
```

This is "Veltra Ease" — a deceleration curve that starts fast and settles gently. It feels calm and intentional. **No other easing is permitted** except `linear` for spinners and `spring` for one-shot celebrations.

### Motion tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `veltra-transition` | 200ms | Veltra Ease | Hover states, toggles, default |
| Fast | 150ms | Veltra Ease | Quick feedback (button press) |
| Standard | 300ms | Veltra Ease | Modals opening, dropdowns |
| Slow | 500ms | Veltra Ease | Page transitions, large reveals |
| Signature | 600-800ms | Veltra Ease | Hero animations, staggered reveals |

### Motion principles

1. **Motion is communication.** Every animation tells the user something. If it doesn't, remove it.
2. **Fast in, slow out.** Elements appear quickly, settle gently. This is Veltra Ease.
3. **Stagger reveals.** Lists don't appear all at once — they stagger by 30-50ms.
4. **Never block.** No animation should make the user wait.
5. **Respect `prefers-reduced-motion`.** All non-essential animation disabled for users who request it.

### Forbidden motion
- ❌ Bounce effects (too playful for healthcare)
- ❌ Linear easing (feels robotic)
- ❌ Animations > 1s (feels slow)
- ❌ Multiple easings on the same screen (visual noise)
- ❌ Parallax on scroll (distracting, performance cost)

### The signature motion
The "Veltra settle" — elements fade in + slide up 8-12px over 500-800ms with Veltra Ease. Used for:
- Hero headline
- Section reveals on scroll
- Modal openings
- Card hovers (subtle 3px lift)

```jsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
/>
```

---

## 7. Iconography

### Icon library
**Lucide React** — the only icon library. No custom icons. No icon fonts.

### Icon rules
1. **Stroke-based, not filled.** Lucide's default style.
2. **Stroke width: 1.5px default, 2px for emphasis.**
3. **Size scale:** 12px (micro), 14px (caption), 16px (body), 20px (heading), 24px (display).
4. **Color:** inherit from parent text color, or `text-veltra-emerald` for active states.
5. **Never use emoji as icons** in the product UI. (Landing page specialty cards: emoji allowed for warmth.)

### Forbidden icon usage
- ❌ Filled icons (Material style)
- ❌ Colored icon backgrounds (except `bg-veltra-emerald/10` for icon chips)
- ❌ Multiple icon libraries
- ❌ SVG icons inline (use Lucide component instead)

---

## 8. Photography & Imagery

### Photography style (when used)
- **Natural light, not studio.** Real clinics, real people, real moments.
- **Warm tones.** Match the warm white background.
- **Diverse subjects.** Patients and staff of all backgrounds.
- **No stock-photo clichés.** No "doctor pointing at laptop." No "diverse team high-fiving."

### Illustration style
- **No illustrations.** Veltra uses product screenshots, not illustrations.
- The only "illustration" is the **Today's Brief mockup** on the landing page — which is a real product screenshot, not a drawing.

### Imagery rules
1. **Show the product, not a metaphor.** If you want to show "memory," show the timeline screen.
2. **No gradients on photos.** Photos are photos.
3. **No overlays with text on photos.** Use separate text + image blocks.
4. **Aspect ratio: 16:9 for screenshots, 1:1 for cards, 3:2 for editorial.**

---

## 9. Logo Usage Rules

### ✅ Do
- Use the emerald square + white "V" on dark or light backgrounds.
- Maintain clear space equal to half the logo height.
- Use the wordmark "Veltra" in Inter Semibold next to the symbol.
- Scale proportionally — never stretch.

### ❌ Do not
- Change the logo color (except monochrome for print).
- Add shadows, glows, or gradients to the logo.
- Rotate or skew the logo.
- Place the logo on busy backgrounds without a solid container.
- Use the wordmark without the symbol (except in text mentions).
- Animate the logo (except a subtle 0.5s fade-in on page load).

### Logo on photography
- Always place the logo on a solid emerald, midnight, or white container.
- Never place the logo directly on a photograph.

---

## 10. Do Not

### The brand anti-patterns

| ❌ Do not | ✅ Do instead |
|-----------|---------------|
| Use 3+ fonts | Use Inter + Instrument Serif only |
| Use pure black/white | Use Midnight / Warm White |
| Use multiple easings | Use Veltra Ease everywhere |
| Use exclamation marks | Use periods |
| Use buzzwords (AI, smart, seamless) | Describe what it actually does |
| Use stock illustrations | Show the product |
| Use emoji in product UI | Use Lucide icons |
| Use filled icons | Use stroke-based Lucide icons |
| Use more than 3 accent colors | Use Emerald + semantic colors only |
| Use gradients on text | Use editorial italic for emphasis |
| Use parallax scroll | Use simple fade + slide reveals |
| Use auto-playing video | Use static images or click-to-play |
| Use popups/modals on landing | Use inline sections |
| Use "Most Popular" without context | Only on pricing cards |
| Use the tagline everywhere | Only in 3 places (see §5) |

---

## 11. Brand Assets Inventory

### Logo files

| File | Format | Size | Usage |
|------|--------|------|-------|
| `/public/logo-symbol.png` | PNG | 512×512 | Primary logo (favicon, app icon, navbar) |
| `/public/logo.svg` | SVG | Vector | Monochrome logo (print, partner co-branding) |
| `/public/favicon.svg` | SVG | Vector | Browser favicon (modern) |
| `/public/favicon.png` | PNG | 32×32 | Browser favicon (legacy) |
| `/public/apple-touch-icon.png` | PNG | 180×180 | iOS home screen icon |
| `/public/og-image.svg` | SVG | 1200×630 | Open Graph + Twitter card |

### Manifest
- `/public/manifest.json` — PWA manifest (name, colors, icons)

### Source files (design)
- Figma master file: _to be created_ (see Design System doc)
- Logo source: _to be created_

### Color reference files
- `/src/app/globals.css` — CSS custom properties (source of truth)
- `/tailwind.config.ts` — Tailwind theme extension

### Typography reference
- `/src/app/layout.tsx` — `next/font` declarations
- `/VELTRA-HQ/03-Design-System.md` — full type scale

---

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-07-08 | Veltra Technologies | Initial brand book. Extracted from Constitution §10-15 + globals.css. |

---

_The brand is not what we say. The brand is what we ship._
