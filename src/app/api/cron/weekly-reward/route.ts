import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/admin";
import {
  REWARD_WEEKLY_1_POINTS,
  REWARD_WEEKLY_1_CREDITS,
  REWARD_WEEKLY_2_POINTS,
  REWARD_WEEKLY_2_CREDITS,
  REWARD_WEEKLY_3_POINTS,
  REWARD_WEEKLY_3_CREDITS,
} from "@/lib/rewards";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getLastWeekUTC(): { start: string; end: string; key: string } {
  const now = new Date();
  const day = now.getUTCDay();
  const lastSunday = new Date(now);
  lastSunday.setUTCDate(now.getUTCDate() - day);
  lastSunday.setUTCHours(23, 59, 59, 999);
  const lastMonday = new Date(lastSunday);
  lastMonday.setUTCDate(lastSunday.getUTCDate() - 6);
  lastMonday.setUTCHours(0, 0, 0, 0);
  const key = lastMonday.toISOString().slice(0, 10);
  return {
    start: lastMonday.toISOString(),
    end: lastSunday.toISOString(),
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

async function runWeeklyReward() {
  try {
    const supabase = getServiceRoleClient();
    const { start, end, key } = getLastWeekUTC();

    const [postsRes, strategyRes] = await Promise.all([
      supabase
        .from("posts")
        .select("user_id, likes")
        .gte("created_at", start)
        .lte("created_at", end),
      supabase
        .from("strategy_posts")
        .select("user_id, likes")
        .gte("created_at", start)
        .lte("created_at", end),
    ]);

    const totalByUser = new Map<string, number>();
    for (const row of postsRes.data ?? []) {
      const uid = row.user_id;
      totalByUser.set(uid, (totalByUser.get(uid) ?? 0) + (row.likes ?? 0));
    }
    for (const row of strategyRes.data ?? []) {
      const uid = row.user_id;
      totalByUser.set(uid, (totalByUser.get(uid) ?? 0) + (row.likes ?? 0));
    }

    const top3 = [...totalByUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([userId], i) => ({ userId, rank: i + 1 }));

    if (top3.length === 0) {
      return { ok: true, message: "No posts in last week, no rewards", period_key: key };
    }

    const rewards = [
      { rank: 1, points: REWARD_WEEKLY_1_POINTS, credits: REWARD_WEEKLY_1_CREDITS },
      { rank: 2, points: REWARD_WEEKLY_2_POINTS, credits: REWARD_WEEKLY_2_CREDITS },
      { rank: 3, points: REWARD_WEEKLY_3_POINTS, credits: REWARD_WEEKLY_3_CREDITS },
    ] as const;

    for (const { userId, rank } of top3) {
      const { data: existing } = await supabase
        .from("reward_logs")
        .select("id")
        .eq("kind", "weekly")
        .eq("period_key", key)
        .eq("rank", rank)
        .maybeSingle();

      if (existing?.id) continue;

      const r = rewards[rank - 1];
      const { data: profile } = await supabase
        .from("profiles")
        .select("points, point, credits, credit")
        .eq("id", userId)
        .single();

      const basePoints = (profile as { points?: number; point?: number } | null)?.points
        ?? (profile as { points?: number; point?: number } | null)?.point
        ?? 0;
      const baseCredits = (profile as { credits?: number; credit?: number } | null)?.credits
        ?? (profile as { credits?: number; credit?: number } | null)?.credit
        ?? 0;

      const newPoints = basePoints + r.points;
      const newCredits = baseCredits + r.credits;

      await Promise.all([
        supabase
          .from("profiles")
          .update({
            points: newPoints,
            point: newPoints,
            credits: newCredits,
            credit: newCredits,
          })
          .eq("id", userId),
        supabase.from("reward_logs").insert({
          kind: "weekly",
          period_key: key,
          rank,
          user_id: userId,
          points: r.points,
          credits: r.credits,
        }),
      ]);
    }

    return { ok: true, period_key: key, top3: top3.map((t) => t.userId) };
  } catch (e) {
    console.error("weekly-reward cron error:", e);
    throw e;
  }
}

export async function GET(req: Request) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runWeeklyReward();
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
    const result = await runWeeklyReward();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
