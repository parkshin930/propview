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
  /** 테스트용 등급 고정. 예: '마스터' 시 👑 표시 */
  rank_override?: string | null;
  /** 닉네임(display_name) 마지막 변경일 (ISO 문자열). 월 1회 제한용 */
  last_nickname_change_date?: string | null;
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
