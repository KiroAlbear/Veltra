/**
 * VELTRA — Localization Configuration
 *
 * Architecture: Localization Ready from day one.
 * English is default. Arabic is fully supported (RTL).
 * Additional languages are added per market — not all at once.
 *
 * To add a new language:
 * 1. Add it to SUPPORTED_LOCALES below with status "active"
 * 2. Create /locales/{code}/ directory with translation files
 * 3. Test RTL/LTR, date formats, currency, medical terms
 *
 * Phase 1 (Launch): English + العربية
 * Phase 2 (Per market): Español, Français, Deutsch, Italiano, Português
 * Phase 3 (Per market): Türkçe, 日本語, 한국어, 中文
 */

export type LocaleCode = "en" | "ar" | "es" | "fr" | "de" | "it" | "pt" | "tr" | "ja" | "ko" | "zh";

export interface LocaleConfig {
  code: LocaleCode;
  name: string;          // Native name (e.g., "العربية")
  englishName: string;   // English name (e.g., "Arabic")
  flag: string;          // Emoji flag
  direction: "ltr" | "rtl";
  status: "active" | "coming-soon";
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  // All 11 languages — fully translated (landing page)
  { code: "en", name: "English", englishName: "English", flag: "🇺🇸", direction: "ltr", status: "active" },
  { code: "ar", name: "العربية", englishName: "Arabic", flag: "🇸🇦", direction: "rtl", status: "coming-soon" },
  { code: "fr", name: "Français", englishName: "French", flag: "🇫🇷", direction: "ltr", status: "active" },
  { code: "es", name: "Español", englishName: "Spanish", flag: "🇪🇸", direction: "ltr", status: "active" },
  { code: "de", name: "Deutsch", englishName: "German", flag: "🇩🇪", direction: "ltr", status: "active" },
  { code: "it", name: "Italiano", englishName: "Italian", flag: "🇮🇹", direction: "ltr", status: "active" },
  { code: "pt", name: "Português", englishName: "Portuguese", flag: "🇵🇹", direction: "ltr", status: "active" },
  { code: "tr", name: "Türkçe", englishName: "Turkish", flag: "🇹🇷", direction: "ltr", status: "active" },
  { code: "ja", name: "日本語", englishName: "Japanese", flag: "🇯🇵", direction: "ltr", status: "active" },
  { code: "ko", name: "한국어", englishName: "Korean", flag: "🇰🇷", direction: "ltr", status: "active" },
  { code: "zh", name: "中文", englishName: "Chinese", flag: "🇨🇳", direction: "ltr", status: "active" },
];

export const ACTIVE_LOCALES = SUPPORTED_LOCALES.filter((l) => l.status === "active");
export const COMING_SOON_LOCALES = SUPPORTED_LOCALES.filter((l) => l.status === "coming-soon");

export function getLocale(code: string): LocaleConfig {
  return SUPPORTED_LOCALES.find((l) => l.code === code) || SUPPORTED_LOCALES[0];
}

export function isRTL(code: string): boolean {
  return getLocale(code).direction === "rtl";
}

/**
 * Formatting helpers — locale-aware
 * These ensure dates, numbers, and currency respect the user's locale.
 */

export function formatDate(date: string | Date, locale: string = "en"): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    tr: "tr-TR",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
  };
  const intlLocale = localeMap[locale] || "en-US";
  return new Date(date).toLocaleDateString(intlLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number, locale: string = "en", currency: string = "USD"): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
  };
  const intlLocale = localeMap[locale] || "en-US";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, locale: string = "en"): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
  };
  const intlLocale = localeMap[locale] || "en-US";
  return new Intl.NumberFormat(intlLocale).format(num);
}

export function formatTime(date: string | Date, locale: string = "en"): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
  };
  const intlLocale = localeMap[locale] || "en-US";
  return new Date(date).toLocaleTimeString(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
