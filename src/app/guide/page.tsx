"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

type GuideSlug =
  | "intro-prop-trading"
  | "mypage-points-credits"
  | "withdrawal-verification"
  | "trading-diary"
  | "today-strategy"
  | "airdrop-shop"
  | "mypage-inventory"
  | "prop-compare";

type GuideDetailSlug = GuideSlug;

interface GuideListItem {
  slug: GuideSlug;
  badge: string;
  title: string;
  subtitle: string;
  highlight: string;
  ctaLabel: string;
  ctaHref: string;
  colorClass: string;
}

interface GuideDetailContent {
  title: string;
  body: ReactNode;
}

const GUIDE_ITEMS: GuideListItem[] = [
  {
    slug: "intro-prop-trading",
    badge: "서비스 소개",
    title: "프랍 트레이딩, 3분 만에 이해하기",
    subtitle: "내 자본 0원으로 억대 계정을 운용하는 방법",
    highlight: "프랍 트레이딩의 정의와 수익 배분 구조를 한눈에 정리했습니다.",
    ctaLabel: "프랍 트레이딩 이해하기",
    ctaHref: "/guide/intro-prop-trading",
    colorClass: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-200",
  },
  {
    slug: "mypage-points-credits",
    badge: "마이페이지",
    title: "내 포인트 & 크레딧 내역",
    subtitle: "활동한 만큼 쌓이는 나의 자산, 어떻게 확인하나요?",
    highlight: "레벨업을 돕는 포인트와 에어드랍에 쓰이는 크레딧을 구분해서 설명합니다.",
    ctaLabel: "마이페이지 확인하기",
    ctaHref: "/mypage",
    colorClass: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200",
  },
  {
    slug: "withdrawal-verification",
    badge: "출금인증",
    title: "500 크레딧 받는 가장 빠른 방법",
    subtitle: "성공적인 출금을 인증하고 커뮤니티의 주인공이 되세요!",
    highlight: "출금 인증으로 한 번에 500P · 500C를 받는 절차를 안내합니다.",
    ctaLabel: "출금 인증하러 가기",
    ctaHref: "/community?category=profit",
    colorClass: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200",
  },
  {
    slug: "trading-diary",
    badge: "매매일지",
    title: "매일 50 크레딧 쌓기",
    subtitle: "복기는 실력이 되고, 기록은 크레딧이 됩니다.",
    highlight: "하루 한 번 매매일지를 남기면 자동으로 50P · 50C가 적립됩니다.",
    ctaLabel: "매매일지 쓰러 가기",
    ctaHref: "/trading-diary/write",
    colorClass: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-200",
  },
  {
    slug: "today-strategy",
    badge: "오늘의 전략",
    title: "베스트 전략가 도전하기",
    subtitle: "나만의 매매 기법을 공유하고 주간 300 크레딧을 쟁취하세요.",
    highlight:
      "좋아요 1위를 노려 최대 300C 보상과 베스트 전략가 배지를 획득하세요. 단, 도용·스팸·허위사실·욕설·금전유도 게시글은 즉시 삭제되며 영구 정지될 수 있습니다.",
    ctaLabel: "오늘의 전략 보러가기",
    ctaHref: "/strategy",
    colorClass: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200",
  },
  {
    slug: "airdrop-shop",
    badge: "에어드랍",
    title: "크레딧으로 경품 응모하기",
    subtitle: "모은 크레딧으로 치킨부터 챌린지 할인권까지!",
    highlight: "매주 일요일 21시 자동 추첨으로 다양한 경품을 노려보세요.",
    ctaLabel: "에어드랍 샵 열어보기",
    ctaHref: "/airdrop",
    colorClass: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-200",
  },
  {
    slug: "mypage-inventory",
    badge: "마이페이지",
    title: "내 보관함 사용법",
    subtitle: "당첨된 경품, 여기서 확인하세요!",
    highlight: "기프티콘과 프랍사 할인 코드를 한 곳에서 관리하는 방법을 알려드립니다.",
    ctaLabel: "내 보관함 열어보기",
    ctaHref: "/mypage", // 실제 보관함 경로로 교체 가능
    colorClass: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-200",
  },
  {
    slug: "prop-compare",
    badge: "프랍 비교",
    title: "상세 규정 확인하는 법",
    subtitle: "깨알 같은 규정, 아코디언 메뉴로 한눈에!",
    highlight: "손실 한도·수익 목표·금지 행위를 한글로 정리한 비교 뷰를 소개합니다.",
    ctaLabel: "프랍사 비교하러 가기",
    ctaHref: "/prop-compare",
    colorClass: "from-slate-500/10 via-slate-500/5 to-transparent border-slate-200",
  },
];

