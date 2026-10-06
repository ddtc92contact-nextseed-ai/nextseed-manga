import fs from "node:fs";
import path from "node:path";

import type { StaticImageData } from "next/image";
import { z } from "zod";

import {
  artworkSchema,
  chapterSchema,
  type ReadingMode,
  seriesSchema,
  type SeriesStatus,
  slugSchema,
} from "./schema";

/**
 * Build-time data layer for the creations stored in content/.
 * Every metadata file is validated with zod; any problem throws a ContentError listing
 * each faulty file, which makes `next build` fail with a readable message.
 */

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const MANIFEST = path.join(ROOT, ".content-cache", "images.json");
const IMAGE_EXT = /\.(webp|avif|png|jpe?g)$/i;

/** An image prepared by scripts/sync-content-images.mjs; usable directly as a next/image `src`. */
export type ContentImage = StaticImageData & { blurDataURL: string };

export type Artwork = {
  kind: "artwork";
  slug: string;
  href: string;
  title: string;
  description: string;
  image: ContentImage;
  alt: string;
  date: string;
  tags: string[];
  aiTools: string[];
};

export type ChapterPage = { number: number; image: ContentImage; alt: string };

export type Chapter = {
  slug: string;
  href: string;
  number: number;
  title: string;
  date: string;
  summary?: string;
  pages: ChapterPage[];
};

export type Series = {
  kind: "series";
  slug: string;
  href: string;
  title: string;
  synopsis: string;
  cover: ContentImage;
  coverAlt: string;
  tags: string[];
  status: SeriesStatus;
  date: string;
  /** Date of the latest chapter (or of the series when it has none). */
  updated: string;
  aiTools: string[];
  readingMode: ReadingMode;
  chapters: Chapter[];
};

export type Creation = Artwork | Series;

export type Content = {
  artworks: Artwork[];
  series: Series[];
};

export class ContentError extends Error {
  constructor(problems: string[]) {
    super(
      `Invalid content in content/ (${problems.length} problem${problems.length > 1 ? "s" : ""}). ` +
        `See content/README.md for the expected format.\n\n${problems.join("\n\n")}\n`,
    );
    this.name = "ContentError";
  }
}

/** One zod issue as `field: message`, e.g. `tags[0]: tags must be lowercase kebab-case`. */
function formatIssue(issue: z.core.$ZodIssue): string {
  const field = issue.path.reduce<string>(
    (out, key) => (typeof key === "number" ? `${out}[${key}]` : out ? `${out}.${String(key)}` : String(key)),
    "",
  );
  const message = /received undefined$/.test(issue.message) ? "is required" : issue.message;
  return field ? `${field}: ${message}` : message;
}

type Manifest = Record<string, Omit<ContentImage, "blurWidth" | "blurHeight">>;

/** Collects problems instead of stopping at the first one, so a build reports them all. */
class Loader {
  problems: string[] = [];
  private manifest: Manifest;

  constructor() {
    try {
      this.manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    } catch {
      throw new ContentError([
        `✖ ${path.relative(ROOT, MANIFEST)} is missing.\n  → Run \`npm run content\` (it runs automatically before \`npm run dev\` and \`npm run build\`).`,
      ]);
    }
  }

  report(file: string, message: string) {
    const lines = message.split("\n").map((line) => `  → ${line}`);
    this.problems.push(`✖ ${path.relative(ROOT, file)}\n${lines.join("\n")}`);
  }

  /** Sub-folders of `dir`, validated as URL slugs. */
  folders(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .filter((name) => {
        const result = slugSchema.safeParse(name);
        if (!result.success) {
          this.report(path.join(dir, name), `folder name ${result.error.issues[0].message}`);
        }
        return result.success;
      })
      .sort();
  }

