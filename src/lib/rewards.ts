/** 매매일지 작성 시 지급 포인트/크레딧 */
export const REWARD_TRADING_DIARY_POINTS = 50;
export const REWARD_TRADING_DIARY_CREDITS = 50;

/** 커뮤니티 글 작성 시 지급 포인트/크레딧 */
export const REWARD_COMMUNITY_POINTS = 20;
export const REWARD_COMMUNITY_CREDITS = 20;

/** 출금 인증 승인 시 지급 포인트/크레딧 */
export const REWARD_WITHDRAWAL_APPROVED_POINTS = 300;
export const REWARD_WITHDRAWAL_APPROVED_CREDITS = 300;

export type RankLabel = "입문자" | "트레이더" | "프로" | "마스터";

/**
 * 누적 포인트와 rank_override에 따라 등급 라벨 반환.
 * rank_override가 '마스터'면 마스터 등급(👑 표시용).
 */
export function getRankLabel(
  points: number = 0,
  rankOverride?: string | null
): RankLabel {
  if (rankOverride === "마스터") return "마스터";
  if (points >= 5000) return "프로";
  if (points >= 1000) return "트레이더";
  return "입문자";
}

/** 마스터 등급 여부 (금색 왕관 표시) */
export function isMasterRank(
  points: number = 0,
  rankOverride?: string | null
): boolean {
  return getRankLabel(points, rankOverride) === "마스터";
}
