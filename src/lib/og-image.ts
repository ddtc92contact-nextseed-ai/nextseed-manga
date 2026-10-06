import path from "node:path";

import sharp from "sharp";

import type { ContentImage } from "./content";

export const ogSize = { width: 1200, height: 630 };

/**
 * 1200×630 JPEG share card for a creation: the whole artwork centred over a blurred,
 * darkened copy of itself, with the site's accent bar at the bottom.
 * Rendered once at build time by the `opengraph-image` routes.
 */
export async function renderOgImage(image: ContentImage): Promise<Response> {
  const { width, height } = ogSize;
  const file = path.join(process.cwd(), "public", image.src);

  const background = await sharp(file)
    .resize(width, height, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.45 })
    .toBuffer();
  const artwork = await sharp(file)
    .resize(width - 80, height - 48, { fit: "inside" })
    .toBuffer();
  const bar = await sharp({
    create: { width, height: 8, channels: 3, background: "#ff3b4e" },
  })
    .png()
    .toBuffer();

  const jpeg = await sharp(background)
    .composite([
      { input: artwork, gravity: "center" },
      { input: bar, gravity: "south" },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
}
