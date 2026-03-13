"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Megaphone, PenSquare } from "lucide-react";
import Link from "next/link";

const NOTICE_LIST = [
  {
    id: 1,
    no: 1,
    category: "중요",
    isPinned: true,
    title: "PropView 정식 런칭 및 포인트 시스템 안내",
    date: "2025.03.10",
  },
  {
    id: 2,
    no: 2,
    category: "공지",
    isPinned: false,
    title: "무바이트(Mubite) 점검 시간 안내",
    date: "2025.03.08",
  },
  {
    id: 3,
    no: 3,
    category: "공지",
    isPinned: false,
    title: "3월 시스템 점검 안내",
    date: "2025.03.01",
  },
  {
    id: 4,
    no: 4,
    category: "안내",
    isPinned: false,
    title: "출금 인증 절차 개선 안내",
    date: "2025.02.28",
  },
];

export default function NoticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0B1120]">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-lg px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">공지사항</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-8">
            PropView 소식과 서비스 안내를 한눈에 확인하세요.
          </p>

          {/* 게시판 리스트 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-[#111827]">
            {/* 테이블 헤더 - 모바일에서 숨기고 카드처럼 보이게 할 수 있으나, 한눈에 들어오게 테이블 유지 */}
            <div className="grid grid-cols-[4rem_5rem_1fr_6rem] gap-4 border-b border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-semibold text-foreground dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100">
              <div className="text-center">번호</div>
              <div>카테고리</div>
              <div>제목</div>
              <div className="text-right">날짜</div>
            </div>
            <ul className="divide-y divide-gray-100">
              {NOTICE_LIST.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/notice/${item.id}`}
                    className="grid grid-cols-[4rem_5rem_1fr_6rem] gap-4 px-4 py-4 text-sm transition hover:bg-gray-50/80 items-center dark:text-gray-100 dark:hover:bg-gray-800/80"
                  >
                    <div className="text-center text-muted-foreground dark:text-gray-400 font-medium">
                      {item.isPinned ? "—" : item.no}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.isPinned ? (
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                          중요
                        </span>
                      ) : (
                        <span className="text-muted-foreground dark:text-gray-400">{item.category}</span>
                      )}
                    </div>
                    <div className="font-medium text-foreground dark:text-gray-100 truncate pr-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 mr-2">
                          중요
                        </span>
                      )}
                      {item.title}
                    </div>
                    <div className="text-right text-muted-foreground dark:text-gray-400">{item.date}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />

      {/* 관리자 전용 글쓰기 버튼 (우측 하단, UI만) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="h-14 rounded-2xl bg-blue-600 px-6 shadow-lg hover:bg-blue-700"
          title="관리자 전용 · 글쓰기"
        >
          <PenSquare className="h-5 w-5 mr-2" />
          글쓰기
        </Button>
      </div>
    </div>
  );
}
