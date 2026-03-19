/**
 * 가격 포맷: 천 단위 콤마 + 소수점 (Intl.NumberFormat)
 * 예: 74397.40 → "74,397.40"
 */
const formatterLarge = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatterMedium = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
const formatterSmall = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});
const formatterTiny = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 8,
});

export function formatPrice(priceStr: string): string {
  const n = Number(priceStr);
  if (Number.isNaN(n)) return "0.00";
  if (n >= 1_000_000) return formatterLarge.format(n);
  if (n >= 1) return formatterLarge.format(n);
  if (n >= 0.01) return formatterMedium.format(n);
  if (n >= 0.0001) return formatterSmall.format(n);
  return formatterTiny.format(n);
}
