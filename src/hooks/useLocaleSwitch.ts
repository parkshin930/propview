"use client";

import { useLocaleSwitch as useLocaleSwitchContext } from "@/contexts/LocaleSwitchContext";

export function useLocaleSwitch() {
  return useLocaleSwitchContext();
}
