"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notice } from "@/types/database";

const BEGINNER_GUIDES = [
  {
    id: "intro",
    title: "PROPVIEW 초보 이용가이드",
    href: "/guide",
  },
  {
    id: "glossary",
    title: "프랍 용어사전",
    href: "/glossary",
  },
];

export function NoticeAndGuide() {
  const supabase = createClient();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [noticeRes, guideRes] = await Promise.all([
          supabase
            .from("notices")
            .select("*")
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(5),
          // guides 위젯은 DB가 아닌 초보 이용가이드(/guide)와 프랍용어사전(/glossary)로 고정 연동
          Promise.resolve({ data: null, error: null }),
        ]);

        if (!cancelled) {
          if (!noticeRes.error && noticeRes.data) {
            setNotices(noticeRes.data as Notice[]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("홈 위젯 공지/가이드 로딩 실패:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground dark:text-gray-100">
          <Megaphone className="h-4 w-4 text-orange-500" aria-hidden />
          공지사항
        </h2>
        <ul className="space-y-2">
          {loading && notices.length === 0 ? (
            <li className="text-sm text-muted-foreground">불러오는 중...</li>
          ) : notices.length === 0 ? (
            <li className="text-sm text-muted-foreground">등록된 공지사항이 없습니다.</li>
          ) : (
            notices.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/notice/${item.id}`}
                  className="block truncate text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-gray-300 dark:hover:text-gray-100"
                >
                  {item.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground dark:text-gray-100">
          <BookOpen className="h-4 w-4 text-yellow-500" aria-hidden />
          이용 가이드
        </h2>
        <ul className="space-y-2">
          {BEGINNER_GUIDES.map((item) => (
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
