"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { localeNames, type Locale } from "@/i18n/config";
import { useLocaleSwitch } from "@/hooks/useLocaleSwitch";

const footerLinkKeys = [
  { key: "termsOfService" as const, href: "/terms" },
  { key: "privacyPolicy" as const, href: "/privacy" },
  { key: "communityOperationPolicy" as const, href: "/community-policy" },
  { key: "announcement" as const, href: "/notice" },
  { key: "userGuide" as const, href: "/guide" },
] as const;

const locales: Locale[] = ["ko", "en", "ja", "zh"];

export function Footer() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("footer");
  const { setLocale } = useLocaleSwitch();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    // 현재 경로 유지한 채 서버 컴포넌트(레이아웃 등)에 새 locale 반영
    router.refresh();
  };

  return (
    <footer className="w-full border-t border-border bg-background mt-16">
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground min-w-0">
            {footerLinkKeys.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 gap-2 text-sm text-muted-foreground shrink-0 border-border bg-background hover:bg-muted dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Globe className="w-4 h-4" />
                {localeNames[locale] ?? locale}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

        {/* Logo and Description */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-t border-border">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="PropView"
                width={450}
                height={150}
                className="logo-theme-contrast h-[150px] w-auto shrink-0 object-contain"
              />
            </Link>

            <div className="space-y-1 min-w-0">
              <p className="font-semibold text-foreground">
                {t("slogan")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("partnership")}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-right">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
