# VELTRA — Design System
### Version 1.0 · The Source of Truth for Every Pixel

> This is the design system. Every value, every token, every component lives here.
> If a value is not in this document, it does not exist in the product.
>
> _The system is the brand made tangible._

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Tokens](#2-color-tokens)
3. [Typography Scale](#3-typography-scale)
4. [Spacing System](#4-spacing-system)
5. [Layout & Grid](#5-layout--grid)
6. [Border Radius](#6-border-radius)
7. [Shadows & Elevation](#7-shadows--elevation)
8. [Glassmorphism](#8-glassmorphism)
9. [Motion & Animation](#9-motion--animation)
10. [Component Patterns](#10-component-patterns)
11. [States (Empty, Loading, Error, Success)](#11-states)
12. [Accessibility](#12-accessibility)
13. [Responsive Breakpoints](#13-responsive-breakpoints)
14. [Iconography](#14-iconography)
15. [Forms & Inputs](#15-forms--inputs)
16. [Buttons](#16-buttons)
17. [Cards & Surfaces](#17-cards--surfaces)
18. [Navigation](#18-navigation)
19. [Data Display](#19-data-display)
20. [Design QA Checklist](#20-design-qa-checklist)

---

## 1. Design Principles

### The four principles

1. **Calm by default.** Every screen should feel like a quiet morning, not a busy ER.
2. **Density without clutter.** Show what's needed. Hide what's not. Never make the user hunt.
3. **Editorial over generic.** Veltra has a voice. The design reflects that — italic accents, considered spacing, premium feel.
4. **Accessible from day one.** WCAG AA is the floor, not the goal.

### The Apple test
Before shipping any screen, ask:
- _"Would Apple ship this?"_
- _"Would Stripe ship this?"_
- _"Would Linear ship this?"_

If the answer to all three is no, redesign.

---

## 2. Color Tokens

### Brand colors (CSS custom properties in `globals.css`)

```css
:root {
  /* Brand */
  --veltra-emerald: #39CFA2;
  --veltra-emerald-dark: #2BB888;
  --veltra-emerald-light: #E6FAF3;
  --veltra-emerald-glow: rgba(57, 207, 162, 0.35);
  --veltra-emerald-text: #0F7A5C;

  /* Neutrals */
  --veltra-midnight: #071323;
  --veltra-midnight-deep: #050D1A;
  --veltra-slate: #5B6772;
  --veltra-warm-white: #FAFAF7;
  --veltra-warm-gray: #F0F0F5;
}
```

### Tailwind utility classes (defined in `globals.css`)

```css
.bg-veltra-emerald        { background-color: var(--veltra-emerald); }
.bg-veltra-emerald-dark   { background-color: var(--veltra-emerald-dark); }
.bg-veltra-emerald-light  { background-color: var(--veltra-emerald-light); }
.text-veltra-emerald      { color: var(--veltra-emerald-text); }
.text-veltra-midnight     { color: var(--veltra-midnight); }
.text-veltra-slate        { color: var(--veltra-slate); }
.bg-veltra-warm-white     { background-color: var(--veltra-warm-white); }
.bg-veltra-midnight       { background-color: var(--veltra-midnight); }
.border-veltra-emerald    { border-color: var(--veltra-emerald); }
```

### Semantic colors (Tailwind defaults)

| Token | Light mode | Dark mode | Usage |
|-------|------------|-----------|-------|
| `background` | `oklch(0.985 0.003 90)` warm off-white | `oklch(0.13 0.02 240)` midnight | Page background |
| `foreground` | `oklch(0.18 0.02 240)` deep slate | `oklch(0.93 0.004 60)` warm off-white | Default text |
| `card` | `oklch(0.99 0.002 90)` near-white | `oklch(0.16 0.02 240)` elevated midnight | Card surfaces |
| `muted-foreground` | `oklch(0.45 0.01 240)` slate | `oklch(0.62 0.01 240)` muted slate | Secondary text |
| `border` | `oklch(0.92 0.005 90)` warm gray | `oklch(0.22 0.02 240)` subtle midnight | Borders, dividers |
| `sidebar` | `oklch(0.97 0.003 90)` | `oklch(0.15 0.02 240)` | Sidebar background |

### Status colors

| Status | Tailwind class | Usage |
|--------|----------------|-------|
| Success | `text-emerald-400` / `bg-emerald-500/10` | Positive, online, completed |
| Warning | `text-amber-400` / `bg-amber-500/10` | Caution, flagged, pending |
| Error | `text-red-400` / `bg-red-500/10` | Error, destructive, rejected |
| Info | `text-blue-400` / `bg-blue-500/10` | Information, neutral badge |

### Opacity scale (for muted variants)

| Opacity | Class suffix | Usage |
|---------|--------------|-------|
| 100% | (none) | Full color |
| 70% | `/70` | Secondary text on colored bg |
| 60% | `/60` | Tertiary text |
| 50% | `/50` | Disabled, placeholder |
| 40% | `/40` | Very muted |
| 30% | `/30` | Subtle borders |
| 20% | `/20` | Hover backgrounds |
| 15% | `/15` | Active states |
| 10% | `/10` | Icon chips, subtle badges |
| 5% | `/5` | Subtle section backgrounds |
| 3% | `/3` | Ambient glow |

---

## 3. Typography Scale

### Fonts

```css
/* Loaded via next/font in layout.tsx */
--font-inter: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
--font-instrument: "Instrument Serif", Georgia, serif;
```

### Type scale (defined in `globals.css`)

| Token | Size | Line height | Weight | Letter spacing | Class |
|-------|------|-------------|--------|----------------|-------|
| Display (h1) | 2.5rem (40px) | 1.08 | 600 | -0.032em | `text-display` or `h1` |
| Title (h2) | 1.25rem (20px) | 1.3 | 600 | -0.02em | `text-title` or `h2` |
| Heading (h3) | 1rem (16px) | 1.3 | 600 | -0.015em | `text-heading` or `h3` |
| Body | 0.9375rem (15px) | 1.6 | 400 | -0.01em | `text-body` |
| Caption | 0.8125rem (13px) | 1.55 | 400 | -0.005em | `text-caption` |
| Micro | 0.6875rem (11px) | 1.4 | 600 | 0.08em uppercase | `text-micro` |

### Display sizes (hero/section only)

| Class | Size | Usage |
|-------|------|-------|
| `text-[2.5rem]` | 40px | Section h2 |
| `text-[3rem]` | 48px | Hero h1 (mobile) |
| `text-[3.5rem]` | 56px | Section h2 (large) |
| `text-[4.5rem]` | 72px | Hero h1 (desktop) |
| `text-[5rem]` | 80px | Signature text |

### Editorial classes

```css
.text-editorial {
  font-family: var(--font-instrument), "Instrument Serif", Georgia, serif !important;
  font-weight: 400;
  letter-spacing: -0.018em;
}

.text-editorial-italic {
  font-family: var(--font-instrument), "Instrument Serif", Georgia, serif !important;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.012em;
}
```

### Typography rules
- **Tabular numbers:** add `tabular` class (or `font-variant-numeric: tabular-nums`) to all data tables, stats, prices.
- **Sentence case** everywhere. Title case only for `text-micro` eyebrows.
- **No all-caps** except `text-micro` (which is auto-uppercase).
- **Negative letter spacing** for large text; **positive** for `text-micro`.

---

## 4. Spacing System

### Base unit: 4px

All spacing uses multiples of 4px. Tailwind's default scale.

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | No spacing |
| `0.5` | 2px | Hairline adjustments |
| `1` | 4px | Tight inline spacing |
| `1.5` | 6px | Icon + text gap |
| `2` | 8px | Small gaps, list items |
| `2.5` | 10px | Button padding (vertical) |
| `3` | 12px | Card internal padding (small) |
| `4` | 16px | Default gap, card padding |
| `5` | 20px | Section internal |
| `6` | 24px | Card padding (large), section gaps |
| `8` | 32px | Section padding (vertical) |
| `10` | 40px | Larger section gaps |
| `12` | 48px | Hero spacing |
| `16` | 64px | Section spacing |
| `20` | 80px | Large section padding |
| `24` | 96px | Hero padding |
| `32` | 128px | Max section padding (`py-32`) |
| `40` | 160px | Ultra-large spacing |

### Spacing rules
1. **Vertical section padding:** `py-32` (128px) for major sections, `py-24` (96px) for compact.
2. **Card internal padding:** `p-6` (24px) for large cards, `p-4` (16px) for small.
3. **Button padding:** `h-10 px-4` (default), `h-11 px-7` (large), `h-8 px-3` (small).
4. **Gap between elements:** `gap-2` (8px) for tight, `gap-4` (16px) for normal, `gap-8` (32px) for sections.
5. **Never use arbitrary values** like `p-[14px]` — stick to the scale.

---

## 5. Layout & Grid

### Container widths

| Class | Max width | Usage |
|-------|-----------|-------|
| `max-w-sm` | 384px | Login form, narrow modals |
| `max-w-md` | 448px | Single-column forms |
| `max-w-lg` | 512px | Medium modals |
| `max-w-xl` | 576px | Final CTA |
| `max-w-2xl` | 672px | Pricing section, ROI calculator |
| `max-w-3xl` | 768px | Text-heavy sections |
| `max-w-4xl` | 896px | Pricing cards container |
| `max-w-5xl` | 1024px | Navbar, footer, hero |
| `max-w-6xl` | 1152px | App workspace |
| `max-w-7xl` | 1280px | Full-width dashboards |

### Grid patterns

```jsx
// 2-column pricing cards
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto" />

// 3-column feature grid
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4" />

// 4-column integrations
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" />

// 5-column specialties (compact)
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto" />
```

### Horizontal padding
- **Mobile:** `px-6` (24px)
- **Desktop:** `px-6` (24px) — same, content max-width handles the rest

### Vertical rhythm
- Hero sections: `py-32` (128px) or `min-h-screen`
- Standard sections: `py-32` (128px)
- Compact sections: `py-24` (96px)
- Tight sections: `py-20` (80px)

---

## 6. Border Radius

| Token | Value | Class | Usage |
|-------|-------|-------|-------|
| Sharp | 0px | `rounded-none` | Never (too harsh) |
| Small | 4px | `rounded` | Tiny badges |
| Medium | 6px | `rounded-md` | Buttons, inputs (small) |
| Large | 8px | `rounded-lg` | Default buttons, nav items, logo |
| XL | 12px | `rounded-xl` | Icon chips, medium cards |
| 2XL | 16px | `rounded-2xl` | Cards, modals (default) |
| 3XL | 24px | `rounded-3xl` | Large modals, hero cards |
| Full | 9999px | `rounded-full` | Avatars, dots, pills |

### Radius rules
- **Cards:** `rounded-2xl` (16px) — the Veltra standard.
- **Buttons:** `rounded-lg` (8px) — matches the logo.
- **Inputs:** `rounded-lg` (8px) — matches buttons.
- **Modals:** `rounded-3xl` (24px) — premium feel.
- **Avatars:** `rounded-full`.
- **Never mix** radii on the same surface.

---

## 7. Shadows & Elevation

### Shadow tokens (defined in `globals.css`)

```css
.veltra-shadow {
  box-shadow:
    0 1px 2px rgba(7, 19, 35, 0.04),
    0 2px 6px rgba(7, 19, 35, 0.03);
}

.veltra-shadow-lg {
  box-shadow:
    0 4px 12px rgba(7, 19, 35, 0.06),
    0 8px 24px rgba(7, 19, 35, 0.04);
}

.veltra-shadow-emerald {
  box-shadow: 0 8px 24px rgba(57, 207, 162, 0.25);
}
```

### Elevation levels

| Level | Class | Usage |
|-------|-------|-------|
| 0 (flat) | (none) | Default surfaces |
| 1 (subtle) | `veltra-shadow` | Cards, buttons |
| 2 (elevated) | `veltra-shadow-lg` | Modals, dropdowns, popovers |
| 3 (branded) | `veltra-shadow-emerald` | Primary CTA hover, brand moments |

### Shadow rules
1. **Shadows are subtle.** Veltra shadows are barely visible — they suggest depth, not scream it.
2. **No drop-shadows on text.** Ever.
3. **Dark mode shadows** are even more subtle (lower opacity).
4. **Hover increases shadow** by one level (e.g., `veltra-shadow` → `veltra-shadow-lg`).

---

## 8. Glassmorphism

### The Veltra glass effect

```css
.veltra-glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dark mode */
.dark .veltra-glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### Usage rules
1. **Glass is for elevated surfaces** — cards, modals, navbars.
2. **Never use glass on the page background.** The background is solid.
3. **Glass needs a colored backdrop** to be visible. Don't use on flat backgrounds.
4. **Blur: 20px** is the standard. No more, no less.
5. **Saturation: 180%** — gives the warm Veltra tint.

---

## 9. Motion & Animation

### The single easing

```css
--veltra-ease: cubic-bezier(0.16, 1, 0.3, 1);
```

**No other easing permitted** except `linear` (spinners) and `spring` (one-shot celebrations).

### Motion utility

```css
.veltra-transition {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Duration scale

| Duration | Usage |
|----------|-------|
| 150ms | Quick feedback (button press) |
| 200ms | Default transitions (`veltra-transition`) |
| 300ms | Modals, dropdowns |
| 400ms | Screen transitions |
| 500ms | Section reveals |
| 600-800ms | Hero animations, staggered reveals |

### Framer Motion patterns

```jsx
// Standard reveal
<motion.div
  initial={{ opacity: 0, y: 12 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
/>

// Staggered list
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
  />
))}

// Hover lift
<motion.button whileHover={{ y: -3 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} />
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All non-essential animations are disabled for users who request reduced motion.

---

## 10. Component Patterns

### Core components (shadcn/ui based)

| Component | File | Usage |
|-----------|------|-------|
| Button | `@/components/ui/button` | All actions |
| Input | `@/components/ui/input` | Text fields |
| Label | `@/components/ui/label` | Form labels |
| Badge | `@/components/ui/badge` | Status pills |
| Dialog | `@/components/ui/dialog` | Modals |
| DropdownMenu | `@/components/ui/dropdown-menu` | Context menus, selectors |
| Toast | `@/components/ui/toaster` | Notifications |
| Command | `@/components/ui/command` | Command palette (⌘K) |
| Tooltip | `@/components/ui/tooltip` | Hover hints |

### Veltra-specific components

| Component | File | Usage |
|-----------|------|-------|
| LandingPage | `@/components/veltra/landing-page` | Public marketing page |
| LoginScreen | `@/components/veltra/login-screen` | Email + password auth |
| Sidebar | `@/components/veltra/sidebar` | App navigation |
| BriefScreen | `@/components/veltra/brief-screen` | Today's Brief |
| DemoBanner | `@/components/veltra/demo-banner` | Demo mode indicator |
| TierBadge | `@/components/veltra/sidebar` | Subscription tier display |
| LanguageToggle | `@/components/veltra/language-toggle` | 11 languages |
| ThemeToggle | `@/components/veltra/theme-toggle` | Dark/light switch |
| CommandPalette | `@/components/veltra/command-palette` | ⌘K search |
| SubscriptionPreview | `@/components/veltra/subscription-preview` | Plan comparison modal |
| LiveChat | `@/components/veltra/live-chat` | Landing page chat widget |
| SupportChat | `@/components/veltra/support-chat` | In-app support |

### Component rules
1. **shadcn/ui is owned, not vendored.** We can modify the source files.
2. **Composition over configuration.** Small components, composed together.
3. **Forward ref** on all interactive components.
4. **`cn()` utility** for conditional classes — never string concatenation.

---

## 11. States

### Every interactive element must have all 4 states:

| State | Visual | Copy |
|-------|--------|------|
| **Default** | Normal | Action verb ("Save", "Book") |
| **Hover** | +1 shadow level, slight color shift | Same |
| **Active/Pressed** | -1 scale (0.98), darker | Same |
| **Disabled** | 50% opacity, `cursor-not-allowed` | Same |
| **Focus** | 2px emerald ring, 2px offset | Same |
| **Loading** | Spinner + "..." or "Saving..." | Present participle |
| **Error** | Red border, error message below | Specific ("Couldn't reach server") |
| **Success** | Brief checkmark, then revert | Quiet ("Saved.") |

### Empty states

Every list, table, and dashboard must have an empty state:

```jsx
<div className="text-center py-12">
  <Icon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
  <p className="text-body font-medium text-foreground">No patients yet</p>
  <p className="text-caption text-muted-foreground mt-1">
    Add your first patient to get started.
  </p>
  <Button className="mt-4">Add patient</Button>
</div>
```

### Loading states

- **Skeletons** for initial page loads (not spinners).
- **Spinners** only for actions < 800ms.
- **Skeleton + spinner** for actions > 800ms.

### Error states

```jsx
<div className="text-center py-12">
  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
  <p className="text-body font-medium text-foreground">Couldn't load patients</p>
  <p className="text-caption text-muted-foreground mt-1">
    Check your connection and try again.
  </p>
  <Button variant="outline" className="mt-4">Try again</Button>
</div>
```

---

## 12. Accessibility

### WCAG AA compliance (minimum)

| Rule | Standard |
|------|----------|
| Color contrast (body text) | 4.5:1 minimum |
| Color contrast (large text) | 3:1 minimum |
| Color contrast (UI components) | 3:1 minimum |
| Focus visible | 2px ring, 2px offset, emerald color |
| Keyboard navigation | Full Tab order, Enter/Space, Esc to close |
| Screen reader | All interactive elements labeled |
| Reduced motion | All non-essential animation disabled |

### Focus styles (defined in `globals.css`)

```css
*:focus-visible {
  outline: 2px solid var(--veltra-emerald);
  outline-offset: 2px;
  border-radius: 4px;
  transition: outline-offset 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Accessibility rules

1. **Every icon-only button has `aria-label`.**
2. **Every form input has a `<Label>` with `htmlFor`.**
3. **Every modal has `role="dialog"` and `aria-modal`.**
4. **Every image has `alt`** (or `alt=""` for decorative).
5. **Color is never the only indicator.** Add icons or text.
6. **Tab order is logical** — left-to-right, top-to-bottom.
7. **Esc closes modals and dropdowns.**
8. **`prefers-reduced-motion` respected.**

### Screen reader testing
- Test with VoiceOver (macOS/iOS) or NVDA (Windows).
- Every toast notification must have `role="status"` or `role="alert"`.
- Dynamic content changes must use `aria-live="polite"`.

---

## 13. Responsive Breakpoints

### Tailwind breakpoints (default)

| Breakpoint | Width | Class prefix | Target |
|------------|-------|--------------|--------|
| Mobile | < 640px | (none) | Phones |
| `sm` | ≥ 640px | `sm:` | Large phones, small tablets |
| `md` | ≥ 768px | `md:` | Tablets |
| `lg` | ≥ 1024px | `lg:` | Small laptops |
| `xl` | ≥ 1280px | `xl:` | Desktops |
| `2xl` | ≥ 1536px | `2xl:` | Large monitors |

### Mobile-first rule
Always write the mobile styles first, then enhance with `sm:`, `md:`, `lg:`.

```jsx
// ✅ Correct
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" />

// ❌ Wrong (desktop-first)
<div className="grid grid-cols-4 lg:grid-cols-1 gap-3" />
```

### Responsive patterns

```jsx
// Hide on mobile, show on desktop
<div className="hidden md:flex" />

// Show on mobile, hide on desktop
<div className="flex md:hidden" />

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row" />

// 1 column on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
```

---

## 14. Iconography

### Library
**Lucide React** — the only icon library.

### Icon sizes

| Size | Class | Usage |
|------|-------|-------|
| 12px | `h-3 w-3` | Micro badges, dividers |
| 14px | `h-3.5 w-3.5` | Inline with caption text |
| 16px | `h-4 w-4` | Default (buttons, nav) |
| 18px | `h-4.5 w-4.5` | Slightly larger emphasis |
| 20px | `h-5 w-5` | Section headers |
| 24px | `h-6 w-6` | Large displays |
| 32px | `h-8 w-8` | Hero icons |

### Icon rules
1. **Stroke-based** (Lucide default).
2. **Inherit color** from parent (`text-current`).
3. **Never fill icons** (no `fill="currentColor"`).
4. **Icon + text:** gap of `gap-1.5` (6px) or `gap-2` (8px).
5. **Icon chips:** `h-9 w-9 rounded-lg bg-veltra-emerald/10` with `h-4 w-4 text-veltra-emerald` icon inside.

---

## 15. Forms & Inputs

### Input heights (unified)

| Size | Height | Usage |
|------|--------|-------|
| Small | `h-8` (32px) | Inline search, compact forms |
| Default | `h-10` (40px) | All standard inputs |
| Large | `h-11` (44px) | Hero CTAs, primary actions |
| XLarge | `h-12` (48px) | Final CTA buttons |

**All inputs use `h-10`** unless explicitly justified.

### Input structure

```jsx
<div className="space-y-1.5">
  <Label htmlFor="email" className="text-micro text-muted-foreground">
    Email
  </Label>
  <div className="relative">
    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      id="email"
      type="email"
      className="pl-10 h-10 bg-background/50"
      placeholder="you@clinic.com"
      required
    />
  </div>
</div>
```

### Form rules
1. **Label above input** (not floating, not inline).
2. **Icon inside input** on the left (`pl-10`).
3. **Placeholder is subtle** — `text-muted-foreground/50`.
4. **Error message below input** in red, with icon.
5. **Required fields marked with `*`** in the label.
6. **`autoComplete` attributes** set correctly (`email`, `current-password`, etc.).
7. **`type` attributes** correct (`email`, `password`, `tel`, etc.).

---

## 16. Buttons

### Button variants

| Variant | Class | Usage |
|---------|-------|-------|
| Primary | `bg-veltra-emerald hover:bg-veltra-emerald-dark text-white` | Main CTAs |
| Secondary | `bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]` | Secondary actions |
| Outline | `border border-border/40 bg-background` | Tertiary actions |
| Ghost | `hover:bg-foreground/[0.05] text-foreground` | Nav items, subtle actions |
| Destructive | `bg-red-500 hover:bg-red-600 text-white` | Delete, remove |

### Button sizes

| Size | Height | Padding | Text |
|------|--------|---------|------|
| `sm` | `h-8` | `px-3` | `text-caption` |
| Default | `h-10` | `px-4` | `text-body` |
| `lg` | `h-11` | `px-7` | `text-body` |
| `xl` | `h-12` | `px-8` | `text-body` |

### Button rules
1. **One primary button per section.** Secondary actions are ghost/outline.
2. **Icon + text:** icon on left, gap `ml-1.5` or `mr-1.5`.
3. **Loading state:** spinner + "..." or present participle.
4. **Disabled state:** 50% opacity, `cursor-not-allowed`.
5. **Full-width buttons:** `w-full` (used in forms, modals).
6. **Never use `btn` class** — use shadcn `<Button>` component.

---

## 17. Cards & Surfaces

### Standard card

```jsx
<div className="veltra-glass rounded-2xl p-6 veltra-shadow">
  {/* content */}
</div>
```

### Card variants

| Variant | Class | Usage |
|---------|-------|-------|
| Default | `veltra-glass rounded-2xl p-6 veltra-shadow` | Standard cards |
| Featured | `+ ring-1 ring-veltra-emerald/30` | Pricing "Most Popular" |
| Subtle | `bg-foreground/[0.02] border border-border/20 rounded-2xl p-6` | Info boxes |
| Stat | `bg-foreground/[0.02] rounded-xl p-4` | Quick stats |

### Card rules
1. **Padding:** `p-6` (24px) for large, `p-4` (16px) for small.
2. **Radius:** `rounded-2xl` (16px) always.
3. **Shadow:** `veltra-shadow` default, `veltra-shadow-lg` on hover.
4. **Border:** `border border-border/20` for definition in light mode.
5. **Glass:** `veltra-glass` for elevated cards on textured backgrounds.

---

## 18. Navigation

### Navbar (landing page)

```jsx
<nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/20">
  <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
    {/* logo */}
    {/* nav items */}
    {/* actions */}
  </div>
</nav>
```

### Nav item

```jsx
<button className="px-3 h-8 rounded-lg hover:bg-foreground/[0.05] flex items-center text-caption text-muted-foreground hover:text-foreground veltra-transition">
  {label}
</button>
```

### Sidebar (app)

```jsx
<aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/40 md:bg-sidebar/50 md:backdrop-blur-xl">
  {/* brand row */}
  {/* nav items */}
  {/* user menu */}
</aside>
```

### Navigation rules
1. **Sticky navbar** on landing (`fixed top-0`).
2. **Sticky sidebar** in app (`sticky top-0`).
3. **Active item:** `text-veltra-emerald` + `bg-veltra-emerald/10`.
4. **Hover:** `bg-foreground/[0.05]` + `text-foreground`.
5. **Mobile:** simplify to icons only or hamburger.

---

## 19. Data Display

### Stat card

```jsx
<div className="rounded-xl p-4 bg-foreground/[0.02]">
  <p className="text-micro text-muted-foreground normal-case tracking-normal">Revenue Today</p>
  <p className="text-[1.5rem] font-semibold tabular text-foreground tracking-[-0.02em] mt-1">
    $4,850
  </p>
  <p className="text-micro text-emerald-400 normal-case tracking-normal">+12%</p>
</div>
```

### Data table

```jsx
<div className="veltra-glass rounded-2xl overflow-hidden">
  {/* header row */}
  <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-border/40 bg-foreground/[0.02]">
    <p className="text-micro text-muted-foreground">Column</p>
  </div>
  {/* data rows */}
  <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-border/20 text-caption">
    <p className="text-foreground">Value</p>
  </div>
</div>
```

### Badge / pill

```jsx
<Badge variant="secondary" className="text-micro normal-case tracking-normal font-normal">
  {label}
</Badge>

// Status badge
<Badge variant="outline" className="text-micro normal-case tracking-normal font-normal">
  <Clock className="mr-1 h-2.5 w-2.5" /> 4h SLA
</Badge>
```

### Data display rules
1. **Tabular numbers** (`tabular` class) for all stats.
2. **Right-align numbers** in tables.
3. **Color-code trends:** emerald for positive, red for negative, amber for neutral.
4. **Limit precision:** `$4,850` not `$4,850.00`.
5. **Empty cells:** show `—` not blank.

---

## 20. Design QA Checklist

Before shipping any screen, verify:

### Visual
- [ ] Matches Figma (or design intent)
- [ ] Dark + light mode both pass
- [ ] No layout shift on data load
- [ ] All images have alt text
- [ ] All icons are Lucide (no custom SVGs)
- [ ] No pure black or pure white
- [ ] Border radius consistent (`rounded-2xl` for cards)
- [ ] Shadows subtle (not heavy)

### Typography
- [ ] Only Inter + Instrument Serif
- [ ] Type scale tokens used (no arbitrary sizes)
- [ ] Editorial italic only on headline second line
- [ ] Tabular numbers on all data
- [ ] No all-caps (except `text-micro`)
- [ ] No exclamation marks

### Color
- [ ] Emerald used sparingly (CTAs, active states only)
- [ ] Semantic colors correct (emerald/amber/red/blue)
- [ ] Opacity scale used (no random alphas)
- [ ] WCAG AA contrast passes

### Interaction
- [ ] Hover states defined
- [ ] Focus-visible ring shows
- [ ] Active/pressed states defined
- [ ] Disabled states defined
- [ ] Loading states (skeleton or spinner)
- [ ] Empty states
- [ ] Error states

### Motion
- [ ] Veltra Ease only (`cubic-bezier(0.16, 1, 0.3, 1)`)
- [ ] Durations < 1s
- [ ] `prefers-reduced-motion` respected
- [ ] No parallax, no bounce

### Accessibility
- [ ] Keyboard navigable (Tab order)
- [ ] All icon buttons have `aria-label`
- [ ] All inputs have `<Label>`
- [ ] Color not the only indicator
- [ ] Screen reader tested

### Responsive
- [ ] Mobile-first CSS
- [ ] Tested at 375px, 768px, 1280px
- [ ] Touch targets ≥ 44×44px
- [ ] No horizontal scroll on mobile

### Code
- [ ] TypeScript strict passes
- [ ] ESLint passes
- [ ] No `any` types
- [ ] No inline styles (use Tailwind)
- [ ] `cn()` for conditional classes
- [ ] No `dangerouslySetInnerHTML` on user input

---

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-07-08 | Veltra Technologies | Initial design system. Extracted from globals.css + Constitution §12-15. |

---

## Cross-References

- **Master Documentation:** `VELTRA-HQ/01-Master-Documentation.md`
- **Brand Book:** `VELTRA-HQ/02-Brand-Book.md`
- **Engineering Constitution:** `VELTRA-CONSTITUTION.md` (engineering-specific rules)
- **CSS source of truth:** `src/app/globals.css`
- **Tailwind config:** `tailwind.config.ts`
- **Font loading:** `src/app/layout.tsx`
- **Component library:** `src/components/ui/` (shadcn/ui) + `src/components/veltra/`

---

_The system is not finished. The system is never finished. Every screen we ship is a vote for what Veltra becomes._
