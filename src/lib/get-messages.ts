import { defaultLocale, type Locale } from "@/i18n/config";
// Message files at project root (messages/*.json) - imported explicitly for bundler
import koMessages from "../../messages/ko.json";
import enMessages from "../../messages/en.json";
import jaMessages from "../../messages/ja.json";
import zhMessages from "../../messages/zh.json";

const validLocales: readonly Locale[] = ["ko", "en", "ja", "zh"];

const messagesMap: Record<Locale, Record<string, unknown>> = {
  ko: koMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
  ja: jaMessages as Record<string, unknown>,
  zh: zhMessages as Record<string, unknown>,
};

export function getValidLocale(locale: string | undefined): Locale {
  if (locale && validLocales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

export function getMessages(locale: Locale): Record<string, unknown> {
  return messagesMap[locale] ?? messagesMap[defaultLocale];
}
