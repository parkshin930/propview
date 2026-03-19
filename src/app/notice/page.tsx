"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PenSquare, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/admin";
import type { Notice, NoticeType } from "@/types/database";
import { useFreshForm } from "@/hooks/useFreshForm";

type TabKey = "all" | "general" | "update";

const CATEGORY_LABEL: Record<NoticeType, string> = {
  "일반": "일반",
  "업데이트": "업데이트",
};

const TAB_TO_TYPE: Record<Exclude<TabKey, "all">, NoticeType> = {
  general: "일반",
  update: "업데이트",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function NoticePage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<NoticeType>("일반");
  const [createIsPinned, setCreateIsPinned] = useState(false);
  const [purging, setPurging] = useState(false);

  const supabase = createClient();
  const { user, profile } = useAuth();
  const isAdminUser = profile?.role === "admin" && isAdmin(user, profile);

  const resetCreateForm = () => {
    setCreateTitle("");
    setCreateContent("");
    setCreateType("일반");
    setCreateIsPinned(false);
    setCreating(false);
  };

  // "어디서든 글쓰기 창을 열면 무조건 새 도화지"
  useFreshForm(resetCreateForm, { active: showCreate });

  // 기존(직접 SQL 삽입/더미) 데이터와 충돌 방지를 위해
  // 공지 데이터는 "홈페이지 UI에서만" 생성/수정되도록 자동 시딩을 제거했습니다.

  const loadNotices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("공지 조회 실패:", error);
        setNotices([]);
        return;
      }
      setNotices((data as Notice[]) || []);
    } catch (e) {
      console.error("공지 조회 에러:", e);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadNotices();
    })();
  }, []);

  const filtered = notices.filter((n) =>
    tab === "all" ? true : n.type === TAB_TO_TYPE[tab as Exclude<TabKey, "all">]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0B1120]">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-lg px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">
            공지사항
          </h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
            PropView 소식과 서비스 안내를 한눈에 확인하세요.
          </p>

          {isAdminUser && (
            <div className="mb-4 flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full px-3 text-xs"
                disabled={purging}
                onClick={async () => {
                  if (!isAdminUser) return;
                  const ok = window.confirm(
                    "notices 테이블의 공지사항을 전부 삭제합니다. 진행할까요?"
                  );
                  if (!ok) return;
                  setPurging(true);
                  try {
                    const res = await fetch("/api/admin/notices/purge", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    const json = (await res.json().catch(() => ({}))) as
                      | { success?: boolean; error?: string }
                      | Record<string, unknown>;
                    if (!res.ok) {
                      console.error("[purge-notices] failed:", json);
                      window.alert("전체 삭제에 실패했습니다. 콘솔을 확인해주세요.");
                      return;
                    }
                    await loadNotices();
                    window.alert("공지사항 전체 삭제가 완료되었습니다.");
                  } finally {
                    setPurging(false);
                  }
                }}
              >
                전체 삭제
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3 text-xs gap-1"
                onClick={() => setShowCreate(true)}
              >
                <PenSquare className="h-3.5 w-3.5" />
                공지 작성
              </Button>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-4 flex gap-2 border-b border-border pb-2">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-full ${
                tab === "all"
                  ? "bg-[#52c68f] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("all")}
            >
              전체
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-full ${
                tab === "general"
                  ? "bg-[#52c68f] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("general")}
            >
              일반
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded-full ${
                tab === "update"
                  ? "bg-[#52c68f] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("update")}
            >
              업데이트
            </button>
          </div>

          {/* 게시판 리스트 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-[#111827]">
            <div className="grid grid-cols-[4rem_6rem_1fr_6rem_6rem] gap-4 border-b border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-semibold text-foreground dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100">
              <div className="text-center">번호</div>
              <div>카테고리</div>
              <div>제목</div>
              <div className="text-right">작성일</div>
              <div className="text-right">조회수</div>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <li className="px-4 py-4 text-sm text-muted-foreground">
                  불러오는 중입니다...
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  등록된 공지사항이 없습니다.
                </li>
              ) : (
                filtered.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      href={`/notice/${item.id}`}
                      className={`grid grid-cols-[4rem_6rem_1fr_6rem_6rem] gap-4 px-4 py-4 text-sm transition items-center dark:text-gray-100 dark:hover:bg-gray-800/80 ${
                        item.is_pinned
                          ? "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-900/20"
                          : "hover:bg-gray-50/80"
                      }`}
                    >
                      <div className="text-center text-muted-foreground dark:text-gray-400 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            item.type === "업데이트"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-200"
                          }`}
                        >
                          {CATEGORY_LABEL[item.type]}
                        </span>
                      </div>
                      <div className="font-medium text-foreground dark:text-gray-100 truncate pr-2 flex items-center gap-2">
                        {item.is_pinned && (
                          <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-200">
                            중요
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="text-right text-muted-foreground dark:text-gray-400">
                        {formatDate(item.created_at)}
                      </div>
                      <div className="text-right text-muted-foreground dark:text-gray-400">
                        {item.views}
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>

      <Footer />

      {/* 관리자 전용 공지 작성 모달 */}
      {isAdminUser && showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 shadow-2xl px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground dark:text-gray-100">
                새 공지 작성
              </h2>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-gray-100"
                onClick={() => setShowCreate(false)}
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="공지 제목을 입력하세요"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">카테고리</label>
                <select
                  value={createType}
                  onChange={(e) =>
                    setCreateType(e.target.value as NoticeType)
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="일반">일반공지</option>
                  <option value="업데이트">업데이트</option>
                </select>
              </div>
              <textarea
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                className="w-full min-h-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="공지 내용을 입력하세요"
              />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={createIsPinned}
                    onChange={(e) => setCreateIsPinned(e.target.checked)}
                  />
                  이 글을 상단에 고정
                </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetCreateForm();
                  setShowCreate(false);
                }}
              >
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={creating}
                onClick={async () => {
                  if (!isAdminUser || !user?.id) {
                    console.error("공지 작성 실패 상세: 관리자 계정 또는 user_id 누락");
                    return;
                  }
                  const trimmedTitle = createTitle.trim();
                  if (!trimmedTitle || !createType) return;
                  setCreating(true);
                  try {
                    const { error } = await supabase.from("notices").insert({
                      title: trimmedTitle,
                      content: createContent,
                      type: createType,
                      user_id: user.id,
                      is_pinned: createIsPinned,
                      views: 0,
                    });
                    if (error) {
                      console.error(
                        "공지 작성 실패 상세:",
                        (error as { code?: string })?.code,
                        (error as { message?: string })?.message,
                        (error as { details?: string })?.details,
                        error
                      );
                      return;
                    }
                    resetCreateForm();
                    setShowCreate(false);
                    await loadNotices();
                    window.alert("작성이 완료되었습니다.");
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
