/**
 * VELTRA — Translation Index
 *
 * Imports all language dictionaries and exports them as a single object.
 * Used by src/lib/i18n.ts
 */
import type { TranslationDict } from "./keys";
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { it } from "./it";
import { pt } from "./pt";
import { tr } from "./tr";
import { ja } from "./ja";
import { ko } from "./ko";
import { zh } from "./zh";

export const translations: Record<string, TranslationDict> = {
  en,
  ar,
  fr,
  es,
  de,
  it,
  pt,
  tr,
  ja,
  ko,
  zh,
};

export type { TranslationKey } from "./keys";
