import { TRANSLATIONS, DEFAULT_LANGUAGE_CODE, type LoginTranslation } from "./translations";

export function getTranslation(langCode: string): LoginTranslation {
  return TRANSLATIONS[langCode] ?? TRANSLATIONS[DEFAULT_LANGUAGE_CODE];
}
