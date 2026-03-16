export function getURL() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let base =
    envUrl && envUrl.trim().length > 0
      ? envUrl.trim()
      : typeof window !== "undefined"
        ? window.location.origin
        : "";

  // 끝에 / 가 있으면 제거
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }

  return base;
}

