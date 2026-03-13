"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const footerLinks = [
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Community Operation Policy", href: "/community-policy" },
  { name: "Announcement", href: "/announcement" },
  { name: "User Guide", href: "/guide" },
];

export function Footer() {
  const { language, setLanguage } = useLanguage();
  const languageLabel = language === "ko" ? "한국어" : "English";

  return (
    <footer className="w-full border-t border-border bg-background mt-16">
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Links */}
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 gap-2 text-sm text-muted-foreground"
              >
                <Globe className="w-4 h-4" />
                {languageLabel}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ko")}>한국어</DropdownMenuItem>
              <DropdownMenuItem>中文</DropdownMenuItem>
              <DropdownMenuItem>日本語</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Logo and Description */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-t border-border">
          <div className="flex items-start gap-4">
            {/* Logo (헤더와 동일) */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/pv-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span
                className="text-xl font-bold leading-none tracking-tight"
                style={{ color: "var(--brand-charcoal, #222222)" }}
              >
                PROPVIEW
              </span>
            </Link>

            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                Fast and accurate crypto news at your fingertips
              </p>
              <p className="text-sm text-muted-foreground">
                Partnership : freefeel0701@gmail.com
              </p>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 gap-2 text-sm"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </Button>
            <Button
              variant="outline"
              className="h-10 px-4 gap-2 text-sm"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Google Play
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-right">
            Copyright PropView. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
