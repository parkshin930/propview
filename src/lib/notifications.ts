import { createClient } from "@/lib/supabase/client";
import type { NotificationType } from "@/types/database";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string | null;
}) {
  const supabase = createClient();
  const { userId, type, message, link = null } = params;

  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      message,
      link,
    });
    if (error) {
      console.error("[notifications] insert error:", error);
    }
  } catch (e) {
    console.error("[notifications] unexpected error:", e);
  }
}

export async function notifyActivityReward(params: {
  userId: string;
  message: string;
  link?: string | null;
}) {
  return createNotification({
    userId: params.userId,
    type: "activity_reward",
    message: params.message,
    link: params.link,
  });
}

export async function notifyTradingDiaryReward(userId: string) {
  return createNotification({
    userId,
    type: "diary_reward",
    message: "매매일지 작성 보상 50P가 지급되었습니다.",
    link: "/trading-diary",
  });
}

export async function notifyPostLiked(params: {
  postAuthorId: string;
  postId: string;
}) {
  const { postAuthorId, postId } = params;
  return createNotification({
    userId: postAuthorId,
    type: "like",
    message: "내 게시글에 좋아요가 달렸습니다.",
    link: `/community/${postId}`,
  });
}

export async function notifyAirdropReward(params: {
  userId: string;
  link?: string | null;
}) {
  return createNotification({
    userId: params.userId,
    type: "airdrop_reward",
    message: "에어드랍 보상이 지급되었습니다.",
    link: params.link ?? "/airdrop",
  });
}

// 레벨업 알림은 현재 포인트 기반 등급 체계 개편으로 사용하지 않지만,
// 기존 호출 코드와의 호환을 위해 빈 구현을 제공합니다.
export async function maybeNotifyLevelUp(_params: {
  userId: string;
  previousPoints: number;
  newPoints: number;
  rankOverride: string | null;
}) {
  // no-op
  return;
}

