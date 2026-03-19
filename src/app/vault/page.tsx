"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type RewardLog = Database["public"]["Tables"]["reward_logs"]["Row"];

export default function VaultPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [logs, setLogs] = useState<RewardLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<RewardLog | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reward_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error("[vault] reward_logs fetch error:", error);
      } else {
        setLogs((data as RewardLog[]) ?? []);
      }
      setLoading(false);
    };
    void fetchLogs();
  }, [supabase, user]);

  const formatKind = (log: RewardLog) => {
    if (log.kind === "daily") return "일일 랭킹 보상";
    if (log.kind === "weekly") return `주간 랭킹 ${log.rank}위 보상`;
    if (log.kind === "attendance") return "출석체크 보상";
    return "보상";
  };

  const handleOpenDetail = (log: RewardLog) => {
    setSelected(log);
    showToast("포인트가 지급되었습니다.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">
              나의 보관함
            </h1>
            <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
              출석체크, 이벤트, 랭킹 등으로 지급된 포인트/크레딧 보상을 한눈에 확인할 수 있습니다.
            </p>
          </div>

          {!user ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              로그인 후 이용할 수 있습니다.
            </div>
          ) : loading ? (
            <div className="rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              불러오는 중입니다...
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              아직 적립된 보상 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => handleOpenDetail(log)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  <div>
                    <p className="font-medium text-foreground dark:text-gray-100">
                      {formatKind(log)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-300">
                      +{log.points} P / +{log.credits} C
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900">
                <h2 className="mb-2 text-base font-semibold text-foreground dark:text-gray-100">
                  보상 상세 내역
                </h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300">
                  {formatKind(selected)} 보상으로{" "}
                  <span className="font-semibold">
                    {selected.points} P / {selected.credits} C
                  </span>{" "}
                  가 지급되었습니다.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  지급일: {new Date(selected.created_at).toLocaleString()}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setSelected(null)}
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

