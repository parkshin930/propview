/** 로컬 스토리지 키 (매매일지 목록) */
export const LOCAL_DIARY_KEY = "trading_diary_local";
/** 리스트 refetch 트리거 (write 페이지에서 저장 후 설정) */
export const DIARY_REFETCH_KEY = "trading_diary_refetch";
/** 로컬 포인트/크레딧 델타 (DB 없이 테스트 시 UI 반영용) */
const LOCAL_POINTS_DELTA_KEY = "local_points_delta";
const LOCAL_CREDITS_DELTA_KEY = "local_credits_delta";

export type DiaryEntryItem = {
  id: string;
  title: string;
  symbol: string;
  position: "long" | "short";
  entry: number | null;
  tp: number | null;
  sl: number | null;
  profit: number | null;
  mistake: string;
  principle: string;
  tags: string[];
  createdAt: string;
  userId?: string;
};

export function loadLocalEntries(): DiaryEntryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DIARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalEntries(entries: DiaryEntryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_DIARY_KEY, JSON.stringify(entries));
}

export function setDiaryRefetch() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DIARY_REFETCH_KEY, "1");
}

export function consumeDiaryRefetch(): boolean {
  if (typeof window === "undefined") return false;
  const v = sessionStorage.getItem(DIARY_REFETCH_KEY);
  sessionStorage.removeItem(DIARY_REFETCH_KEY);
  return v === "1";
}

export function getLocalPointsDelta(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(LOCAL_POINTS_DELTA_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function getLocalCreditsDelta(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(LOCAL_CREDITS_DELTA_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function addLocalPointsDelta(points: number, credits: number) {
  if (typeof window === "undefined") return;
  const p = getLocalPointsDelta() + points;
  const c = getLocalCreditsDelta() + credits;
  localStorage.setItem(LOCAL_POINTS_DELTA_KEY, String(p));
  localStorage.setItem(LOCAL_CREDITS_DELTA_KEY, String(c));
  window.dispatchEvent(new CustomEvent("diary-points-updated"));
}
