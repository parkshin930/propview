"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useLocaleSwitchOptional } from "@/contexts/LocaleSwitchContext";
import { COOKIE_LOCALE_KEY } from "@/i18n/config";
import { getValidLocale } from "@/lib/get-messages";

export function SyncLocaleFromStorage() {
  const locale = useLocale();
  const switchContext = useLocaleSwitchOptional();
  const didSync = useRef(false);

  useEffect(() => {
    if (!switchContext?.setLocale || didSync.current) return;
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(COOKIE_LOCALE_KEY) : null;
    if (!stored) return;
    const valid = getValidLocale(stored);
    if (valid === locale) return;
    didSync.current = true;
    switchContext.setLocale(valid);
  }, [locale, switchContext]);

  return null;
}
