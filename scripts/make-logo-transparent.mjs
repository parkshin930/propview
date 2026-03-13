/**
 * Reads public/pv-logo.png, removes black background (full transparency),
 * recolors logo to mint green #52c68f (matches login button), saves as public/pv-logo.png
 * Run: node scripts/make-logo-transparent.mjs
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public", "pv-logo.png");
const outputPath = join(root, "public", "pv-logo.png");

// Deep mint / teal green: lower saturation, slightly darker for readability on white
const MINT_R = 0x2d;
const MINT_G = 0x9d;
const MINT_B = 0x78;

// Pixels darker than this are treated as background and made transparent
const BACKGROUND_THRESHOLD = 55;

if (!existsSync(inputPath)) {
  console.error("Missing public/pv-logo.png");
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
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) | 0;

  if (luminance < BACKGROUND_THRESHOLD) {
    out[i + 3] = 0;
  } else {
    out[i] = MINT_R;
    out[i + 1] = MINT_G;
    out[i + 2] = MINT_B;
    out[i + 3] = Math.min(255, (luminance / 255) * 280);
  }
}

await sharp(out, { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log("Done: public/pv-logo.png (transparent background, deep mint #2d9d78)");
