"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: "A" | "B" | "C";
  categoryLabel: string;
};

const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: "leverage",
    term: "레버리지 (Leverage)",
    definition:
      "내 자본금보다 더 큰 금액으로 거래할 수 있게 해주는 배율. 예: 내 자본이 1,000달러인데 100배 레버리지를 쓰면 최대 100,000달러 포지션까지 열 수 있습니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "margin",
    term: "증거금 (Margin)",
    definition:
      "포지션을 열기 위해 필요한 최소한의 담보금. 레버리지를 높게 사용할수록 필요한 증거금 비율은 줄어들지만, 청산 위험은 커집니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "liquidation",
    term: "청산 (Liquidation)",
    definition:
      "손실이 증거금을 초과해 거래소가 강제로 포지션을 종료시키는 것. 레버리지가 높을수록 청산 가격이 현재가에 더 가까워집니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "long-short",
    term: "롱 (Long) / 숏 (Short)",
    definition:
      "가격 상승에 베팅하면 롱(매수), 가격 하락에 베팅하면 숏(매도). 프랍 트레이딩에서도 롱/숏 방향에 따라 리스크 관리 방식이 달라집니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "spread",
    term: "스프레드 (Spread)",
    definition:
      "매수 호가와 매도 호가의 가격 차이. 스프레드가 클수록 진입과 청산 시 불리할 수 있으며, 특히 변동성 큰 코인이나 새로 상장된 종목에서 주의가 필요합니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "slippage",
    term: "슬리피지 (Slippage)",
    definition:
      "주문을 넣은 가격과 실제 체결된 가격 사이의 차이. 변동성이 크거나 유동성이 낮을 때 주로 발생하며, 예상보다 손실이 커질 수 있습니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "bull-bear",
    term: "불 마켓 / 베어 마켓",
    definition:
      "불 마켓(Bull Market)은 상승장, 베어 마켓(Bear Market)은 하락장을 의미. 프랍 계좌 운용 시 장세에 따라 전략(트렌드 추종, 역추세 등)을 달리해야 합니다.",
    category: "A",
    categoryLabel: "실전 매매",
  },
  {
    id: "prop-firm",
    term: "프랍펌 (Prop Firm)",
    definition:
      "자체 자본을 트레이더에게 제공하고, 트레이더가 낸 수익을 나누어 갖는 회사. 예: Mubite, PropW 등. 트레이더는 검증(챌린지)을 통과하면 회사 자금을 운용합니다.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "challenge",
    term: "챌린지 (Challenge / Evaluation)",
    definition:
      "프랍펌의 자금을 받기 위해 트레이더의 실력을 증명하는 평가 단계. 보통 1단계 또는 2단계로 구성되며, 수익 목표·손실 제한·최소 거래일 등의 규정을 만족해야 통과합니다.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "funded-account",
    term: "펀디드 계정 (Funded Account / 실계좌)",
    definition:
      "챌린지를 통과한 후 프랍펌으로부터 실제 배정받아 운용하게 되는 실자산 계정. 이 단계부터 발생한 실수익은 정해진 비율로 출금(페이아웃)할 수 있습니다.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "profit-split",
    term: "수익 분배 (Profit Split)",
    definition:
      "펀디드 계정에서 발생한 수익을 프랍펌과 트레이더가 나누는 비율. 보통 트레이더가 80~90%를 가져가며, 나머지는 프랍펌 몫입니다.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "scaling-plan",
    term: "스케일링 플랜 (Scaling Plan)",
    definition:
      "꾸준히 수익을 내는 트레이더에게 프랍펌이 운용 자금을 단계적으로 늘려주는 제도. 일정 기간 동안 손실 제한을 지키면서 목표 수익률을 달성하면 계좌 크기가 증액됩니다.",
    category: "B",
    categoryLabel: "계정 및 챌린지",
  },
  {
    id: "mdd",
    term: "MDD (Maximum Drawdown)",
    definition:
      "최대 손실폭. 계좌의 초기 자본금 또는 최고 잔고 대비 허용되는 최대 누적 손실 한도. 이 선을 터치하면 계정이 실격(해지)되는 경우가 많아 프랍 계정 규정에서 가장 중요한 항목입니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "ddd",
    term: "DDD (Daily Drawdown)",
    definition:
      "일일 손실폭. 하루 동안 허용되는 최대 손실 한도. 보통 서버 시간 기준 자정에 리셋되며, 이 한도를 넘기면 계정이 정지 또는 해지될 수 있습니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "profit-target",
    term: "수익 목표 (Profit Target)",
    definition:
      "챌린지 단계에서 다음 단계로 넘어가거나 펀디드 계정을 받기 위해 달성해야 하는 목표 수익률. 펀디드 계정에서는 보통 별도의 수익 목표가 없고, 규정만 지키면 자유롭게 매매할 수 있습니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "consistency",
    term: "일관성 규칙 (Consistency Rule)",
    definition:
      "운(도박)으로 한 번에 큰 수익을 내는 것을 막기 위한 규칙. 하루에 낸 수익이 전체 수익의 일정 비율(예: 40~50%)을 넘지 못하도록 제한하여 안정적인 매매 패턴을 요구합니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "news-trading",
    term: "뉴스 트레이딩 (News Trading)",
    definition:
      "CPI, 금리 결정 등 중요한 경제 지표 발표 전후로 거래하는 것. 변동성이 매우 커지는 구간이라 일부 프랍사는 이 시간대 거래를 제한하거나 수익을 인정하지 않기도 합니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
  {
    id: "overnight",
    term: "오버나잇 / 오버위켄드",
    definition:
      "포지션을 청산하지 않고 다음 날(오버나잇), 혹은 주말을 넘겨서(오버위켄드) 보유하는 것. 일부 프랍사는 주말 포지션 보유를 금지하거나, 특정 상품만 예외적으로 허용하기도 합니다.",
    category: "C",
    categoryLabel: "규정 및 리스크 관리",
  },
];

const CATEGORY_ORDER: ("A" | "B" | "C")[] = ["A", "B", "C"];

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
