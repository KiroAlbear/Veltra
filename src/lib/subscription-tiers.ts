// VELTRA Subscription Tier Configurations
//
// Pricing Strategy (signed off by CEO):
//
// PUBLIC PRICING (website):
//   - Veltra Platform: From $999/month
//   - Veltra Launch Program: From $3,000
//   - Enterprise: Custom Pricing
//
// FOUNDING PARTNER PROGRAM (private — first 10 clinics only):
//   - $699/month (3-Year Price Guarantee — not lifetime)
//   - Launch Program included (value: $3,000)
//   - Annual commitment required
//   - 30-day money-back guarantee
//   - Founding Partner badge
//   - Referral rewards (1 month free per successful referral)
//
// INTERNAL SALES MATRIX (not public — for sales team only):
//   - Foundation (1–3 docs):    $999/month   · Launch from $3,000
//   - Growth (4–15 docs):       $1,499/month · Launch from $5,000
//   - Multi-Site (2+ branches): $2,499/month · Launch from $7,500
//   - Enterprise (hospitals):   Custom       · Launch from $10,000+
//
// BILLING OPTIONS:
//   - Monthly:       $999/month
//   - Annual:        $9,990/year (2 months free — 17% off)
//   - 3-Year commit: $26,000 (best rate — for cash-positive clinics)
//
// RULE: Price is part of the brand identity. Offers change, not the price.
// RULE: Sales qualifies the customer first (ROI-based), then prices.
// RULE: Reject 70% of leads — only take clinics where Veltra is ROI-positive.

export type TierId = "platform" | "enterprise";

export interface TierCapability {
  label: string;
  platform: string | boolean;
  enterprise: string | boolean;
}

export interface TierConfig {
  id: TierId;
  name: string;
  tagline: string;
  description: string;
  priceMonthly: number | null; // null = Enterprise
  priceAnnual: number | null; // per year, billed annually
  price3Year: number | null; // one-time, 3-year commit
  priceLabel: string; // "Enterprise" for enterprise
  period: string; // "/month" or ""
  cta: string;
  featured?: boolean;
  badge?: string;
  accentColor: string;
  emoji: string;
  // Veltra Launch Program — always "From" on public site
  launchPrice: number | null; // null = included for Founding Partners
  launchLabel: string; // "From $3,000" / "Custom" / "Included"
  // Limits
  limits: {
    locations: number | "unlimited";
    users: number | "unlimited";
    patients: number | "unlimited";
    memoryRetentionDays: number | "unlimited";
    monthlyAppointments: number | "unlimited";
    storage: string;
  };
  included: string[];
  notIncluded: string[];
  screensEnabled: string[];
  support: {
    channels: string[];
    slaHours: number | null;
    accountManager: boolean;
  };
  demoUserId: string;
  sampleStats: { label: string; value: string; tone: "default" | "emerald" | "amber" }[];
}

