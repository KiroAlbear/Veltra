# VELTRA — Design & UX Constitution

> ⚠️ **This document is deprecated.** The canonical version is now **[VELTRA-CONSTITUTION.md](./VELTRA-CONSTITUTION.md)** (v1.0).
>
> The Constitution integrates all rules below plus: Decision Priority, Definition of Done, Performance Targets, Security & Compliance (HIPAA/GDPR/NPHIES), Data Philosophy, Database Rules, API Rules, UX Rules, Brand Voice & Copywriting, Demo Data Standards, and Future Expansion.
>
> This file is preserved for backwards compatibility. All new work should reference the Constitution.

---

# VELTRA — Design & UX Constitution (Legacy)

> الدستور. كل سطر كود، كل لون، كل font، كل interaction لازم يمشي على القواعد دي. لو فيه تعارض، القواعد دي بتكسب.

---

## 1. الفونت والـ Typography

### 1.1 العائلات (Fonts)
- **Inter** — لكل الـ body text, UI, numbers. افتراضي لكل حاجة.
- **Instrument Serif (Italic)** — للـ editorial moments بس: greetings, empty states, quotes, signatures. ممنوع للـ UI العادي.
- **JetBrains Mono** — للأرقام اللي محتاجة tabular alignment (times, IDs, amounts) وللـ code/keyboard hints.

### 1.2 الـ Scale (مقاسات ثابتة، مفيش ارتجال)
| Role | Size | Weight | Line-height | Letter-spacing |
|------|------|--------|-------------|----------------|
| Display (h1) | 2.5rem (40px) | 600 | 1.05 | -0.03em |
| Title (h2) | 1.25rem (20px) | 600 | 1.25 | -0.02em |
| Heading (h3) | 1rem (16px) | 600 | 1.3 | -0.015em |
| Body | 0.9375rem (15px) | 400 | 1.5 | -0.01em |
| Caption | 0.8125rem (13px) | 400 | 1.45 | -0.005em |
| Micro | 0.6875rem (11px) | 600 | 1.4 | 0.08em uppercase |

- **ممنوع** font-size أقل من 11px.
- **ممنوع** font-weight أقل من 400 للـ body text.
- كل الأرقام `tabular-nums` عشان alignment.

