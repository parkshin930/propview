/**
 * 흰색/검은색 배경 제거 → 투명 PNG-24 favicon 생성
 * 입력: public/favicon-input.png
 * 출력: public/favicon.png (투명 배경, 로고만 유지)
 * Run: node scripts/make-favicon-transparent.mjs
 */
import sharp from "sharp";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public", "favicon-input.png");
const outputPath = join(root, "public", "favicon.png");

// 흰색 배경: RGB가 이 값 이상이면 투명 처리
const WHITE_THRESHOLD = 250;
// 검은색 배경: RGB가 이 값 이하이면 투명 처리 (검정 배경 이미지용)
const BLACK_THRESHOLD = 15;

if (!existsSync(inputPath)) {
  console.error("Missing public/favicon-input.png. Copy your icon image there first.");
  process.exit(1);
}

const image = sharp(inputPath);
const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
  const isBlack = r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD;
  if (isWhite || isBlack) {
    out[i + 3] = 0; // 투명
  }
  // else: 기존 색상 및 alpha 유지
}

await sharp(out, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log("Done: public/favicon.png (transparent background, PNG-24)");
