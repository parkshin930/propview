import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTodayUTC(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** 오늘의 Bull/Bear 집계 + 로그인 시 내 투표 */
export async function GET() {
  try {
    const supabase = await createClient();
    const dayKey = getTodayUTC();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("sentiment_votes")
      .select("choice")
      .eq("day_key", dayKey);

    if (error) {
      console.error("sentiment GET error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const bull = (data ?? []).filter((r) => r.choice === "bull").length;
    const bear = (data ?? []).filter((r) => r.choice === "bear").length;
    const total = bull + bear;
    const bullPercent = total === 0 ? 50 : Math.round((bull / total) * 100);
    const bearPercent = total === 0 ? 50 : Math.round((bear / total) * 100);

    let my_vote: "bull" | "bear" | null = null;
    if (user) {
      const { data: myRow } = await supabase
        .from("sentiment_votes")
        .select("choice")
        .eq("day_key", dayKey)
        .eq("user_id", user.id)
        .maybeSingle();
      if (myRow?.choice === "bull" || myRow?.choice === "bear") {
        my_vote = myRow.choice;
      }
    }

    return NextResponse.json({
      bull,
      bear,
      total,
      bullPercent,
      bearPercent,
      day_key: dayKey,
      my_vote: my_vote ?? undefined,
    });
  } catch (e) {
    console.error("sentiment error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

/** Bull 또는 Bear 투표 (1인 1일 1회, 로그인 필요) */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const choice = body?.choice === "bear" ? "bear" : body?.choice === "bull" ? "bull" : null;
    if (!choice) {
      return NextResponse.json({ error: "choice는 'bull' 또는 'bear'여야 합니다." }, { status: 400 });
    }

    const dayKey = getTodayUTC();

    const { error: upsertError } = await supabase
      .from("sentiment_votes")
      .upsert(
        { user_id: user.id, day_key: dayKey, choice },
        { onConflict: "user_id,day_key" }
      );

    if (upsertError) {
      console.error("sentiment POST error:", upsertError);
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    const { data: list } = await supabase
      .from("sentiment_votes")
      .select("choice")
      .eq("day_key", dayKey);

    const bull = (list ?? []).filter((r) => r.choice === "bull").length;
    const bear = (list ?? []).filter((r) => r.choice === "bear").length;
    const total = bull + bear;
    const bullPercent = total === 0 ? 50 : Math.round((bull / total) * 100);
    const bearPercent = total === 0 ? 50 : Math.round((bear / total) * 100);

    return NextResponse.json({
      ok: true,
      choice,
      bull,
      bear,
      total,
      bullPercent,
      bearPercent,
    });
  } catch (e) {
    console.error("sentiment POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
