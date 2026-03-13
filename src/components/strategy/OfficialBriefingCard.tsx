"use client";

export function OfficialBriefingCard() {
  return (
    <div className="rounded-xl border-2 border-green-500 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        [오피셜] 비트신 오늘의 핵심 뷰
      </h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full shrink-0 sm:w-[280px]">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              <svg
                className="h-14 w-14"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M8 5v14l11-7zM4 5h2v14H4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            오늘 아시아 세션에서 71,500 달러 구간이 지지로 작동할 가능성이 높습니다.
          </p>
          <p className="mt-2 leading-relaxed">
            롱 포지션은 72,200 돌파 시 추가 상승을, 70,800 이탈 시 단기 조정을 염두에 두시면 됩니다.
          </p>
          <p className="mt-2 leading-relaxed">
            펀딩비가 낮은 편이라 숏 스퀴즈 가능성도 있어 주간 고점 도달 시 분할 익절을 권합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
