export const i18n = {
  defaultLocale: "en",
  locales: ["en", "ro"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

export function isValidLocale(locale: string): locale is Locale {
  return i18n.locales.includes(locale as Locale);
}

/**
 * Converts our locale code to a Storyblok language parameter.
 * The default locale (English) maps to undefined — Storyblok returns
 * default-language content when no language param is provided.
 */
export function toStoryblokLanguage(locale: Locale): string | undefined {
  return locale === i18n.defaultLocale ? undefined : locale;
}

/** Display names for the locale switcher */
export const localeNames: Record<Locale, string> = {
  en: "EN",
  ro: "RO",
};
