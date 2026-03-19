import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/admin";
import {
  REWARD_DAILY_TOP_POINTS,
  REWARD_DAILY_TOP_CREDITS,
} from "@/lib/rewards";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** 매일 00:00 실행 시 "당일" = 전날(자정 종료된 그날) 기준 좋아요 1위 */
function getYesterdayUTC(): { start: string; end: string; key: string } {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCHours(0, 0, 0, 0);
  const key = start.toISOString().slice(0, 10);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    key,
  };
}

function checkCronAuth(req: Request): boolean {
  const secret =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.headers.get("x-cron-secret") ||
    "";
  const cronSecret = process.env.CRON_SECRET;
  return !cronSecret || secret === cronSecret;
}

async function runDailyReward() {
  try {
    const supabase = getServiceRoleClient();
    const { start, end, key } = getYesterdayUTC();

    const [postsRes, strategyRes, existingLog] = await Promise.all([
      supabase
        .from("posts")
        .select("id, user_id, likes, created_at")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("likes", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("strategy_posts")
        .select("id, user_id, likes, created_at")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("likes", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reward_logs")
        .select("id")
        .eq("kind", "daily")
        .eq("period_key", key)
        .eq("rank", 1)
        .maybeSingle(),
    ]);

    if (existingLog.data?.id) {
      return { ok: true, message: "Already rewarded for this period", period_key: key };
    }

    const post = postsRes.data;
    const strategyPost = strategyRes.data;
    let winnerUserId: string | null = null;

    if (post && strategyPost) {
      winnerUserId =
        (post.likes ?? 0) >= (strategyPost.likes ?? 0)
          ? post.user_id
          : strategyPost.user_id;
    } else if (post) {
      winnerUserId = post.user_id;
    } else if (strategyPost) {
      winnerUserId = strategyPost.user_id;
    }

    if (!winnerUserId) {
      return { ok: true, message: "No posts yesterday, no reward", period_key: key };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("points, point, credits, credit")
      .eq("id", winnerUserId)
      .single();

    const basePoints = (profile as { points?: number; point?: number } | null)?.points
      ?? (profile as { points?: number; point?: number } | null)?.point
      ?? 0;
    const baseCredits = (profile as { credits?: number; credit?: number } | null)?.credits
      ?? (profile as { credits?: number; credit?: number } | null)?.credit
      ?? 0;
    const newPoints = basePoints + REWARD_DAILY_TOP_POINTS;
    const newCredits = baseCredits + REWARD_DAILY_TOP_CREDITS;

    await Promise.all([
      supabase
        .from("profiles")
        .update({
          points: newPoints,
          point: newPoints,
          credits: newCredits,
          credit: newCredits,
        })
        .eq("id", winnerUserId),
      supabase.from("reward_logs").insert({
        kind: "daily",
        period_key: key,
        rank: 1,
        user_id: winnerUserId,
        points: REWARD_DAILY_TOP_POINTS,
        credits: REWARD_DAILY_TOP_CREDITS,
      }),
    ]);

    return {
      ok: true,
      period_key: key,
      user_id: winnerUserId,
      points: REWARD_DAILY_TOP_POINTS,
      credits: REWARD_DAILY_TOP_CREDITS,
    };
  } catch (e) {
    console.error("daily-reward cron error:", e);
    throw e;
  }
}

export async function GET(req: Request) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyReward();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyReward();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
