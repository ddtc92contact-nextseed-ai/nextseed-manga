// Converts exported pages/covers (PNG, JPG…) to WebP ready to be committed in content/.
// Usage: npm run to-webp -- <output-folder> <image> [image…]
//   e.g. npm run to-webp -- content/series/ia-mi/chapters/02 ~/exports/chap2/*.png
//
// - Keeps the original resolution (only images wider than MAX_WIDTH are scaled down, like
//   scripts/sync-content-images.mjs does at build time), so lettering stays sharp.
// - Flattens any transparency onto white paper (AI exports often carry a near-opaque alpha).
// - Lossy WebP at quality 90: a 1248×1856 manga page weighs ~300-600 KB instead of 2-5 MB of PNG,
//   with no visible artefacts around the text in speech bubbles.
// The output keeps the input's base name: 001.png → 001.webp.
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 2000;
const QUALITY = 90;

const [outDir, ...inputs] = process.argv.slice(2);
if (!outDir || inputs.length === 0) {
  console.error("Usage: npm run to-webp -- <output-folder> <image> [image…]");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
let before = 0;
let after = 0;
for (const input of inputs) {
  const out = path.join(outDir, `${path.parse(input).name}.webp`);
  const info = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .webp({ quality: QUALITY, smartSubsample: true, effort: 6 })
    .toFile(out);
  const size = (await stat(input)).size;
  before += size;
  after += info.size;
  console.log(`${path.basename(input)} → ${out} (${info.width}×${info.height}, ${kb(size)} → ${kb(info.size)})`);
}
console.log(`\n${inputs.length} image(s): ${kb(before)} → ${kb(after)}`);

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}