  /** Reads and validates a JSON metadata file; returns undefined (and records why) on failure. */
  json<T extends z.ZodType>(file: string, schema: T): z.output<T> | undefined {
    if (!fs.existsSync(file)) {
      this.report(file, `file is missing: every folder needs its ${path.basename(file)}`);
      return undefined;
    }
    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      this.report(file, `is not valid JSON: ${(error as Error).message}`);
      return undefined;
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      this.report(file, result.error.issues.map(formatIssue).join("\n"));
      return undefined;
    }
    return result.data;
  }

  /** Resolves an image next to `metaFile` to its processed version. */
  image(metaFile: string, fileName: string): ContentImage | undefined {
    const full = path.join(path.dirname(metaFile), fileName);
    const key = path.relative(CONTENT_DIR, full).split(path.sep).join("/");
    const entry = this.manifest[key];
    if (entry) return entry;
    this.report(
      metaFile,
      fs.existsSync(full)
        ? `image "${fileName}" has not been processed yet: run \`npm run content\``
        : `image "${fileName}" not found in ${path.relative(ROOT, path.dirname(full))}/`,
    );
    return undefined;
  }

  artworks(): Artwork[] {
    const dir = path.join(CONTENT_DIR, "artworks");
    return this.folders(dir).flatMap((slug): Artwork[] => {
      const file = path.join(dir, slug, "artwork.json");
      const meta = this.json(file, artworkSchema);
      const image = meta && this.image(file, meta.image);
      if (!meta || !image) return [];
      return [
        {
          kind: "artwork",
          slug,
          href: `/artworks/${slug}`,
          title: meta.title,
          description: meta.description,
          image,
          alt: meta.alt,
          date: meta.date,
          tags: meta.tags,
          aiTools: meta.aiTools ?? [],
        },
      ];
    });
  }

  chapters(seriesDir: string, seriesSlug: string, seriesTitle: string): Chapter[] {
    const dir = path.join(seriesDir, "chapters");
    const chapters = this.folders(dir).flatMap((slug): Chapter[] => {
      const chapterDir = path.join(dir, slug);
      const file = path.join(chapterDir, "chapter.json");
      const meta = this.json(file, chapterSchema);
      if (!meta) return [];

      const pageFiles = fs
        .readdirSync(chapterDir)
        .filter((name) => IMAGE_EXT.test(name) && !name.startsWith("."))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
      if (pageFiles.length === 0) {
        this.report(file, "chapter has no page images (add 01.webp, 02.webp... next to chapter.json)");
        return [];
      }
      const pages = pageFiles.flatMap((name, i): ChapterPage[] => {
        const image = this.image(file, name);
        return image
          ? [{ number: i + 1, image, alt: `${seriesTitle}, chapitre ${meta.number}, page ${i + 1}` }]
          : [];
      });

      return [
        {
          slug,
          href: `/series/${seriesSlug}/${slug}`,
          number: meta.number,
          title: meta.title,
          date: meta.date,
          summary: meta.summary,
          pages,
        },
      ];
    });

    const seen = new Map<number, string>();
    for (const chapter of chapters) {
      const other = seen.get(chapter.number);
      if (other) {
        this.report(
          path.join(dir, chapter.slug, "chapter.json"),
          `chapter number ${chapter.number} is already used by chapters/${other}/`,
        );
      }
      seen.set(chapter.number, chapter.slug);
    }
    return chapters.sort((a, b) => a.number - b.number);
  }

  series(): Series[] {
    const dir = path.join(CONTENT_DIR, "series");
    return this.folders(dir).flatMap((slug): Series[] => {
      const seriesDir = path.join(dir, slug);
      const file = path.join(seriesDir, "series.json");
      const meta = this.json(file, seriesSchema);
      const cover = meta && this.image(file, meta.cover);
      if (!meta || !cover) return [];
      const chapters = this.chapters(seriesDir, slug, meta.title);
      const updated = [meta.date, ...chapters.map((c) => c.date)].sort().at(-1)!;
      return [
        {
          kind: "series",
          slug,
          href: `/series/${slug}`,
          title: meta.title,
          synopsis: meta.synopsis,
          cover,
          coverAlt: meta.coverAlt,
          tags: meta.tags,
          status: meta.status,
          date: meta.date,
          updated,
          aiTools: meta.aiTools ?? [],
          readingMode: meta.readingMode,
          chapters,
        },
      ];
    });
  }
}

function load(): Content {
  const loader = new Loader();
  const content = { artworks: loader.artworks(), series: loader.series() };
  if (loader.problems.length > 0) throw new ContentError(loader.problems);
  const byNewest = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);
  content.artworks.sort(byNewest);
  content.series.sort((a, b) => b.updated.localeCompare(a.updated));
  return content;
}

let cached: Content | undefined;

/** All validated content. Cached for the build; re-read on every request in dev. */
export function getContent(): Content {
  if (process.env.NODE_ENV === "development") return load();
  cached ??= load();
  return cached;
}

export const getArtworks = () => getContent().artworks;
export const getSeries = () => getContent().series;

export const getArtwork = (slug: string) => getArtworks().find((a) => a.slug === slug);
export const getSeriesBySlug = (slug: string) => getSeries().find((s) => s.slug === slug);

export function getChapter(seriesSlug: string, chapterSlug: string) {
  const series = getSeriesBySlug(seriesSlug);
  const index = series?.chapters.findIndex((c) => c.slug === chapterSlug) ?? -1;
  if (!series || index === -1) return undefined;
  return {
    series,
    chapter: series.chapters[index],
    previous: series.chapters[index - 1],
    next: series.chapters[index + 1],
  };
}

/** Date used to sort creations: artworks by publication, series by latest chapter. */
export const creationDate = (c: Creation) => (c.kind === "series" ? c.updated : c.date);

/** Artworks and series mixed, newest first: what the gallery and the landing page show. */
export function getCreations(): Creation[] {
  const { artworks, series } = getContent();
  return [...artworks, ...series].sort((a, b) => creationDate(b).localeCompare(creationDate(a)));
}

/** Every tag with its number of creations, most used first. */
export function getTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const creation of getCreations()) {
    for (const tag of creation.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Previous (newer) and next (older) artworks around `slug`, in gallery order. */
export function getAdjacentArtworks(slug: string) {
  const artworks = getArtworks();
  const index = artworks.findIndex((a) => a.slug === slug);
  return { previous: artworks[index - 1], next: artworks[index + 1] };
}

/** Image and alt text representing a creation in grids. */
export function creationImage(c: Creation) {
  return c.kind === "series" ? { image: c.cover, alt: c.coverAlt } : { image: c.image, alt: c.alt };
}
