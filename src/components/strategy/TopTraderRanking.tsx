"use client";

const RANKING = [
  { rank: 1, name: "트레이더김", hitRate: "92%" },
  { rank: 2, name: "코인매니아", hitRate: "88%" },
  { rank: 3, name: "프랍마스터", hitRate: "85%" },
];

export function TopTraderRanking() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        주간 적중률 TOP 트레이더
      </h3>
      <ul className="space-y-3">
        {RANKING.map((item) => (
          <li
            key={item.rank}
            className="flex items-center justify-between gap-2 rounded-lg py-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-foreground">
                {item.rank}
              </span>
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {item.hitRate}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
