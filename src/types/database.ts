// Supabase Database Types
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  /** 포인트(경험치). 누적 기준으로 등급 산정 */
  points?: number;
  /** 크레딧(화폐). 사용 가능 포인트 */
  credits?: number;
  /** 표시용 닉네임. 없으면 full_name 사용 */
  display_name?: string | null;
  /** 닉네임(display_name) 마지막 변경일 (ISO 문자열). 월 1회 제한용 */
  last_nickname_change_date?: string | null;
  /** 출금 인증 승인 시 true → 🔰 Verified Trader 배지 */
  is_verified?: boolean | null;
  /** 누적 출금액 (USD). 승인된 출금 인증 금액 합산, 랭킹용 */
  total_withdrawal_amount?: number | null;
  /** 역할 기반 권한: 기본 'user', 최고 관리자는 'admin' */
  role?: "user" | "admin" | null;
}

/** 출금 인증(profit) 게시글 승인 상태 */
export type PostApprovalStatus = "pending" | "approved";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "free" | "profit" | "analysis" | "question";
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  /** 출금 인증(profit)만 사용. 승인 시 랭킹 노출·포인트 지급 */
  approval_status?: PostApprovalStatus | null;
  /** 출금 인증 전용: 프랍 업체명 (선택) */
  prop_company?: string | null;
  /** 출금 인증 전용: 출금 금액 (USD) */
  withdrawal_amount?: number | null;
  /** 출금 인증 전용: 인증 이미지 URL (업로드 후 저장) */
  verification_image_url?: string | null;
  /** 일반 게시글용 본문 이미지 URL (선택) */
  image_url?: string | null;
  // Joined data
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined data
  profiles?: Profile;
}

export type PostCategory = Post["category"];

export const POST_CATEGORIES: { value: PostCategory; label: string; labelKo: string }[] = [
  { value: "free", label: "Free", labelKo: "자유글" },
  { value: "profit", label: "Profit", labelKo: "수익 인증" },
  { value: "analysis", label: "Analysis", labelKo: "분석/의견" },
  { value: "question", label: "Question", labelKo: "질문" },
];

/** 오늘의 전략 포지션 */
export type StrategyPosition = "long" | "short";

export interface StrategyPost {
  id: string;
  user_id: string;
  chart_image_url: string;
  symbol: string;
  position: StrategyPosition;
  analysis_rationale: string;
  target_price: string;
  stop_loss: string;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface StrategyPostLike {
  user_id: string;
  strategy_post_id: string;
  created_at: string;
}

export interface Guide {
  id: number;
  slug?: string | null;
  title: string;
  body: string;
  is_pinned?: boolean | null;
  created_at: string;
  updated_at: string;
}

// notices.type: DB에는 '일반' / '업데이트' 문자열로 저장
export type NoticeType = "일반" | "업데이트";

export interface Notice {
  id: number;
  title: string;
  content: string;
  /** notices.type 컬럼과 매핑되는 분류 필드 */
  type: NoticeType;
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | "like"
  | "comment"
  | "diary_reward"
  | "level_up"
  | "airdrop_reward"
  | "activity_reward";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}