### 1.3 راحة العين
- نص أبيض نقي (#FFFFFF) **ممنوع** في dark mode — استخدم warm off-white (#EDE9E0).
- نص أسود نقي (#000000) **ممنوع** في light mode — استخدم deep navy (#1A2238).
- خلفية بيضاء نقية (#FFFFFF) **ممنوع** للـ body في light mode — استخدم warm off-white (#FAF8F4).
- خلفية سوداء نقية (#000000) **ممنوع** في dark mode — استخدم warmer midnight.

---

## 2. الألوان

### 2.1 Brand
- **Veltra Emerald** (#39CFA2) — للـ brand accent بس (logo, primary CTAs, success states).
- في dark mode، استخدم النسخة desaturated (oklch 0.72 0.13 165) عشان أقل chromatic aberration.
- في light mode، استخدم نسخة أغمق (oklch 0.62 0.13 165) عشان contrast.

### 2.2 Semantic
- **Emerald** = success (confirmed, paid, completed)
- **Amber** = warning (pending, due, reminder)
- **Red** = danger (no-show, overdue, destructive)
- **Violet** = neutral-warm (waiting, checked-in)
- **Blue/Cyan** = info (calls, lab results)
- ممنوع استخدم emerald للـ info — emerald للـ success بس.

### 2.3 الـ Opacity pattern
- Badges: `bg-{color}-500/10 text-{color}-300 border-{color}-500/20`
- ممنوع `bg-{color}-50` في dark mode (بيطلع غامق غلط).

---

## 3. الـ Spacing والـ Layout

### 3.1 Scale (8px base)
- `4px` (1) —细节
- `8px` (2) — tight gaps
- `12px` (3) — default small
- `16px` (4) — default
- `20px` (5) — section padding
- `24px` (6) — section gaps
- `32px` (8) — section breaks
- `48px` (12) — hero padding

### 3.2 Cards
- Padding: `p-6` (24px) للـ standard، `p-8` (32px) للـ hero/feature cards.
- Border: **ممنوع** borders على الـ cards — استخدم shadow بس.
- Radius: `rounded-2xl` (16px) للـ cards الكبيرة، `rounded-lg` (8px) للـ inline.

### 3.3 Rows
- List rows: `px-6 py-4` (24px/16px).
- Dividers بين الـ rows: `border-b border-border/40` — **مش** `divide-y`.
- آخر row مفيهوش border.

---

## 4. الحركة (Motion)

### 4.1 الـ Easing
- الكل يستخدم `cubic-bezier(0.22, 1, 0.36, 1)` — "ease-out-expo".
- Duration: `0.2s` للـ micro-interactions، `0.3s` للـ page transitions، `0.5s` للـ entrances.

### 4.2 Entrances
- Stagger: 0.05-0.08s بين الـ items.
- Initial: `opacity: 0, y: 8-12px`.
- Hover lift: `y: -2 to -4px` بـ spring (stiffness 400, damping 25).

### 4.3 ممنوع
- ممنوع animations infinite غير الـ LIVE pulse.
- ممنوع autoplay carousels.
- ممنوع spinners بدون timeout fallback.

---

## 5. Auth والـ Permissions

### 5.1 Login
- **كل** المستخدمين يدخلوا بـ email + password.
- مفيش "guest" أو "demo" بدون login.
- Demo mode: الـ demo users في قائمة منسدلة (one-click login) للـ investors.

### 5.2 Roles (4 roles)
| Role | يقدر يشوف | يقدر يعدّل |
|------|----------|-----------|
| **Admin** | كل حاجة | كل حاجة |
| **Doctor** | patients, appointments, timeline, brief | appointments (confirm/complete), patient notes, prescriptions |
| **Receptionist** | appointments, patients (basic) | appointments (book/check-in/cancel), patient contact info |
| **Nurse** | patients, timeline, vitals | vitals, check-in, notes |

### 5.3 Permission Guards
- كل screen يتشيك على `canAccess(role, screen)`.
- كل action button يتشيك على `canDo(role, action)`.
- لو المستخدم ماعندهوش صلاحية، الزر **مبيظهرش** (مش disabled).

### 5.4 Audit Log
- كل action يتسجل: `userId, action, target, timestamp, before, after`.
- الـ Admin يقدر يشوف الـ audit log كامل.

---

## 6. Search

### 6.1 Command Palette (⌘K)
- موجود في كل screen.
- يبحث في: screens, patients, appointments, actions, demo controls.

### 6.2 Client/Patient Search
- في الـ Patients screen: search بـ name, condition, doctor, phone, balance status.
- Results تظهر فوري (debounce 200ms).
- Empty state: "No one here. Try a different search." (editorial italic).

### 6.3 Global Search
- ⌘K يفتح command palette.
- يدعم: fuzzy match, recent searches, keyboard navigation (↑↓ Enter).

---

## 7. التنسيق والتظبيط (Polish)

### 7.1 Visual Hierarchy
- **نقطة تركيز واحدة** لكل screen.
- Brief → revenue hero number.
- Patients → grid of cards.
- Timeline → patient name + context box.
- Appointments → time column prominent.

### 7.2 Breathing Room
- Section padding: `py-12` minimum بين الأقسام الكبيرة.
- Card padding: `p-6` minimum.
- ممنوع stack أكتر من 4 cards في column بدون break.

### 7.3 Empty States
- كل empty state لازم يكون فيه: editorial italic message + CTA button.
- ممنوع "No data" سادة.

### 7.4 Loading States
- كل async action لازم فيه: spinner (Loader2) + disabled state + timeout (8s) → error toast.

### 7.5 Error States
- كل error toast لازم فيه: title + description + (optional) action button.
- ممنوع red screen of death — graceful fallback دايماً.

---

## 8. الـ Voice (الصوت)

### 8.1 القاعدة
- Veltra مش بيقول "I" أو "we".
- Veltra بيقول: اللي حصل، واللي اتعمل. Past tense, third person.
- "Appointment booked" — مش "We booked your appointment".
- "Reminder sent" — مش "I sent a reminder".

### 8.2 Forbidden Vocabulary
ممنوع الكلمات دي في أي مكان:
- AI, smart, intelligent, seamless, leverage, automagically
- next-gen, revolutionary, game-changing, cutting-edge
- innovative, disruptive, synergy

### 8.3 Editorial Moments
- Greetings: serif italic ("Good morning,")
- Empty states: serif italic ("Nothing needs you. Enjoy the quiet.")
- Signatures: serif italic ("Technology disappears. Care remains.")

---

## 9. الـ Demo Mode

### 9.1 Banner
- الـ demo banner يكون sticky فوق، emerald-tinted glass.
- يوضح: "Demo Clinic" + "Switch to Live" + "Reset".

### 9.2 Reset
- Reset يرجّع كل البيانات للأصل.
- بيظهر toast "Demo reset — All data restored."

### 9.3 Live Mode
- نفس البيانات، بس الـ banner بيقول "Live Mode".
- مفيش data change — بس نفسية (المستخدم "يمتلك" البيانات).

---

## 10. الـ Mobile

### 10.1 Layout
- Sidebar → hamburger drawer.
- Stat grids: 4 cols → 2 cols.
- Card grids: 3 cols → 1 col.
- Touch targets: minimum 44px.

### 10.2 Top Bar
- Hamburger + screen title + (theme toggle + notifications bell).

---

## 11. الـ Accessibility

### 11.1 Contrast
- كل text يحقق WCAG AA (4.5:1 للـ body, 3:1 للـ large).
- ممنوع text أقل من 11px.

### 11.2 Keyboard
- كل interactive element يتوصل بـ Tab.
- Focus ring ظاهر دايماً (`outline-ring`).
- Shortcuts: 1-4 للـ screens, ⌘K palette, ⌘/ shortcuts, ⌘Z undo, ⌘D theme.

### 11.3 Screen Readers
- كل icon button ليه `aria-label`.
- كل dialog ليه `DialogTitle` + `DialogDescription` (sr-only acceptable).

---

## 12. الـ Server Stability

### 12.1 لا crashes
- لو فيه runtime error، الـ page يعرض fallback مش white screen.
- Error boundary يلقط كل الـ client errors.

### 12.2 لا 404s
- كل route، كل asset، كل icon لازم يكون موجود.
- apple-touch-icon, favicon, OG image — كلها موجودة.

### 12.3 لا console errors
- مفيش hydration mismatches.
- مفيش missing dependencies.
- مفيش a11y warnings.

---

## الخلاصة

القواعد دي مش suggestions — دي contract. لو أي كود خالفها، أصلحه فوراً. لو أي feature جديد، اتأكد إنه ماشي على القواعد قبل ما يطلع.
