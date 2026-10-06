import { z } from "zod";

/**
 * Schemas of the metadata files in content/ (documented in content/README.md).
 * Objects are strict: an unknown key (usually a typo) fails the build instead of being ignored.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Folder names become URLs, so they must be lowercase kebab-case. */
export const slugSchema = z
  .string()
  .regex(slugPattern, "must be lowercase letters, digits and hyphens (e.g. `ia-mi`)");

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
export const readingDirections = ["ltr", "rtl"] as const;
export const languages = ["fr", "en"] as const;

/** content/series/<slug>/series.json */
export const seriesSchema = z.strictObject({
  title: text,
  /** Optional tagline shown under the title (e.g. "Le robot sans mémoire"). */
  subtitle: text.optional(),
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
  /**
   * Page/panel order in `manga` mode: `rtl` (Japanese, right to left) or `ltr` (Western
   * lettering, left to right, e.g. French originals).
   */
  readingDirection: z.enum(readingDirections).default("rtl"),
  /** Language of the lettering; the series and chapter pages use matching labels. */
  language: z.enum(languages).default("fr"),
});

/** content/series/<slug>/chapters/<chapter>/chapter.json */
export const chapterSchema = z.strictObject({
  /** Reading order; chapters are sorted by this number. */
  number: z.number().int().positive(),
  title: text,
  date,
  summary: text.optional(),
  /**
   * Alternative text of each page, keyed by image file name (`"01.webp": "…"`).
   * Pages without one get a generic "<series>, chapter N, page N".
   */
  pageAlt: z.record(imageFile, text).optional(),
});

export type ArtworkMeta = z.infer<typeof artworkSchema>;
export type SeriesMeta = z.infer<typeof seriesSchema>;
export type ChapterMeta = z.infer<typeof chapterSchema>;
export type SeriesStatus = (typeof seriesStatus)[number];
export type ReadingMode = (typeof readingModes)[number];
export type ReadingDirection = (typeof readingDirections)[number];
export type Language = (typeof languages)[number];
