"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "@/i18n/config";
import { COOKIE_LOCALE_KEY } from "@/i18n/config";
import { getMessages } from "@/lib/get-messages";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LocaleSwitchContextType = {
  setLocale: (locale: Locale) => void;
};

const LocaleSwitchContext = createContext<LocaleSwitchContextType | null>(null);

export function ClientIntlProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: Locale;
  initialMessages: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessagesState] = useState<Record<string, unknown>>(initialMessages);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setMessagesState(getMessages(newLocale));
    document.cookie = `${COOKIE_LOCALE_KEY}=${newLocale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(COOKIE_LOCALE_KEY, newLocale);
    }
  }, []);

  return (
    <LocaleSwitchContext.Provider value={{ setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleSwitchContext.Provider>
  );
}

export function useLocaleSwitch() {
  const ctx = useContext(LocaleSwitchContext);
  if (!ctx) {
    throw new Error("useLocaleSwitch must be used within ClientIntlProvider");
  }
  return { setLocale: ctx.setLocale };
}

export function useLocaleSwitchOptional() {
  return useContext(LocaleSwitchContext);
}
