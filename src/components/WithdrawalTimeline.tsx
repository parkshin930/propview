"use client";

const RANKING = [
  { rank: 1, nickname: "트레이더김", amount: "$312,000" },
  { rank: 2, nickname: "코인매니아", amount: "$285,500" },
  { rank: 3, nickname: "프랍마스터", amount: "$198,200" },
  { rank: 4, nickname: "달빛매매", amount: "$156,000" },
  { rank: 5, nickname: "실전고래", amount: "$142,800" },
  { rank: 6, nickname: "암호화폐러버", amount: "$128,400" },
  { rank: 7, nickname: "프랍수익왕", amount: "$115,200" },
  { rank: 8, nickname: "트레이딩킹", amount: "$98,500" },
  { rank: 9, nickname: "코인파워", amount: "$87,300" },
  { rank: 10, nickname: "수익인증러", amount: "$76,100" },
  { rank: 11, nickname: "코인트렌드", amount: "$68,200" },
  { rank: 12, nickname: "프랍수익가", amount: "$61,500" },
  { rank: 13, nickname: "차트마스터", amount: "$55,800" },
  { rank: 14, nickname: "선물고수", amount: "$49,200" },
  { rank: 15, nickname: "수익인증왕", amount: "$44,100" },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span aria-hidden>🥇</span>;
  if (rank === 2) return <span aria-hidden>🥈</span>;
  if (rank === 3) return <span aria-hidden>🥉</span>;
  return <span className="text-muted-foreground font-medium">{rank}</span>;
}

export function WithdrawalTimeline() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-[#1f2937] dark:bg-[#111827]">
        <h2 className="mb-3 shrink-0 text-base font-semibold text-foreground dark:text-gray-100">
          이달의 프랍 출금 랭킹
        </h2>
        <ul className="min-h-0 flex-1 space-y-2">
        {RANKING.map((item) => (
          <li
            key={item.rank}
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
        ))}
        </ul>
      </div>
    </div>
  );
}
