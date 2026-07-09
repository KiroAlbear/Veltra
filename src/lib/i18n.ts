/**
 * VELTRA — Internationalization (i18n) System
 *
 * Architecture:
 * - All 11 languages are active and fully translated on the landing page.
 * - App workspace UI is in English (Phase 2 will translate per market).
 * - Translation keys are flat: "hero.title", "pricing.cta", etc.
 * - Falls back to English if a key is missing.
 *
 * Medical terminology rule:
 * - Each language uses its native medical terms (not literal translations).
 * - "Clinical Memory" → "الذاكرة السريرية" (AR), "Mémoire Clinique" (FR), etc.
 * - Reviewed by native speakers before activation.
 *
 * Number formatting (global standard — like Apple, Stripe, Linear):
 * - All languages use Western numerals (0123456789)
 * - Arabic uses Western numerals too (not Arabic-Indic) — international convention
 * - Currency $ stays in Western form
 * - This matches apple.com/sa, stripe.com/ar, linear.app
 */

import { translations, type TranslationKey } from "./translations";
import { getLocale } from "./locales";

export type Language = "en" | "ar" | "fr" | "es" | "de" | "it" | "pt" | "tr" | "ja" | "ko" | "zh";

/**
 * Translate a key into the specified language.
 * Falls back to English if the key is missing in the target language.
 */
export function translate(key: TranslationKey, lang: Language = "en"): string {
  const dict = translations[lang] || translations.en;
  return dict[key] ?? translations.en[key] ?? key;
}

/**
 * Get translation outside of React (e.g., in store actions, utilities).
 */
export function tr(key: TranslationKey, lang: Language = "en"): string {
  return translate(key, lang);
}

/**
 * Get direction (ltr/rtl) for a language.
 */
export function getDirection(lang: Language): "ltr" | "rtl" {
  return getLocale(lang).direction;
}

/**
 * React hook for translations.
 * Usage in components:
 *   const { t, language, isRTL } = useTranslation();
 *   <h1>{t("hero.title1")}</h1>
 *
 * Note: Import useVeltra directly in your component and call this hook.
 */
export function createTranslator(language: Language) {
  return {
    t: (key: TranslationKey) => translate(key, language),
    language,
    isRTL: getDirection(language) === "rtl",
    dir: getDirection(language),
  };
}

/**
 * Format a number (always Western numerals — global standard).
 *
 * Examples:
 *   formatNumber(999) → "999"
 *   formatNumber(9990) → "9,990"
 */
export function formatNumber(num: number, _lang: Language = "en"): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format currency (always Western numerals with $ symbol).
 *
 * Examples:
 *   formatCurrency(999) → "$999"
 *   formatCurrency(9990) → "$9,990"
 */
export function formatCurrency(amount: number, _lang: Language = "en"): string {
  return `$${formatNumber(amount)}`;
}



