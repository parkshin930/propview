"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { getStarIcons, getStarLabel } from "@/lib/rewards";
import { getLocalPointsDelta, getLocalCreditsDelta } from "@/lib/diary-storage";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";

type ActiveSection = "blocks" | "profile";

interface BlockedUser {
  id: string;
  profile: Profile | null;
}

export default function MyPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const [nicknameInput, setNicknameInput] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const points = basePoints + pointsDelta;
  const credits = baseCredits + creditsDelta;
  const isAdminUser = profile?.role === "admin";
  const starLabel = getStarLabel(points);
  const starIcons = getStarIcons(points);

  const canChangeNickname = useMemo(() => {
    const last = profile?.last_nickname_change_date;
    if (!last) return true;
    const lastDate = new Date(last);
    const nextAllowed = new Date(lastDate);
    nextAllowed.setDate(lastDate.getDate() + 30);
    return new Date() >= nextAllowed;
  }, [profile?.last_nickname_change_date]);

  // 차단 목록 로딩
  const loadBlockedUsers = async () => {
    if (!user) return;
    setLoadingBlocks(true);
    try {
      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", user.id);
      if (error || !data) {
        setBlockedUsers([]);
        return;
      }
      const ids = data.map((row) => row.blocked_id);
      if (ids.length === 0) {
        setBlockedUsers([]);
        return;
      }
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ids);
      if (pError || !profiles) {
        setBlockedUsers([]);
        return;
      }
      const byId = new Map<string, Profile>();
      (profiles as Profile[]).forEach((p) => byId.set(p.id, p));
      setBlockedUsers(
        ids.map((id) => ({
          id,
          profile: byId.get(id) ?? null,
        }))
      );
    } finally {
      setLoadingBlocks(false);
    }
  };

  const handleOpenBlocks = () => {
    setActiveSection("blocks");
    void loadBlockedUsers();
  };

  const handleOpenProfile = () => {
    setActiveSection("profile");
    setNicknameInput(profile?.display_name ?? profile?.full_name ?? "");
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;
    await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId);
    setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedId));
    showToast("차단이 해제되었습니다.");
  };

  const saveNickname = async () => {
    if (!user) return;
    if (!canChangeNickname) {
      showToast("닉네임은 월 1회만 변경할 수 있습니다.");
      return;
    }
    const value = nicknameInput.trim() || null;
    setSavingNickname(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: value,
          last_nickname_change_date: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) {
        showToast("닉네임 변경에 실패했습니다.");
      } else {
        showToast("닉네임이 변경되었습니다.");
      }
    } finally {
      setSavingNickname(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!profile?.email) {
      showToast("이메일 정보가 없습니다.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) {
        showToast("비밀번호 재설정 메일 발송에 실패했습니다.");
      } else {
        showToast("비밀번호 재설정 메일을 발송했습니다.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        showToast("회원 탈퇴 처리에 실패했습니다.");
      } else {
        showToast("회원 탈퇴가 완료되었습니다.");
        window.location.href = "/";
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          {/* 상단: 프로필/레벨 카드 */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#2d9d78] text-white flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {(profile?.display_name ?? profile?.full_name ?? "U").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-base font-semibold text-foreground dark:text-gray-100">
                    {profile?.display_name ?? profile?.full_name ?? user?.email ?? "User"}
                    {isAdminUser ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-black dark:text-white border border-emerald-500/40">
                        💎 관리자
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-500/60">
                        <span className="mr-0.5 text-yellow-400">{starIcons}</span>
                        {starLabel}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    커뮤니티 활동으로 별 등급을 올려보세요.
                  </p>
                </div>
              </div>
              {/* 설정 드롭다운 */}
              <div className="relative">
                <details className="group">
                  <summary className="list-none flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 bg-white text-muted-foreground shadow-sm hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                    <Settings className="h-4 w-4" />
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => setActiveSection("blocks")}
                      className="block w-full px-3 py-1.5 text-left text-foreground hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                      차단 관리
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("profile")}
                      className="block w-full px-3 py-1.5 text-left text-foreground hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                      개인정보 수정
                    </button>
                  </div>
                </details>
              </div>
            </div>

            {/* 포인트/크레딧 현황 */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <p className="text-xs text-muted-foreground mb-1">포인트</p>
                <p className="text-lg font-semibold text-foreground dark:text-gray-100">
                  {points.toLocaleString()} P
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <p className="text-xs text-muted-foreground mb-1">크레딧</p>
                <p className="text-lg font-semibold text-foreground dark:text-gray-100">
                  {credits.toLocaleString()} C
                </p>
              </div>
            </div>

            {/* 내 활동 / 보관함 바로가기 */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="space-y-1 text-xs text-muted-foreground dark:text-gray-400">
                <p>내 활동과 보상 내역을 한곳에서 확인할 수 있습니다.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 rounded-full px-3 text-xs"
                >
                  <Link href="/my-activity">내 활동 보기</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 rounded-full px-3 text-xs border-amber-300 text-amber-700 dark:border-amber-500/70 dark:text-amber-200"
                >
                  <Link href="/vault">나의 보관함</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* 섹션 전환 */}
          {activeSection === "activity" && (
            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 text-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-border bg-muted/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActivityTab("posts");
                      setActivityPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      activityTab === "posts"
                        ? "bg-white text-foreground shadow-sm dark:bg-gray-900 dark:text-gray-100"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    내가 쓴 글
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivityTab("comments");
                      setActivityPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      activityTab === "comments"
                        ? "bg-white text-foreground shadow-sm dark:bg-gray-900 dark:text-gray-100"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    내 댓글
                  </button>
                </div>
                {user && (
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    총{" "}
                    <span className="font-semibold text-foreground dark:text-gray-100">
                      {activityTotal.toLocaleString()}
                    </span>
                    건
                  </p>
                )}
              </div>

              {!user ? (
                <div className="mt-2 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
                  로그인 후 이용할 수 있습니다.
                </div>
              ) : activityLoading ? (
                <div className="mt-2 rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
                  불러오는 중입니다...
                </div>
              ) : activityTab === "posts" ? (
                <>
                  {myPosts.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      아직 작성한 커뮤니티 글이 없습니다.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {myPosts.map((post) => (
                        <li key={post.id}>
                          <Link
                            href={`/community/${post.id}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                          >
                            <span className="truncate text-foreground dark:text-gray-100">
                              {post.title}
                            </span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {new Date(post.created_at).toLocaleString()}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  {myComments.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      아직 작성한 댓글이 없습니다.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {myComments.map((c) => (
                        <li key={c.id}>
                          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <p className="truncate text-foreground dark:text-gray-100">
                              {c.content}
                            </p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {user && (
                <Pagination
                  currentPage={activityPage}
                  totalPages={activityTotalPages}
                  onPageChange={setActivityPage}
                  light
                />
              )}
            </section>
          )}

          {activeSection === "blocks" && (
            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 text-sm">
              <h2 className="mb-3 text-base font-semibold text-foreground dark:text-gray-100">
                차단 관리
              </h2>
              {loadingBlocks ? (
                <p className="text-muted-foreground">불러오는 중...</p>
              ) : blockedUsers.length === 0 ? (
                <p className="text-muted-foreground">차단한 유저가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {blockedUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-foreground dark:text-gray-100">
                        {u.profile?.display_name ??
                          u.profile?.full_name ??
                          "탈퇴한 유저"}
                      </span>
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleUnblock(u.id)}
                      >
                        차단 해제
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeSection === "profile" && (
            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 text-sm">
              <h2 className="mb-3 text-base font-semibold text-foreground dark:text-gray-100">
                개인정보 수정
              </h2>
              {/* 닉네임 변경 */}
              <div className="mb-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground dark:text-gray-400">
                  닉네임
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-background px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="닉네임을 입력하세요"
                  />
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={savingNickname}
                    onClick={saveNickname}
                  >
                    {savingNickname ? "저장 중..." : "변경"}
                  </Button>
                </div>
                {!canChangeNickname && (
                  <p className="text-[11px] text-red-500">
                    닉네임은 월 1회만 변경할 수 있습니다.
                  </p>
                )}
              </div>

              {/* 이메일 / 비밀번호 */}
              <div className="mb-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground dark:text-gray-400">
                  이메일
                </p>
                <p className="text-sm text-foreground dark:text-gray-100">
                  {profile?.email ?? "-"}
                </p>
              </div>
              <div className="mb-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground dark:text-gray-400">
                  비밀번호
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={changingPassword}
                  onClick={sendPasswordReset}
                >
                  {changingPassword ? "메일 발송 중..." : "비밀번호 재설정 이메일 발송"}
                </Button>
              </div>

              {/* 회원 탈퇴 */}
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  회원 탈퇴
                </button>
                {showDeleteConfirm && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
                    <p className="mb-2">
                      정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며, 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deletingAccount}
                      >
                        취소
                      </Button>
                      <Button
                        size="xs"
                        className="h-7 px-2 text-[11px] bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                      >
                        {deletingAccount ? "탈퇴 중..." : "탈퇴하기"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

