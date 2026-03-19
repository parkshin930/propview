"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import type { Notice, NoticeType } from "@/types/database";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function NoticeDetailPage() {
  const params = useParams();
  const rawId = params?.id as string | undefined;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    content: string;
    type: NoticeType;
    is_pinned: boolean;
  }>({
    title: "",
    content: "",
    type: "일반" as NoticeType,
    is_pinned: false,
  });

  // 긴 글 붙여넣기 등 이벤트 폭주 상황에서도 stale closure 방지
  const formRef = useRef(form);
  const updateForm = (
    updater: (prev: typeof form) => typeof form
  ) => {
    setForm((prev) => {
      const next = updater(prev);
      formRef.current = next;
      return next;
    });
  };

  const supabase = createClient();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  // 관리자 여부는 profiles.role === "admin" 기준으로 명시적으로 판별
  const isAdminUser = profile?.role === "admin" && isAdmin(user, profile);

  useEffect(() => {
    if (!rawId) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("id", rawId)
          .single();

        if (error || !data) {
          console.error("공지 상세 조회 실패:", error);
          setNotice(null);
          return;
        }
        const typed = data as Notice;
        setNotice(typed);
        // (요청사항) 초기 상태: DB에서 받은 값을 폼에 정확히 주입
        const nextForm = {
          title: typed.title ?? "",
          content: typed.content ?? "",
          type: ((typed.type as NoticeType) ?? "일반") as NoticeType,
          is_pinned: Boolean(typed.is_pinned),
        };
        setForm(nextForm);
        formRef.current = nextForm;

        // 조회수 1 증가
        await supabase
          .from("notices")
          .update({ views: (data.views ?? 0) + 1 })
          .eq("id", data.id);
      } catch (e) {
        console.error("공지 상세 에러:", e);
        setNotice(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [rawId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto max-w-screen-md px-4 py-12 text-center">
          <p className="text-muted-foreground">불러오는 중입니다...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto max-w-screen-md px-4 py-12 text-center">
          <p className="text-muted-foreground">공지를 찾을 수 없습니다.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/notice">목록으로</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-6 gap-1 text-muted-foreground"
          >
            <Link href="/notice">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Link>
          </Button>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm min-h-[300px] h-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {form.is_pinned && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    중요
                  </span>
                )}
                <time className="text-sm text-muted-foreground">
                  {formatDate(notice.created_at)}
                </time>
              </div>
              {isAdminUser && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={(e) => {
                        if (!rawId || updating || !isAdminUser) return;
                        const next = e.target.checked;
                        // (요청사항) 체크박스는 state만 변경하고, 저장 버튼 클릭 시에만 DB 전송
                        updateForm((prev) => ({ ...prev, is_pinned: next }));
                      }}
                    />
                    이 글을 상단에 고정
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs gap-1"
                      onClick={() => {
                        // 편집 모드로 들어갈 때 현재 notice 값으로 폼 상태를 확실히 동기화
                        if (!isEditing) {
                          const nextForm = {
                            title: notice.title ?? "",
                            content: notice.content ?? "",
                            type: ((notice.type as NoticeType) ?? "일반") as NoticeType,
                            is_pinned: Boolean(notice.is_pinned),
                          };
                          setForm(nextForm);
                          formRef.current = nextForm;
                        }
                        setIsEditing((prev) => !prev);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      {isEditing ? "편집 취소" : "수정"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={async () => {
                        if (!isAdminUser || !notice) return;
                        const ok = window.confirm(
                          "이 공지를 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다."
                        );
                        if (!ok) return;
                        setUpdating(true);
                        try {
                          const { error } = await supabase
                            .from("notices")
                            .delete()
                            .eq("id", notice.id);
                          if (error) {
                            console.error(
                              "공지 삭제 실패 상세:",
                              (error as { code?: string })?.code,
                              (error as { message?: string })?.message,
                              (error as { details?: string })?.details,
                              error
                            );
                            return;
                          }
                          router.push("/notice");
                        } finally {
                          setUpdating(false);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      삭제
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    updateForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="공지 제목을 입력하세요"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">카테고리</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      updateForm((prev) => ({
                        ...prev,
                        type: e.target.value as NoticeType,
                      }))
                    }
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="일반">일반공지</option>
                    <option value="업데이트">업데이트</option>
                  </select>
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    updateForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="w-full min-h-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="공지 내용을 입력하세요"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      const nextForm = {
                        title: notice.title ?? "",
                        content: notice.content ?? "",
                        type: ((notice.type as NoticeType) ?? "일반") as NoticeType,
                        is_pinned: Boolean(notice.is_pinned),
                      };
                      setForm(nextForm);
                      formRef.current = nextForm;
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={updating}
                    onClick={async () => {
                      if (!isAdminUser || !notice) return;
                      const current = formRef.current;
                      const trimmedTitle = current.title.trim();
                      if (!trimmedTitle || !current.type) return;
                      setUpdating(true);
                      try {
                        if (!isAdminUser || !user?.id) {
                          console.error("공지 수정 실패 상세: 관리자 계정 또는 user_id 누락");
                          return;
                        }
                        const payload = {
                          id: notice.id,
                          title: trimmedTitle,
                          content: current.content,
                          type: current.type,
                          is_pinned: current.is_pinned,
                          user_id: user.id,
                          updated_at: new Date().toISOString(),
                        } satisfies Partial<Notice> & { id: string; user_id: string };

                        // (요청사항) 전송 직전 payload 로그
                        console.log(
                          "👉 [요청 데이터] notices 테이블로 전송할 Payload:",
                          payload
                        );

                        const { data, error } = await supabase
                          .from("notices")
                          .upsert(payload, { onConflict: "id" })
                          .select("*")
                          .single();

                        if (error || !data) {
                          // (요청사항) Supabase 에러 상세 로그
                          console.error(
                            "❌ [DB 거절 상세 원인]:",
                            JSON.stringify(error, null, 2)
                          );
                          return;
                        }

                        setNotice(data as Notice);
                        // 저장 결과를 폼에도 반영
                        const nextForm = {
                          title: (data as Notice).title ?? "",
                          content: (data as Notice).content ?? "",
                          type: (((data as Notice).type as NoticeType) ?? "일반") as NoticeType,
                          is_pinned: Boolean((data as Notice).is_pinned),
                        };
                        setForm(nextForm);
                        formRef.current = nextForm;
                        setIsEditing(false);
                        window.alert("수정이 완료되었습니다.");
                      } finally {
                        setUpdating(false);
                      }
                    }}
                  >
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-foreground mb-6">
                  {notice.title}
                </h1>
                <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {notice.content}
                </div>
              </>
            )}
          </article>

          <div className="mt-6 flex justify-end">
            <Button asChild variant="outline">
              <Link href="/notice">목록으로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
