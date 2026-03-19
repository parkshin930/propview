"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { localeNames, type Locale } from "@/i18n/config";
import { useLocaleSwitch } from "@/hooks/useLocaleSwitch";

const locales: Locale[] = ["ko", "en", "ja", "zh"];

export function PaybackButton() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { setLocale } = useLocaleSwitch();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    router.refresh();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-12 px-5 rounded-full shadow-lg border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground gap-2 transition-colors"
            variant="outline"
          >
            <div className="w-8 h-8 rounded-full bg-[#2d9d78] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium min-w-[4ch]">{localeNames[locale] ?? locale}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="min-w-[140px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
            >
              {localeNames[loc]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
