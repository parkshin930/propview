/** 매매일지 작성 시 지급 포인트/크레딧 */
export const REWARD_TRADING_DIARY_POINTS = 50;
export const REWARD_TRADING_DIARY_CREDITS = 50;

/** 커뮤니티 글 작성 시 지급 포인트/크레딧 */
export const REWARD_COMMUNITY_POINTS = 20;
export const REWARD_COMMUNITY_CREDITS = 20;

/** 출금 인증 승인 시 지급 포인트/크레딧 */
export const REWARD_WITHDRAWAL_APPROVED_POINTS = 300;
export const REWARD_WITHDRAWAL_APPROVED_CREDITS = 300;

/** 일일 베스트 (매일 00:00 크론) - 그날 좋아요 1위 글 작성자 */
export const REWARD_DAILY_TOP_POINTS = 100;
export const REWARD_DAILY_TOP_CREDITS = 100;

/** 주간 탑 트레이더 (매주 일요일 00:00 크론) - 1~3위 */
export const REWARD_WEEKLY_1_POINTS = 200;
export const REWARD_WEEKLY_1_CREDITS = 200;
export const REWARD_WEEKLY_2_POINTS = 100;
export const REWARD_WEEKLY_2_CREDITS = 100;
export const REWARD_WEEKLY_3_POINTS = 50;
export const REWARD_WEEKLY_3_CREDITS = 50;

/** 포인트 구간별 별(Star) 등급 */
export const STAR_THRESHOLDS = [
  { min: 0, max: 999, stars: 1 },
  { min: 1000, max: 2999, stars: 2 },
  { min: 3000, max: 9999, stars: 3 },
  { min: 10000, max: 29999, stars: 4 },
  { min: 30000, max: Infinity, stars: 5 },
] as const;

export type StarTier = (typeof STAR_THRESHOLDS)[number]["stars"];

export function getStarCount(points: number = 0): StarTier {
  const found =
    STAR_THRESHOLDS.find((tier) => points >= tier.min && points <= tier.max) ??
    STAR_THRESHOLDS[0];
  return found.stars;
}

export function getStarLabel(points: number = 0): string {
  const stars = getStarCount(points);
  if (stars === 1) return "원스타";
  if (stars === 2) return "투스타";
  if (stars === 3) return "쓰리스타";
  if (stars === 4) return "Four-Star General";
  return "Emerald Crown";
}

export function getStarIcons(points: number = 0): string {
  const stars = getStarCount(points);
  if (stars === 5) return "👑";
  return "★".repeat(stars);
}

/** 오늘의 전략 작성 보상 (일반 글보다 상향) */
export const REWARD_STRATEGY_POINTS = 40;
export const REWARD_STRATEGY_CREDITS = 40;
