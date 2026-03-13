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
import { Search, Moon, Sun, Menu, ChevronDown, LogOut, User, MessageSquare, Megaphone, Gift, BookOpen, HelpCircle, Bell, Shield } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeaderSearchModal } from "@/components/HeaderSearchModal";
import { getRankLabel } from "@/lib/rewards";
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
  const { t } = useLanguage();
  const displayName =
    profile?.display_name ?? profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const pointsDelta = getLocalPointsDelta();
  const creditsDelta = getLocalCreditsDelta();
  const points = user ? (profile?.points ?? 5000) + pointsDelta : 0;
  const credits = user ? (profile?.credits ?? 1000) + creditsDelta : 0;
  const rankLabel = user ? "마스터" : getRankLabel(profile?.points ?? 0, profile?.rank_override);
  const showCrown = !!user;
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnreadNotif] = useState(true); // 알림 있음 시 빨간 점 표시
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (moreDropdownOpen || notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreDropdownOpen, notifOpen]);

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
      <div className="container mx-auto flex h-14 max-w-screen-xl items-center justify-between pl-6 pr-4">
        {/* Logo + Navigation: 세로 중앙 정렬 (텍스트 중앙선 일치) */}
        <div className="flex items-center gap-6 min-h-0">
          <Link href="/" className="flex items-center gap-2 shrink-0 py-0">
            <img
              src="/pv-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="text-xl font-bold leading-none tracking-tight text-[#222222] dark:text-white">
              PROPVIEW
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 min-h-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative inline-flex items-center text-base font-medium transition-colors py-0 mb-0 pb-0 ${
                    isActive
                      ? "text-[#222222] dark:text-white"
                      : "text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white"
                  }`}
                >
                  {t[item.key]}
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
                {t.more}
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
                        {t[item.key]}
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
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </Button>

          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative text-muted-foreground hover:text-foreground dark:text-gray-100 dark:hover:text-white"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="알림"
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotif && (
                <span
                  className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"
                  aria-hidden
                />
              )}
            </Button>
            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-border bg-background shadow-lg py-2 z-50 dark:bg-[#111827] dark:border-gray-700"
                role="menu"
              >
                <div className="px-4 py-2 border-b border-border dark:border-gray-700">
                  <p className="text-sm font-semibold text-foreground dark:text-gray-100">알림</p>
                </div>
                <Link
                  href="/trading-diary"
                  className="flex gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors text-foreground dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setNotifOpen(false)}
                  role="menuitem"
                >
                  <span className="text-lg shrink-0" aria-hidden>🎉</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">레벨 업! Lv.2 트레이더가 되셨습니다.</p>
                  </div>
                </Link>
                <Link
                  href="/airdrop"
                  className="flex gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors text-foreground dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setNotifOpen(false)}
                  role="menuitem"
                >
                  <span className="text-lg shrink-0" aria-hidden>🟡</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">포인트 적립: 매매일지 작성으로 50 P를 획득했습니다.</p>
                  </div>
                </Link>
                <Link
                  href="/community"
                  className="flex gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors text-foreground dark:text-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setNotifOpen(false)}
                  role="menuitem"
                >
                  <span className="text-lg shrink-0" aria-hidden>💬</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">&apos;트레이더A&apos;님이 회원님의 글에 댓글을 남겼습니다.</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

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
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate flex items-center gap-0.5">
                    {displayName}
                    {showCrown && <span className="ml-0.5 inline-block text-base" aria-label="마스터">👑</span>}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-[#111827] dark:border-gray-700 dark:text-gray-100">
                <div className="px-2 py-2 dark:text-gray-100">
                  <p className="text-sm font-medium flex items-center gap-1">
                    {displayName}
                    {showCrown && <span className="ml-0.5 inline-block text-base" aria-label="마스터">👑</span>}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{rankLabel}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    포인트 {points} P · 크레딧 {credits} C
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/community" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    Community
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {admin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      관리자 (포인트 회수)
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:flex h-9 px-4 rounded-full border-border text-foreground hover:bg-muted gap-2"
            >
              <Link href="/auth">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t.logIn}
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
                      {t[item.key]}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-border dark:border-gray-700">
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-3">{t.more}</p>
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
                          {t[item.key]}
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
                        <p className="font-medium flex items-center gap-1">
                          {displayName}
                          {showCrown && <span className="ml-0.5 inline-block text-base" aria-label="마스터">👑</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{rankLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          포인트 {points} P · 크레딧 {credits} C
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
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t.signIn}
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
