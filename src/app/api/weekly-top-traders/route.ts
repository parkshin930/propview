import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getThisWeekUTC(): { start: string; end: string } {
  const now = new Date();
  const day = now.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() + mondayOffset);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  return { start: start.toISOString(), end: now.toISOString() };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { start, end } = getThisWeekUTC();

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

    const topUserIds = [...totalByUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, totalLikes]) => ({ userId, totalLikes }));

    if (topUserIds.length === 0) {
      return NextResponse.json({ list: [] });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, full_name")
      .in(
        "id",
        topUserIds.map((t) => t.userId)
      );

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    );

    const list = topUserIds.map((t, i) => ({
      rank: i + 1,
      user_id: t.userId,
      display_name:
        profileMap.get(t.userId)?.display_name?.trim() ||
        profileMap.get(t.userId)?.full_name?.trim() ||
        "익명",
      total_likes: t.totalLikes,
    }));

    return NextResponse.json({ list });
  } catch (e) {
    console.error("weekly-top-traders error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
