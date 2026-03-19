export const locales = ["ko", "en", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export const defaultLocale: Locale = "ko";

export const COOKIE_LOCALE_KEY = "NEXT_LOCALE";