export const TIERS: TierConfig[] = [
  {
    id: "platform",
    name: "Veltra Platform",
    tagline: "The Clinic Operating System.",
    description:
      "Everything you need to run your clinic — from the first call to the final follow-up. One platform, one price.",
    priceMonthly: 999,
    priceAnnual: 9990, // 2 months free
    price3Year: 26000, // best rate for 3-year commit
    priceLabel: "From $999",
    period: "/month",
    cta: "Book Demo",
    featured: true,
    badge: "Most Popular",
    accentColor: "bg-veltra-emerald/15 text-veltra-emerald",
    emoji: "⚡",
    launchPrice: 3000,
    launchLabel: "From $3,000",
    limits: {
      locations: 3,
      users: 15,
      patients: "unlimited",
      memoryRetentionDays: 730,
      monthlyAppointments: "unlimited",
      storage: "100 GB",
    },
    included: [
      "Up to 3 clinic locations",
      "15 team members",
      "Unlimited appointments",
      "Patient records + timeline",
      "Clinical Memory (2 years)",
      "Today's Brief (every morning)",
      "Voice notes (clinical memory)",
      "Lab results tracking",
      "Billing + payments",
      "Insurance claims",
      "Pharmacy inventory",
      "Reports & analytics",
      "Audit log (full history)",
      "Recovered Revenue analytics",
      "Email notifications",
      "Automated reminders",
      "Priority chat + email support",
      "4-hour response SLA",
    ],
    notIncluded: [
      "Network Memory (collective)",
      "Custom integrations + API",
      "Unlimited locations",
      "Dedicated account manager",
    ],
    screensEnabled: [
      "brief",
      "patients",
      "appointments",
      "timeline",
      "labs",
      "billing",
      "messages",
      "documents",
      "calendar",
      "intake",
      "import",
      "migrate",
      "security",
      "users",
      "audit",
      "reports",
      "claims",
      "inventory",
      "availability",
      "recurring",
      "settings",
    ],
    support: {
      channels: ["Priority chat", "Email", "Phone"],
      slaHours: 4,
      accountManager: false,
    },
    demoUserId: "u1",
    sampleStats: [
      { label: "Locations", value: "3", tone: "emerald" },
      { label: "Team seats", value: "15", tone: "emerald" },
      { label: "Memory", value: "2 years", tone: "emerald" },
      { label: "Storage", value: "100 GB", tone: "default" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For healthcare organizations.",
    description:
      "Unlimited scale. Collective memory across every clinic. Custom deployment. The network becomes the product.",
    priceMonthly: null,
    priceAnnual: null,
    price3Year: null,
    priceLabel: "Custom",
    period: "",
    cta: "Book Demo",
    accentColor: "bg-violet-500/15 text-violet-300",
    emoji: "🌐",
    launchPrice: null,
    launchLabel: "Custom",
    limits: {
      locations: "unlimited",
      users: "unlimited",
      patients: "unlimited",
      memoryRetentionDays: "unlimited",
      monthlyAppointments: "unlimited",
      storage: "Unlimited",
    },
    included: [
      "Unlimited clinic locations",
      "Unlimited team members",
      "Everything in Platform, plus:",
      "Network Memory (collective intelligence)",
      "Cross-location analytics",
      "Custom integrations + full API",
      "SSO + advanced security",
      "Dedicated account manager",
      "Custom Veltra Launch Program",
      "99.9% uptime SLA",
      "1-hour critical response SLA",
      "Quarterly business reviews",
    ],
    notIncluded: [],
    screensEnabled: [
      "brief",
      "patients",
      "appointments",
      "timeline",
      "labs",
      "billing",
      "messages",
      "documents",
      "calendar",
      "intake",
      "import",
      "migrate",
      "security",
      "users",
      "audit",
      "reports",
      "claims",
      "inventory",
      "availability",
      "recurring",
      "settings",
      "network",
    ],
    support: {
      channels: ["Dedicated manager", "Priority chat", "Phone", "Email"],
      slaHours: 1,
      accountManager: true,
    },
    demoUserId: "u5",
    sampleStats: [
      { label: "Locations", value: "∞", tone: "default" },
      { label: "Team seats", value: "∞", tone: "default" },
      { label: "Memory", value: "Unlimited", tone: "emerald" },
      { label: "Storage", value: "Unlimited", tone: "default" },
    ],
  },
];

export function getTier(id: TierId | string): TierConfig {
  return TIERS.find((t) => t.id === id) || TIERS[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDING PARTNER PROGRAM
// Private offer for first 10 qualifying clinics only.
// Never advertised on the public website with explicit pricing.
// ─────────────────────────────────────────────────────────────────────────────

export const FOUNDING_PARTNER = {
  maxClinics: 10,
  title: "Founding Partner Program",
  subtitle: "Limited to the first 10 clinics",
  description:
    "A private offer for the first 10 clinics we choose to launch with. Includes the Veltra Launch Program at no cost, a guaranteed rate for 3 years, and direct access to our founding team.",
  // Pricing
  monthlyPrice: 699,
  standardPrice: 999,
  discountPercent: 30,
  launchValue: 3000,
  // Terms
  priceGuaranteeYears: 3, // NOT lifetime — re-evaluate after 3 years
  annualCommitment: true,
  moneyBackGuaranteeDays: 30,
  // Benefits
  benefits: [
    `Platform at $699/month (3-Year Price Guarantee)`,
    "Veltra Launch Program included (value: $3,000)",
    "30-day money-back guarantee",
    "Direct access to founding team",
    "Founding Partner badge for your clinic",
    "Referral reward: 1 month free per successful referral",
    "Priority on new features",
    "Become a published case study",
  ],
  // Qualification criteria — sales uses this to filter
  qualification: [
    "3+ doctors (Foundation tier minimum)",
    "1,000+ patient visits/month",
    "Established clinic (2+ years operating)",
    "Willing to be a case study",
    "Annual commitment capacity",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL SALES MATRIX
// For sales team use only — never exposed on the public website.
// Sales qualifies the customer first (using the qualification questions),
// then selects the appropriate tier from this matrix.
// ─────────────────────────────────────────────────────────────────────────────

export interface SalesMatrixTier {
  id: "foundation" | "growth" | "multiSite" | "enterprise";
  name: string;
  doctorRange: string;
  monthlyPrice: number | null; // null = Custom
  monthlyLabel: string;
  launchFrom: number | null; // null = Custom
  launchLabel: string;
  description: string;
  typicalCustomer: string;
}

export const SALES_MATRIX: SalesMatrixTier[] = [
  {
    id: "foundation",
    name: "Foundation",
    doctorRange: "1–3 doctors",
    monthlyPrice: 999,
    monthlyLabel: "$999/month",
    launchFrom: 3000,
    launchLabel: "Launch from $3,000",
    description: "Single-location clinics, dental, dermatology, small specialty practices.",
    typicalCustomer: "Dental clinic, dermatology practice, psychiatry, cosmetic surgery",
  },
  {
    id: "growth",
    name: "Growth",
    doctorRange: "4–15 doctors",
    monthlyPrice: 1499,
    monthlyLabel: "$1,499/month",
    launchFrom: 5000,
    launchLabel: "Launch from $5,000",
    description: "Polyclinics and medical centers with multiple specialties under one roof.",
    typicalCustomer: "Multi-specialty medical center, polyclinic, IVF/fertility center",
  },
  {
    id: "multiSite",
    name: "Multi-Site",
    doctorRange: "2+ branches",
    monthlyPrice: 2499,
    monthlyLabel: "$2,499/month",
    launchFrom: 7500,
    launchLabel: "Launch from $7,500",
    description: "Clinic networks with multiple branches requiring cross-location memory.",
    typicalCustomer: "Clinic chain (2–10 branches), regional healthcare group",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    doctorRange: "Hospitals & networks",
    monthlyPrice: null,
    monthlyLabel: "Custom",
    launchFrom: 10000,
    launchLabel: "Launch from $10,000+",
    description: "Hospitals, large networks, government and insurance-backed healthcare groups.",
    typicalCustomer: "Hospital, government health authority, insurance group, large network",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BILLING OPTIONS (shown on pricing page)
// ─────────────────────────────────────────────────────────────────────────────

export const BILLING_OPTIONS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 999,
    period: "/month",
    note: "Flexible",
  },
  {
    id: "annual",
    label: "Annual",
    price: 9990,
    period: "/year",
    note: "2 months free · Save 17%",
    perMonth: 833,
  },
  {
    id: "3year",
    label: "3-Year Commit",
    price: 26000,
    period: "one-time",
    note: "Best rate · For established clinics",
    perMonth: 722,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SALES QUALIFICATION QUESTIONS
// Sales asks these BEFORE quoting any price.
// If the clinic doesn't qualify, we walk away — even if they want to pay.
// ─────────────────────────────────────────────────────────────────────────────

export const SALES_QUALIFICATION_QUESTIONS = [
  "How many doctors work in the clinic?",
  "How many reception staff do you have?",
  "How many patient visits per month?",
  "How many calls do you receive daily?",
  "What's your current no-show rate?",
  "What's your average revenue per patient?",
  "What systems are you currently using?",
  "Are you the decision-maker, or is there a board?",
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON ROWS (Platform vs Enterprise — public)
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_COMPARISON: TierCapability[] = [
  { label: "Clinic locations", platform: "3", enterprise: "Unlimited" },
  { label: "Team members", platform: "15", enterprise: "Unlimited" },
  { label: "Patient records", platform: "Unlimited", enterprise: "Unlimited" },
  { label: "Monthly appointments", platform: "Unlimited", enterprise: "Unlimited" },
  { label: "Clinical Memory retention", platform: "2 years", enterprise: "Unlimited" },
  { label: "Storage", platform: "100 GB", enterprise: "Unlimited" },
  { label: "Patient timeline + records", platform: true, enterprise: true },
  { label: "Today's Brief (daily)", platform: true, enterprise: true },
  { label: "Voice notes (clinical)", platform: true, enterprise: true },
  { label: "Lab results tracking", platform: true, enterprise: true },
  { label: "Billing + payments", platform: true, enterprise: true },
  { label: "Insurance claims", platform: true, enterprise: true },
  { label: "Pharmacy inventory", platform: true, enterprise: true },
  { label: "Audit log (full history)", platform: true, enterprise: true },
  { label: "Reports & analytics", platform: true, enterprise: true },
  { label: "Recovered Revenue analytics", platform: true, enterprise: true },
  { label: "Email notifications", platform: true, enterprise: true },
  { label: "Automated reminders", platform: true, enterprise: true },
  { label: "Network Memory (collective)", platform: false, enterprise: true },
  { label: "Cross-location analytics", platform: false, enterprise: true },
  { label: "Custom integrations + API", platform: false, enterprise: true },
  { label: "SSO + advanced security", platform: false, enterprise: true },
  { label: "Dedicated account manager", platform: false, enterprise: true },
  { label: "Email support", platform: true, enterprise: true },
  { label: "Priority chat + phone", platform: true, enterprise: true },
  { label: "Response SLA", platform: "4 hours", enterprise: "1 hour" },
  { label: "Uptime SLA", platform: "99.5%", enterprise: "99.9%" },
];
