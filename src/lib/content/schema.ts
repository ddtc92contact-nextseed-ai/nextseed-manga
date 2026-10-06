import { z } from "zod";

/**
 * Schemas of the metadata files in content/ (documented in content/README.md).
 * Objects are strict: an unknown key (usually a typo) fails the build instead of being ignored.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Folder names become URLs, so they must be lowercase kebab-case. */
export const slugSchema = z
  .string()
  .regex(slugPattern, "must be lowercase letters, digits and hyphens (e.g. `blue-hour-ronin`)");

const text = z.string().trim().min(1, "must not be empty");

const tags = z
  .array(
    z
      .string()
      .regex(slugPattern, "tags must be lowercase kebab-case (e.g. `dark-fantasy`)"),
  )
  .min(1, "add at least one tag")
  .refine((list) => new Set(list).size === list.length, "tags must not contain duplicates");

const date = z.iso.date("must be a date written YYYY-MM-DD");

/** Path of an image file, relative to the metadata file (e.g. `image.webp`). */
const imageFile = z
  .string()
  .regex(/^[^/\\]+\.(webp|avif|png|jpe?g)$/i, "must be an image file name in the same folder (.webp, .avif, .png or .jpg)");

const aiTools = z.array(text).optional();

/** content/artworks/<slug>/artwork.json */
export const artworkSchema = z.strictObject({
  title: text,
  description: text,
  image: imageFile,
  /** Alternative text describing the image for screen readers. */
  alt: text,
  date,
  tags,
  aiTools,
});

export const seriesStatus = ["ongoing", "completed", "hiatus"] as const;
export const readingModes = ["webtoon", "manga"] as const;

/** content/series/<slug>/series.json */
export const seriesSchema = z.strictObject({
  title: text,
  synopsis: text,
  cover: imageFile,
  coverAlt: text,
  tags,
  status: z.enum(seriesStatus),
  /** Date the series started (first publication). */
  date,
  aiTools,
  /** Default reader mode for the chapters: vertical webtoon scroll or page-by-page manga. */
  readingMode: z.enum(readingModes).default("webtoon"),
});

/** content/series/<slug>/chapters/<chapter>/chapter.json */
export const chapterSchema = z.strictObject({
  /** Reading order; chapters are sorted by this number. */
  number: z.number().int().positive(),
  title: text,
  date,
  summary: text.optional(),
});

export type ArtworkMeta = z.infer<typeof artworkSchema>;
export type SeriesMeta = z.infer<typeof seriesSchema>;
export type ChapterMeta = z.infer<typeof chapterSchema>;
export type SeriesStatus = (typeof seriesStatus)[number];
export type ReadingMode = (typeof readingModes)[number];
