"use client";

type PropId = "mubite" | "propw";

interface PropRulesPanelProps {
  selectedProp: PropId;
  isExpanded: boolean;
}

export function PropRulesPanel({ selectedProp, isExpanded }: PropRulesPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-gray-50 transition-all duration-300 ease-out ${
        isExpanded ? "mt-8 max-h-[2000px] opacity-100 p-8" : "max-h-0 opacity-0 p-0"
      }`}
      role="region"
      aria-label="상세 규정"
      aria-hidden={!isExpanded}
    >
      {selectedProp === "mubite" ? <MubiteRules /> : <PropWRules />}
    </div>
  );
}

function MubiteRules() {
  return (
    <div className="space-y-8 leading-relaxed">
      <h3 className="text-lg font-bold text-foreground">
        📘 MUBITE 공식 규정 요약
      </h3>

      <section>
        <h4 className="mb-3 text-base font-semibold text-green-700">
          💸 1. 출금 조건 (Payout Rules)
        </h4>
        <ul className="space-y-2 text-sm text-foreground">
          <li>
            <strong>가장 빠른 출금:</strong> 첫 출금은 조건 달성 시 &apos;즉시&apos;
            가능, 이후 14일 주기 (영업일 기준 약 1시간 내 처리 완료)
          </li>
          <li>
            <strong>수익금 이월 시스템:</strong> 누적 수익 출금 한도는 없으나, 1회
            출금 시 계좌 크기의 최대 5%까지만 가능. (단, 초과된 수익은 소멸되지
            않고 다음 출금 주기로 100% 이월됨!)
          </li>
          <li>
            <strong>출금 수단:</strong> 은행 계좌 이체 또는 암호화폐 지갑 (ETH
            네트워크의 USDC) 지원
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-3 text-base font-semibold text-green-700">
          🚫 2. 금지된 매매 행위 (이것만 피하면 됩니다)
        </h4>
        <ul className="space-y-2 text-sm text-foreground">
          <li>데모 자금 추가 요청 / USDT 잔고 임의 수정 / API 키 삭제 및 변경 금지</li>
          <li>
            선물 챌린지 중 현물 마켓 거래 금지 (현물/마진 혼용 불가)
          </li>
          <li>EUR/USD 페어, 옵션, USDC 기반 페어 거래 금지</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          (※ 금지 항목이 매우 명확하고 투명하여 억울한 탈락이 없습니다.)
        </p>
      </section>

      <section>
        <h4 className="mb-3 text-base font-semibold text-green-700">
          📊 3. 챌린지 타입 및 매매 환경
        </h4>
        <ul className="space-y-2 text-sm text-foreground">
          <li>
            <strong>타입 선택:</strong> 1단계(빠른 펀딩), 2단계(안정적 입문),
            인스턴트 펀딩(평가 없이 즉시 시작) 중 자유롭게 선택 가능
          </li>
          <li>
            <strong>평가 기간 무제한:</strong> 챌린지 통과를 위한 시간 압박이 전혀
            없음 (단, 30일 이상 미접속 시 계정 비활성화 주의)
          </li>
          <li>
            <strong>레버리지:</strong> 바이비트(Bybit) 크립토 종목 대상 최대 1:100
            레버리지 지원
          </li>
        </ul>
      </section>
    </div>
  );
}

function PropWRules() {
  return (
    <div className="py-4">
      <p className="text-center text-base font-medium text-foreground">
        프랍더블류 상세 규정 업데이트 예정입니다.
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        곧 정확한 규정 요약과 비교 내용을 제공할 예정입니다.
      </p>
    </div>
  );
}
