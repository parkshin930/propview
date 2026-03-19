"use client";

type PropId = "mubite" | "propw";

interface PropRulesPanelProps {
  selectedProp: PropId;
  isExpanded: boolean;
}

export function PropRulesPanel({ selectedProp, isExpanded }: PropRulesPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-gray-50 transition-all duration-300 ease-out dark:bg-gray-900 ${
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
    <div className="space-y-8 leading-relaxed text-sm text-foreground dark:text-gray-100">
      <h3 className="text-lg font-bold text-foreground dark:text-gray-100">
        Mubite (무바이트) 완벽 정리
      </h3>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          1. 구조 & 거래 플랫폼
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>거래 플랫폼:</strong> Bybit 모의 투자 (바이비트 유동성), Cleo (바이낸스 유동성) 기반.
          </li>
          <li>
            <strong>구조:</strong> One-Step / Two-Step / Instant Funding(즉시 펀디드) 모두 지원.
          </li>
          <li>
            <strong>수익 배분:</strong> Step 계열 80:20, Instant 계열 70:30 구조.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          2. 손실 규정 (리스크 관리)
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>단일 트레이드 제한:</strong> 한 트레이드에서 <strong>3%</strong> 이상 손실 불가.
          </li>
          <li>
            <strong>일일 최대 손실 (Daily Max Loss):</strong> Two Step{" "}
            <strong>5%</strong>, One Step <strong>4%</strong>, Instant는 별도 일일 손실 제한 없음.
          </li>
          <li>
            <span className="inline-block text-xs text-muted-foreground">
              (실현 손익 + 미실현 손익 합산 기준, 한국시간 오전 9시 기준으로 리셋)
            </span>
          </li>
          <li>
            <strong>계정 최대 손실:</strong> Two Step <strong>8%</strong>, One Step{" "}
            <strong>6%</strong>, Instant <strong>10%</strong> (수수료·펀딩비 포함).
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          3. 수익 목표 & 계정 한도
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>수익 목표 (Step):</strong> Two Step – 1단계 <strong>10%</strong>, 2단계{" "}
            <strong>5%</strong> / One Step – 1단계 <strong>10%</strong>.
          </li>
          <li>
            <strong>챌린지 계정:</strong> 무제한 보유 가능, 최대{" "}
            <strong>400K</strong> 규모까지 확장.
          </li>
          <li>
            <strong>라이브 계정:</strong> 여러 계정 운영 가능하며, 각 계정은 대기 없이
            독립적으로 운용.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          4. 포지션 룰 (레버리지 & 포지션 한도)
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>최대 레버리지:</strong> 최대 <strong>1:100</strong> (바이비트 기반 크립토).
          </li>
          <li>
            <strong>단일 포지션 한도:</strong> Step 계열 – 잔고의 <strong>2배</strong>, Instant – 잔고의{" "}
            <strong>1배</strong>.
          </li>
          <li>
            <strong>총 보유 포지션 한도:</strong> Step 계열 – 잔고의 <strong>3배</strong>, Instant –{" "}
            <strong>2배</strong>.
          </li>
          <li>
            <strong>Soft Breach:</strong> 포지션 한도 위반 시 <strong>1회 구제</strong> 가능
            (5분 이내 포지션 정정 시 복구).
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          5. 금지 행위 & 최소 거래일
        </h4>
        <ul className="space-y-1.5">
          <li>현물 거래, 계정 간 헤징, 외부 카피트레이딩 등은 <strong>전면 금지</strong>.</li>
          <li>
            <strong>최소 거래일:</strong> One Step – <strong>4일</strong>, Two Step – 각 단계{" "}
            <strong>4일</strong> 필요.
          </li>
          <li>
            <span className="inline-block text-xs text-muted-foreground">
              (하루 인정 기준: 거래 1회 + 절대 손익 0.25% 이상)
            </span>
          </li>
          <li>
            <strong>비활동 규정:</strong> 30일 이상 미활동 시 계정 비활성화.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700 dark:text-green-300">
          6. 출금 규칙 & 5% 룰
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>최소 출금:</strong> <strong>$50</strong> 이상부터 출금 가능.
          </li>
          <li>
            <strong>출금 타이밍:</strong> 첫 출금은 챌린지 통과 후 <strong>바로 가능</strong>, 이후{" "}
            <strong>2주 간격</strong>으로 요청.
          </li>
          <li>
            <strong>1회 최대 출금:</strong> 계정 크기의 <strong>5%</strong>까지 (심사
            약 24시간 소요).
          </li>
          <li>
            <strong>Funded Score 룰:</strong> 단일 거래일 수익이 <strong>-40%</strong>를 기록한
            경우, 출금 제한 발생.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-green-700">
          7. 스케일링 (계좌 증액)
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>Instant 계정:</strong> 120일 내 <strong>10%</strong> 수익 달성 시 계좌{" "}
            <strong>2배</strong> 증액 (최대 <strong>1000K</strong>).
          </li>
          <li>
            <strong>Step 계정:</strong> 90일 내 <strong>10%</strong> 수익 달성 시 계좌{" "}
            <strong>25%</strong> 증액 (최대 2배까지).
          </li>
        </ul>
      </section>

      {/* 장단점 섹션은 리뷰 영역 상단으로 이동 */}
    </div>
  );
}

