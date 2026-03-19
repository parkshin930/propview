"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RankItem {
  rank: number;
  nickname: string;
  amount: string;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span aria-hidden>🥇</span>;
  if (rank === 2) return <span aria-hidden>🥈</span>;
  if (rank === 3) return <span aria-hidden>🥉</span>;
  return <span className="text-muted-foreground font-medium">{rank}</span>;
}

function formatWithdrawalAmount(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value).replace(/^/, "$");
}

/** 15위까지 스크롤 없이 보이게 (한 줄 약 40px × 15) */
const RANK_LIST_MAX_H = 600;

export function WithdrawalTimeline() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, full_name, total_withdrawal_amount")
        .not("total_withdrawal_amount", "is", null)
        .gt("total_withdrawal_amount", 0)
        .order("total_withdrawal_amount", { ascending: false })
        .limit(20);

      if (error) {
        console.error("누적 출금 랭킹 조회 실패:", error);
        setRanking([]);
        return;
      }

      const list: RankItem[] = (data || []).map((row, i) => ({
        rank: i + 1,
        nickname: row.display_name?.trim() || row.full_name?.trim() || "익명",
        amount: formatWithdrawalAmount(Number(row.total_withdrawal_amount) || 0),
      }));
      setRanking(list);
    };
    load().finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] max-h-[min(660px,68vh)]">
        <h2 className="mb-3 shrink-0 text-base font-semibold text-foreground dark:text-gray-100">
          누적 프랍 출금 랭킹
        </h2>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: RANK_LIST_MAX_H }}>
          {loading ? (
            <li className="text-sm text-muted-foreground">로딩 중...</li>
          ) : ranking.length === 0 ? (
            <li className="text-sm text-muted-foreground">이번 주 승인된 출금 내역이 없습니다.</li>
          ) : (
            ranking.map((item) => (
              <li
                key={`${item.rank}-${item.nickname}`}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-lg">
                    <RankIcon rank={item.rank} />
                  </span>
                  <span className="truncate text-sm font-medium text-foreground dark:text-gray-100">
                    {item.nickname}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs text-muted-foreground">누적 </span>
                  <span className="text-sm font-bold text-[#222222] dark:text-gray-100">
                    {item.amount}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