const GUIDE_DETAIL_CONTENT: Record<GuideDetailSlug, GuideDetailContent> = {
  "intro-prop-trading": {
    title: "내 자본 0원으로 시작하는 억대 트레이딩",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>
          프랍 트레이딩(Proprietary Trading)은 트레이더가 본인의 돈이 아닌{" "}
          <strong className="font-semibold">프랍사(회사)의 자본</strong>을 대신 운용하는 시스템입니다.
        </p>
        <p>
          <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
            리스크 Zero
          </strong>
          : 내 원금을 잃을 걱정 없이 매매에만 집중할 수 있습니다.
        </p>
        <p>
          <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
            파격적인 수익 배분
          </strong>
          : 챌린지(시험)를 통과하여 실계좌를 받으면, 발생한 수익의 최대{" "}
          <strong className="font-semibold">90%</strong>를 트레이더가 가져갑니다.
        </p>
        <p>프랍 트레이딩의 세계로 들어갈 준비가 되셨나요?</p>
      </div>
    ),
  },
  "mypage-points-credits": {
    title: "프랍뷰의 두 가지 핵심 자산 완벽 가이드",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>활동할수록 쌓이는 자산, 이렇게 다릅니다!</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong className="font-semibold">포인트 (XP)</strong>: 커뮤니티 내 나의{" "}
            <strong className="font-semibold">경험치</strong>입니다. 포인트가 쌓일수록 레벨이 오르고,
            닉네임 옆의 등급 뱃지(별, 왕관 등)가 화려해집니다.
          </li>
          <li>
            <strong className="font-semibold">크레딧 (Credit)</strong>: 프랍뷰의{" "}
            <strong className="font-semibold">화폐</strong>입니다. 에어드랍 샵에서 치킨, 프랍사 할인권 등
            경품 응모권을 구매할 때 사용됩니다.
          </li>
        </ul>
        <p>지금 내 지갑에 얼마가 있는지 확인해 볼까요?</p>
      </div>
    ),
  },
  "withdrawal-verification": {
    title: "가장 빠르게 500 크레딧을 얻는 방법",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>
          펀디드 계정으로 수익을 내고 출금에 성공하셨나요?{" "}
          <strong className="font-semibold">커뮤니티의 영웅</strong>이 되어보세요!
        </p>
        <p>
          <strong className="font-semibold">참여 방법</strong>: 프랍사에서 받은 출금 내역 캡처본을{" "}
          <strong className="font-semibold">출금 인증 게시판</strong>에 올려주세요.
        </p>
        <p>
          <strong className="font-semibold text-amber-700 dark:text-amber-300">
            파격 보상
          </strong>
          : 관리자 승인 완료 시, 즉시{" "}
          <strong className="font-semibold">500 포인트와 500 크레딧</strong>이 지급됩니다.
        </p>
        <p>다른 트레이더들의 출금 성공기를 보고 동기부여를 받아보세요!</p>
      </div>
    ),
  },
  "trading-diary": {
    title: "성장을 기록하고 크레딧도 챙기세요",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>
          성공하는 트레이더의 가장 강력한 무기는{" "}
          <strong className="font-semibold">복기</strong>입니다.
        </p>
        <p>
          <strong className="font-semibold">기록의 힘</strong>: 오늘 진입한 타점, 심리 상태, 아쉬웠던 점을
          차트와 함께 남겨보세요.
        </p>
        <p>
          <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
            일일 보상
          </strong>
          : 하루 한 번 매매일지를 작성하기만 해도{" "}
          <strong className="font-semibold">50 포인트와 50 크레딧</strong>이 자동 적립됩니다.
        </p>
        <p>나만의 트레이딩 다이어리를 지금 시작해 보세요.</p>
      </div>
    ),
  },
  "today-strategy": {
    title: "주간 베스트 전략가에 도전하세요!",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>
          나만의 뷰와 매매 기법을 공유하고{" "}
          <strong className="font-semibold">최고의 영예</strong>를 차지하세요.
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong className="font-semibold">주간 보상</strong>: 한 주간 &apos;좋아요&apos; 1위를 기록한
            트레이더에게 <strong className="font-semibold">300 크레딧</strong>과{" "}
            <strong className="font-semibold">&apos;베스트 전략가&apos; 배지</strong>가 부여됩니다.
          </li>
          <li>
            <strong className="font-semibold">일일 보상</strong>: 당일 &apos;좋아요&apos;를 가장 많이 받은
            트레이더에게 <strong className="font-semibold">150 포인트</strong>가 즉시 지급됩니다!
          </li>
        </ul>
        <p>
          <strong className="font-semibold text-rose-700 dark:text-rose-300">
            주의사항
          </strong>
          : 도용, 스팸, 허위사실 유포, 욕설, 타 채널 금전 유도 게시글은 적발 즉시 무통보 삭제되며{" "}
          <strong className="font-semibold">영구 정지</strong> 처리됩니다. 건강한 문화를 함께
          만들어주세요!
        </p>
      </div>
    ),
  },
  "airdrop-shop": {
    title: "모은 크레딧으로 경품의 주인공이 되세요",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>열심히 활동하며 모은 크레딧, 이제 쓸 시간입니다!</p>
        <p>
          <strong className="font-semibold">응모 방법</strong>:{" "}
          <strong className="font-semibold">에어드랍 샵</strong>에서 원하는 경품의 응모권을
          구매하세요. (여러 장 구매 시{" "}
          <strong className="font-semibold">당첨 확률 UP!</strong>)
        </p>
        <p>
          <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
            추첨 안내
          </strong>
          : 매주 일요일 21시(KST), 시스템이 자동으로 랜덤 추첨을 진행합니다.
        </p>
        <p>
          달콤한 간식부터 프랍사 챌린지 파격 할인권까지,{" "}
          <strong className="font-semibold">행운</strong>을 시험해 보세요!
        </p>
      </div>
    ),
  },
  "mypage-inventory": {
    title: "당첨된 소중한 경품, 안전하게 보관 중입니다",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>에어드랍 추첨에서 당첨되셨나요? 축하드립니다!</p>
        <p>
          <strong className="font-semibold">확인 방법</strong>: 당첨된 기프티콘 이미지나 프랍사 할인
          코드는 모두 <strong className="font-semibold">내 보관함</strong>으로 자동 지급됩니다.
        </p>
        <p>
          <strong className="font-semibold">지급 시기</strong>: 추첨 완료 후{" "}
          <strong className="font-semibold">영업일 기준 3일 이내</strong>에 순차적으로 발송 및 등록됩니다.
        </p>
        <p>혹시 내가 놓친 당첨 경품이 없는지 지금 확인해 보세요.</p>
      </div>
    ),
  },
  "prop-compare": {
    title: "나에게 딱 맞는 프랍사, 1분 만에 찾기",
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-gray-200">
        <p>
          복잡하고 어려운 영어 규정들, 프랍뷰가{" "}
          <strong className="font-semibold">한글로 완벽하게 정리</strong>했습니다.
        </p>
        <p>
          <strong className="font-semibold">비교 포인트</strong>: 최대 손실 한도, 수익 목표, 주말 보유
          가능 여부, 뉴스 매매 가능 여부 등{" "}
          <strong className="font-semibold">핵심 규정</strong>을 아코디언 메뉴로 펼쳐서 확인하세요.
        </p>
        <p>
          <strong className="font-semibold">유저 리뷰</strong>: 규정만으로는 알 수 없는 실제 슬리피지,
          출금 속도 등 생생한 별점 리뷰를 놓치지 마세요.
        </p>
      </div>
    ),
  },
};