function PropWRules() {
  return (
    <div className="space-y-8 leading-relaxed text-sm text-foreground dark:text-gray-100">
      <h3 className="text-lg font-bold text-foreground dark:text-gray-100">
        PropW (프랍더블류) 완벽 정리
      </h3>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          1. 구조 & 거래 환경
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>거래 환경:</strong> 자체 플랫폼 기반, CoinW 유동성 활용.
          </li>
          <li>
            <strong>계좌 구조:</strong> 1단계(실력 검증) → 2단계(실력 확인) → 3단계(PropW 트레이더).
          </li>
          <li>
            <strong>수익 배분:</strong> 기본적으로 <strong>80:20</strong> 구조 제공.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          2. 손실 규정
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>일일 최대 손실:</strong> 스탠다드 <strong>5%</strong>, 프로{" "}
            <strong>4%</strong> (실현+미실현 손익 합산, 한국시간 새벽 1시 리셋).
          </li>
          <li>
            <strong>계정 최대 손실:</strong> 스탠다드 <strong>8~10%</strong>, 프로{" "}
            <strong>6%</strong> (수수료·펀딩비 포함).
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          3. 수익 목표 & 계정 운영
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>수익 목표 (스탠다드):</strong> 1단계 <strong>5%</strong>, 2단계{" "}
            <strong>10%</strong>.
          </li>
          <li>
            <strong>수익 목표 (프로):</strong> 1단계 <strong>10%</strong>, 2단계{" "}
            <strong>0.1%</strong>로 2단계는 거의 검증용.
          </li>
          <li>
            <strong>챌린지 계정:</strong> 최대 <strong>5개</strong>까지 동시 운영 가능.
          </li>
          <li>
            <strong>라이브 계정:</strong> 한 번에 활성화 가능한 계정은 <strong>1개</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          4. 포지션 룰 & 보유 제한
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>최대 레버리지:</strong> 최대 <strong>1:5</strong> (펀디드 계정은 거래쌍별
            레버리지 제한 존재).
          </li>
          <li>
            <strong>최소 거래일:</strong> 스탠다드 <strong>5일</strong>, 프로{" "}
            <strong>3일</strong> 이상 거래 필요.
          </li>
          <li>
            <strong>포지션 장기 보유 제한:</strong> 동일 포지션을{" "}
            <strong>5일 이상 보유</strong> 시, 초과 수익분은 무효 처리.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          5. 금지 행위 & 비활동 규정
        </h4>
        <ul className="space-y-1.5">
          <li>헤징, 올인성 매매, 그룹 트레이딩 등 비정상적·시스템 악용 패턴은 금지.</li>
          <li>
            <strong>비활동 규정:</strong> 펀디드 계정에서 <strong>45일</strong> 이상 매매가
            없으면 계정이 비활성화될 수 있음.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-base font-semibold text-purple-700 dark:text-purple-300">
          6. 출금 규칙
        </h4>
        <ul className="space-y-1.5">
          <li>
            <strong>출금 금액:</strong> 최소 <strong>100 USDT</strong> / 최대{" "}
            <strong>2,500 USDT</strong>까지 1회 출금 가능.
          </li>
          <li>
            <strong>주기:</strong> 승인 후 <strong>7일 주기</strong>로 출금 가능.
          </li>
          <li>
            <strong>심사 기간:</strong> 영업일 기준 <strong>3~15일</strong> 소요 가능하며, 심사
            중에도 거래는 허용.
          </li>
          <li>
            <strong>일관성 규정:</strong> 별도의 일관성/분산 매매 규정이 없어 상대적으로
            단순함.
          </li>
        </ul>
      </section>

      {/* 장단점 섹션은 리뷰 영역 상단으로 이동 */}
    </div>
  );
}
