"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Moon, Sun, Menu, ChevronDown, LogOut, User, MessageSquare, Megaphone, Gift, BookOpen, HelpCircle, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { HeaderSearchModal } from "@/components/HeaderSearchModal";
import { NotificationBell } from "@/components/NotificationBell";
import { getStarIcons, getStarLabel } from "@/lib/rewards";
import { getLocalPointsDelta, getLocalCreditsDelta } from "@/lib/diary-storage";
import { isAdmin } from "@/lib/admin";

const navItems = [
  { key: "home" as const, href: "/" },
  { key: "withdrawalVerify" as const, href: "/community?category=profit" },
  { key: "todayStrategy" as const, href: "/strategy" },
  { key: "propCompare" as const, href: "/prop-compare" },
  { key: "tradingDiary" as const, href: "/trading-diary" },
  { key: "community" as const, href: "/community" },
];

const moreMenuItems = [
  { key: "notice" as const, href: "/notice", icon: Megaphone, iconColor: "text-orange-500" },
  { key: "airdrop" as const, href: "/airdrop", icon: Gift, iconColor: "text-yellow-500" },
  { key: "beginnerGuide" as const, href: "/guide", icon: BookOpen, iconColor: "text-green-500" },
  { key: "propGlossary" as const, href: "/glossary", icon: HelpCircle, iconColor: "text-blue-500" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isLoading, signOut } = useAuth();
  const t = useTranslations("common");
  const displayName =
    profile?.display_name ?? profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const pointsDelta = getLocalPointsDelta();
  const creditsDelta = getLocalCreditsDelta();
  const basePoints =
    (profile as unknown as { points?: number; point?: number } | null)?.points ??
    (profile as unknown as { points?: number; point?: number } | null)?.point ??
    0;
  const baseCredits =
    (profile as unknown as { credits?: number; credit?: number } | null)?.credits ??
    (profile as unknown as { credits?: number; credit?: number } | null)?.credit ??
    0;
  const points = user ? basePoints + pointsDelta : 0;
  const credits = user ? baseCredits + creditsDelta : 0;
  const starLabel = getStarLabel(basePoints);
  const starIcons = getStarIcons(basePoints);
  const isAdminUser = profile?.role === "admin";
  const isCertified = !!(profile?.is_certified ?? profile?.is_verified);
  const admin = isAdmin(user, profile);
  const [, setPointsTick] = useState(0);
  useEffect(() => {
    const onUpdate = () => setPointsTick((n) => n + 1);
    window.addEventListener("diary-points-updated", onUpdate);
    return () => window.removeEventListener("diary-points-updated", onUpdate);
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    if (moreDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreDropdownOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border" style={{ borderBottomWidth: "1px" }}>
      <div className="container mx-auto flex h-32 max-w-screen-xl items-center justify-between px-4">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="PropView"
              width={450}
              height={150}
              className="logo-theme-contrast h-[150px] w-auto shrink-0 object-contain translate-y-[4px]"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 min-h-0 flex-wrap">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative inline-flex items-center text-base font-medium transition-colors py-0 mb-0 pb-0 shrink-0 min-w-0 ${
                    isActive
                      ? "text-[#222222] dark:text-white"
                      : "text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                  }`}
                >
                  {t(item.key)}
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 top-full mt-1 h-0.5 rounded-full bg-[#2d9d78]"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
            <div className="relative" ref={moreDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                className="text-base font-medium text-muted-foreground hover:text-foreground gap-1 -ml-1 py-0 h-auto min-h-0 dark:text-white/70 dark:hover:text-white"
                onClick={() => setMoreDropdownOpen((v) => !v)}
              >
                {t("more")}
                <ChevronDown className={`h-4 w-4 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
              </Button>
              {moreDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1 min-w-[200px] rounded-lg bg-background py-1 shadow-md border border-border z-50 dark:bg-[#111827] dark:border-gray-700"
                  role="menu"
                >
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-base text-foreground hover:bg-muted transition-colors dark:text-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMoreDropdownOpen(false)}
                        role="menuitem"
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${item.iconColor}`} />
                        {t(item.key)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Search, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground dark:text-gray-100 dark:hover:text-white"
            onClick={() => setSearchOpen(true)}
            aria-label={t("search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          <NotificationBell />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground dark:text-gray-100 dark:hover:text-white"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-2 gap-2"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#2d9d78] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium max-w-[160px] truncate flex items-center gap-0.5">
                    {isCertified && !isAdminUser && (
                      <span className="shrink-0 text-xs" aria-label="출금 인증">
                        🔰
                      </span>
                    )}
                    {displayName}
                    {isAdminUser ? (
                      <span className="shrink-0 text-xs font-semibold text-black dark:text-white flex items-center gap-1" aria-label="관리자">
                        💎 관리자
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium text-yellow-500 flex items-center gap-0.5">
                        <span aria-label="등급" className="text-yellow-400">
                          {starIcons}
                        </span>
                        <span className="text-[11px] text-muted-foreground dark:text-gray-400">
                          {starLabel}
                        </span>
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-[#111827] dark:border-gray-700 dark:text-gray-100">
                <div className="px-2 py-2 dark:text-gray-100">
                  <p className="text-sm font-medium flex items-center gap-1 flex-wrap">
                    {isCertified && !isAdminUser && (
                      <span className="shrink-0 text-xs" aria-label="출금 인증">
                        🔰
                      </span>
                    )}
                    {displayName}
                    {isAdminUser ? (
                      <span className="text-xs font-semibold text-black dark:text-white flex items-center gap-1" aria-label="관리자">
                        💎 관리자
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-yellow-500 flex items-center gap-0.5">
                        <span aria-label="등급" className="text-yellow-400">
                          {starIcons}
                        </span>
                        <span className="text-[11px] text-muted-foreground dark:text-gray-400">
                          {starLabel}
                        </span>
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {t("pointsCredits", { points, credits })}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/community" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    {t("communityLink")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mypage" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("myProfile")}
                  </Link>
                </DropdownMenuItem>
                {admin && (
                  <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4" />
                    {t("admin")}
                  </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:flex h-9 px-4 rounded-full border-border text-foreground hover:bg-muted"
            >
              <Link href="/auth">
                {t("logIn")}
              </Link>
            </Button>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-border dark:bg-[#111827] dark:border-gray-700">
              <nav className="flex flex-col gap-5 mt-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`text-lg font-medium transition-colors dark:text-gray-100 ${
                        isActive ? "text-[#2d9d78] dark:text-[#2d9d78]" : "text-foreground hover:text-[#2d9d78]"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {t(item.key)}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-border dark:border-gray-700">
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-3">{t("more")}</p>
                  <div className="flex flex-col gap-2">
                    {moreMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="flex items-center gap-3 text-base text-foreground hover:text-[#2d9d78] transition-colors dark:text-gray-100 dark:hover:text-[#2d9d78]"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${item.iconColor}`} />
                          {t(item.key)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {user ? (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#2d9d78] flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium flex items-center gap-1 flex-wrap">
                          {isCertified && !isAdminUser && (
                            <span className="shrink-0 text-xs" aria-label="출금 인증">
                              🔰
                            </span>
                          )}
                          {displayName}
                          {isAdminUser ? (
                            <span className="text-xs font-semibold text-black dark:text-white flex items-center gap-1" aria-label="관리자">
                              💎 관리자
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-yellow-500 flex items-center gap-0.5">
                              <span aria-label="등급" className="text-yellow-400">
                                {starIcons}
                              </span>
                              <span className="text-[11px] text-muted-foreground dark:text-gray-400">
                                {starLabel}
                              </span>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("pointsCredits", { points, credits })}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    asChild
                    className="mt-4 w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/auth">
                      {t("signIn")}
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <HeaderSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
