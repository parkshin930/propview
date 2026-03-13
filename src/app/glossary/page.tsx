"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: "A" | "B" | "C" | "D";
  categoryLabel: string;
};

const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: "mdd",
    term: "MDD (Maximum Drawdown)",
    definition:
      "최대 낙폭. 계정 고점 대비 허용되는 '전체' 최대 손실폭. 프랍 계정 유지의 가장 중요한 기준!",
    category: "A",
    categoryLabel: "필수 약어",
  },
  {
    id: "ddd",
    term: "DDD (Daily Drawdown)",
    definition:
      "일일 낙폭. 하루 동안 허용되는 최대 손실 한도. 매일 서버 리셋 시간 확인 필수.",
    category: "A",
    categoryLabel: "필수 약어",
  },
  {
    id: "rr",
    term: "RR (Risk Reward)",
    definition:
      "손익비. 내가 감수한 리스크 대비 기대 수익의 비율 (예: 손절 10$ 대 익절 30$면 1:3).",
    category: "A",
    categoryLabel: "필수 약어",
  },
  {
    id: "hft",
    term: "HFT (High Frequency Trading)",
    definition:
      "고주파 매매. 기계적인 초단타 매매로, 프랍사마다 허용 여부가 다르니 주의!",
    category: "A",
    categoryLabel: "필수 약어",
  },
  {
    id: "evaluation",
    term: "평가 (Evaluation)",
    definition:
      "자금을 배분받기 위해 거치는 실력 검증 단계 (보통 1Step 또는 2Step).",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "instant",
    term: "인스턴트 펀딩 (Instant Funding)",
    definition: "검증 단계 없이 결제 즉시 실제 자금을 운용할 수 있는 계정.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "pa",
    term: "PA (Paid Account)",
    definition: "모든 평가 과정을 통과하여 실제 수익을 출금할 수 있게 된 유료 계정.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "consistency",
    term: "일관성 룰 (Consistency Rule)",
    definition:
      "특정 거래 수익이 전체의 일정 비율을 넘지 않게 하여 안정적 매매를 유도하는 규칙.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "sl-tp",
    term: "SL / TP",
    definition:
      "Stop Loss(손절)와 Take Profit(익절)의 약자. 자산 보호를 위한 강제 청산 설정.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "payout",
    term: "페이아웃 (Payout)",
    definition: "발생한 수익금을 실제로 내 지갑으로 출금하는 프로세스.",
    category: "D",
    categoryLabel: "정산 및 수익",
  },
  {
    id: "profit-split",
    term: "수익 쉐어 (Profit Split)",
    definition: "트레이더와 프랍사가 수익을 나누는 비율 (보통 8:2 또는 9:1).",
    category: "D",
    categoryLabel: "정산 및 수익",
  },
];

const CATEGORY_ORDER: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GLOSSARY_DATA;
    return GLOSSARY_DATA.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    CATEGORY_ORDER.forEach((c) => (map[c] = []));
    filtered.forEach((t) => map[t.category].push(t));
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0B1120]">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-[#0B1120]">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">프랍용어사전</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
            전략 백과사전 · 검색해서 빠르게 찾아보세요.
          </p>

          {/* 검색창 */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="예: MDD, DDD, RR 검색..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-gray-600 dark:bg-[#111827] dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          {/* 카테고리별 카드 */}
          <div className="space-y-8">
            {CATEGORY_ORDER.map((cat) => {
              const terms = byCategory[cat];
              if (terms.length === 0) return null;

              const label =
                cat === "A"
                  ? "필수 약어"
                  : cat === "B"
                    ? "계정 및 챌린지"
                    : cat === "C"
                      ? "규정 및 리스크 관리"
                      : "정산 및 수익";

              return (
                <section
                  key={cat}
                  className={cat === "A" ? "rounded-2xl bg-blue-50/80 p-6 -mx-1" : ""}
                >
                  <h2
                    className={`mb-4 text-lg font-semibold ${
                      cat === "A" ? "text-blue-700 dark:text-blue-300" : "text-foreground dark:text-gray-100"
                    } ${cat === "A" ? "flex items-center gap-2" : ""}`}
                  >
                    {cat === "A" && (
                      <span className="rounded-lg bg-blue-500 px-2.5 py-1 text-sm font-medium text-white">
                        카테고리 A
                      </span>
                    )}
                    {label}
                  </h2>
                  <div className="space-y-3">
                    {terms.map((item) => {
                      const isExpanded = expandedId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : item.id)
                          }
                          className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition-all dark:bg-[#111827] dark:border-gray-700 ${
                            isExpanded
                              ? "border-blue-300 ring-2 ring-blue-400/20 dark:border-blue-600"
                              : "border-gray-200 hover:border-blue-200 hover:shadow-md dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-foreground dark:text-gray-100">
                              {item.term}
                            </span>
                            <span className="shrink-0 text-gray-400 dark:text-gray-500">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </span>
                          </div>
                          <p
                            className={`mt-3 text-sm leading-relaxed text-muted-foreground dark:text-gray-400 ${
                              isExpanded ? "block" : "line-clamp-2"
                            }`}
                          >
                            {item.definition}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
