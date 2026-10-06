// Prepares every image found in content/ for next/image.
// Runs automatically before `npm run dev` and `npm run build` (see package.json), or by hand
// with `npm run content`.
//
// For each image it:
//   - downscales originals wider than MAX_WIDTH (so huge source files are never shipped),
//   - writes it to public/content/<same path>.<content-hash>.<ext> (immutable, cache-safe URL),
//   - records its width, height and a tiny blur placeholder in .content-cache/images.json,
//     which src/lib/content reads at build time.
// Both outputs are generated: they are git-ignored and rebuilt from content/ on every run.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public", "content");
const MANIFEST = path.join(ROOT, ".content-cache", "images.json");

const IMAGE_EXT = new Set([".webp", ".avif", ".png", ".jpg", ".jpeg"]);
const MAX_WIDTH = 2000;
const BLUR_SIZE = 16;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

async function processImage(file) {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep).join("/");
  const ext = path.extname(file).toLowerCase();
  let buffer = await readFile(file);

  let meta = await sharp(buffer).metadata();
  // Normalise EXIF rotation and cap the width of oversized originals.
  if ((meta.width ?? 0) > MAX_WIDTH || (meta.orientation ?? 1) > 1) {
    const format = ext === ".jpg" ? "jpeg" : ext.slice(1);
    buffer = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .toFormat(format, { quality: 85 })
      .toBuffer();
    meta = await sharp(buffer).metadata();
  }

  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 10);
  const outRel = `${rel.slice(0, -ext.length)}.${hash}${ext}`;
  const out = path.join(PUBLIC_DIR, outRel);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, buffer);

  const blur = await sharp(buffer)
    .resize(BLUR_SIZE, BLUR_SIZE, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return [
    rel,
    {
      src: `/content/${outRel}`,
      width: meta.width,
      height: meta.height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    },
  ];
}

await rm(PUBLIC_DIR, { recursive: true, force: true });
const files = [];
try {
  for await (const file of walk(CONTENT_DIR)) files.push(file);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const entries = [];
for (const file of files) {
  try {
    entries.push(await processImage(file));
  } catch (error) {
    console.error(`\n✖ Cannot read image ${path.relative(ROOT, file)}: ${error.message}\n`);
    process.exit(1);
  }
}

await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b))), null, 2));
console.log(`content: prepared ${entries.length} image(s) from content/`);
