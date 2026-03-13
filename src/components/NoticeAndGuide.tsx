"use client";

import Link from "next/link";
import { Megaphone, BookOpen } from "lucide-react";

const NOTICES = [
  { id: 1, title: "3월 시스템 점검 안내", href: "/notice/1" },
  { id: 2, title: "출금 인증 절차 개선 안내", href: "/notice/2" },
  { id: 3, title: "이용약관 개정 안내", href: "/notice/3" },
];

const GUIDES = [
  { id: 1, title: "초보자 매매 가이드", href: "/guide/beginner" },
  { id: 2, title: "출금 인증 방법", href: "/guide/withdrawal" },
  { id: 3, title: "프랍 용어 사전", href: "/glossary" },
];

export function NoticeAndGuide() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground dark:text-gray-100">
          <Megaphone className="h-4 w-4 text-orange-500" aria-hidden />
          공지사항
        </h2>
        <ul className="space-y-2">
          {NOTICES.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block truncate text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-gray-300 dark:hover:text-gray-100"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground dark:text-gray-100">
          <BookOpen className="h-4 w-4 text-yellow-500" aria-hidden />
          이용 가이드
        </h2>
        <ul className="space-y-2">
          {GUIDES.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block truncate text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-gray-300 dark:hover:text-gray-100"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