interface GuideDetailModalProps {
  slug: GuideDetailSlug;
  onClose: () => void;
  onConfirm: () => void;
}

function GuideDetailModal({ slug, onClose, onConfirm }: GuideDetailModalProps) {
  const content = GUIDE_DETAIL_CONTENT[slug];
  const target = GUIDE_ITEMS.find((item) => item.slug === slug);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal
        aria-labelledby="guide-detail-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2
            id="guide-detail-title"
            className="text-base font-semibold text-slate-900 dark:text-gray-100 pr-4 line-clamp-2"
          >
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-gray-100"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {content.body}
        </div>
        {slug !== "intro-prop-trading" && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40">
            <Button
              type="button"
              className="w-full h-10 text-sm font-semibold"
              onClick={onConfirm}
            >
              {target?.ctaLabel ?? "자세히 보기"}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const [activeDetail, setActiveDetail] = useState<GuideDetailSlug | null>(null);

  const handleOpenDetail = (slug: GuideDetailSlug) => {
    setActiveDetail(slug);
  };

  const handleConfirm = () => {
    if (!activeDetail) return;
    const target = GUIDE_ITEMS.find((item) => item.slug === activeDetail);
    if (target) {
      router.push(target.ctaHref);
    }
    setActiveDetail(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#0B1120]">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-screen-md px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-1">
            PROPVIEW 초보 이용 가이드
          </h1>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-10">
            프랍 트레이딩 입문자부터 에어드랍 활용까지, 핵심 기능만 쏙 뽑아 정리했어요.
          </p>

          {/* 가이드 목록 (image_3e3e5a 스타일 카드 리스트) */}
          <div className="space-y-4">
            {GUIDE_ITEMS.map((item, index) => {
              return (
                <section
                  key={item.slug}
                  className={`relative overflow-hidden rounded-2xl border bg-white/90 p-5 shadow-sm transition hover:shadow-md dark:bg-[#020617] dark:border-slate-800 ${item.colorClass}`}
                >
                  <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/40 blur-3xl dark:bg-slate-500/10" />
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-100">
                      0{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider mb-1">
                        {item.badge}
                      </p>
                      <h2 className="text-base font-bold text-foreground dark:text-gray-100 mb-1 line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-2 line-clamp-2">
                        {item.subtitle}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-gray-300 mb-3">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {item.highlight}
                        </span>
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="text-[11px] text-emerald-700 dark:text-emerald-300 underline underline-offset-[3px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(item.slug as GuideDetailSlug);
                          }}
                        >
                          클릭해서 자세한 이용 방법 보기
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:border-emerald-400/50 dark:hover:bg-emerald-900/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(item.slug as GuideDetailSlug);
                          }}
                        >
                          자세히 알아보기
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      {activeDetail && (
        <GuideDetailModal
          slug={activeDetail}
          onClose={() => setActiveDetail(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
