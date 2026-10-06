// Generates the PLACEHOLDER artwork in public/placeholder/.
// These images stand in for the real AI-generated manga pages until they are added.
// Usage: node scripts/generate-placeholders.mjs   (uses sharp, installed with next)
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "placeholder");

// Deterministic PRNG so the output is stable between runs.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function speedLines(cx, cy, count, r1, r2, rand, color) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand() * 0.05;
    const w = 0.004 + rand() * 0.01;
    const inner = r1 * (0.8 + rand() * 0.5);
    const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
    d += `M${p(a - w, r2)}L${p(a, inner)}L${p(a + w, r2)}Z`;
  }
  return `<path d="${d}" fill="${color}"/>`;
}

function art({ w, h, seed, hue, title, layout }) {
  const rand = rng(seed);
  const cx = w * (layout === "hero" ? 0.68 : 0.5);
  const cy = h * (layout === "hero" ? 0.42 : 0.38);
  const R = Math.min(w, h) * (layout === "hero" ? 0.32 : 0.3);
  const dot = Math.round(Math.min(w, h) / 90);

  // Jagged skyline / rocks along the bottom.
  let ridge = `M0,${h}`;
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = h * (0.72 + rand() * 0.14);
    ridge += `L${x.toFixed(0)},${y.toFixed(0)}`;
  }
  ridge += `L${w},${h}Z`;

  // A simple standing silhouette in front of the sun.
  const fx = cx - R * 0.15;
  const fy = h * 0.84;
  const s = R / 260;
  const figure = `
    <g transform="translate(${fx} ${fy}) scale(${s})" fill="#08080a">
      <circle cx="0" cy="-330" r="34"/>
      <path d="M-10,-300 L-70,-300 L-120,-120 L-60,-60 L-40,-200 L-30,0 L-70,0 L-60,20 L0,20 L10,-140 L30,20 L90,20 L80,0 L50,0 L40,-200 L120,-40 L170,-80 L60,-300 Z"/>
      <path d="M40,-290 L260,-420 L270,-400 L60,-270 Z"/>
    </g>`;

  // The hero keeps its label top-right, away from the overlaid headline.
  const labelX = layout === "hero" ? w * 0.93 : w * 0.07;
  const labelAnchor = layout === "hero" ? "end" : "start";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 30% 10%)"/>
      <stop offset="0.6" stop-color="hsl(${hue} 45% 22%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 20) % 360} 55% 35%)"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff4e0"/>
      <stop offset="0.7" stop-color="hsl(${hue} 75% 72%)"/>
      <stop offset="1" stop-color="hsl(${hue} 70% 55%)"/>
    </radialGradient>
    <pattern id="tone" width="${dot * 2}" height="${dot * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="${dot}" cy="${dot}" r="${dot * 0.45}" fill="#000" fill-opacity="0.35"/>
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="toneMask"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${speedLines(cx, cy, 140, R * 1.15, Math.max(w, h) * 1.2, rand, "rgba(255,255,255,0.07)")}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#sun)"/>
  <rect width="${w}" height="${h}" fill="url(#tone)" mask="url(#toneMask)"/>
  ${figure}
  <path d="${ridge}" fill="#0d0d10"/>
  <rect x="${w * 0.04}" y="${h * 0.04}" width="${w * 0.92}" height="${h * 0.92}" fill="none" stroke="#f3efe6" stroke-opacity="0.25" stroke-width="${Math.max(2, w / 400)}"/>
  <g font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" fill="#f3efe6" text-anchor="${labelAnchor}">
    <text x="${labelX}" y="${h * 0.1}" font-size="${Math.round(w / (layout === "hero" ? 48 : 32))}" letter-spacing="${w / 200}" fill-opacity="0.85">PLACEHOLDER</text>
    <text x="${labelX}" y="${h * 0.1 + w / (layout === "hero" ? 34 : 22)}" font-size="${Math.round(w / (layout === "hero" ? 70 : 48))}" fill-opacity="0.6">${title}</text>
  </g>
</svg>`;
}

const images = [
  { file: "hero.webp", w: 2400, h: 1350, seed: 7, hue: 350, title: "Featured artwork", layout: "hero" },
  { file: "creation-01.webp", w: 1200, h: 1600, seed: 11, hue: 220, title: "Creation 01" },
  { file: "creation-02.webp", w: 1200, h: 1600, seed: 23, hue: 280, title: "Creation 02" },
  { file: "creation-03.webp", w: 1200, h: 1600, seed: 37, hue: 10, title: "Creation 03" },
  { file: "creation-04.webp", w: 1200, h: 1600, seed: 41, hue: 170, title: "Creation 04" },
  { file: "creation-05.webp", w: 1200, h: 1600, seed: 53, hue: 30, title: "Creation 05" },
  { file: "creation-06.webp", w: 1200, h: 1600, seed: 67, hue: 250, title: "Creation 06" },
  { file: "artist.webp", w: 1200, h: 1500, seed: 79, hue: 0, title: "About the artist" },
];

await mkdir(OUT, { recursive: true });
for (const img of images) {
  await sharp(Buffer.from(art(img)))
    .webp({ quality: 78 })
    .toFile(path.join(OUT, img.file));
  console.log("wrote", img.file);
}
