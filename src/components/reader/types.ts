import type { ContentImage } from "@/lib/content";
import type { Language } from "@/lib/content/schema";

/** Serializable chapter data handed from the server page to the client reader. */

export const readingModes = ["webtoon", "manga"] as const;
export type ReadingMode = (typeof readingModes)[number];

export const readingDirections = ["rtl", "ltr"] as const;
export type ReadingDirection = (typeof readingDirections)[number];

export type ReaderPage = { number: number; image: ContentImage; alt: string };

export type ReaderChapterLink = { href: string; number: number; title: string };

export type ReaderData = {
  series: {
    slug: string;
    title: string;
    href: string;
    readingMode: ReadingMode;
    /** Default page order in manga mode (series.json `readingDirection`). */
    readingDirection: ReadingDirection;
    /** Language of the lettering; the reader's labels follow it. */
    language: Language;
  };
  chapter: { number: number; title: string; pages: ReaderPage[] };
  previous?: ReaderChapterLink;
  next?: ReaderChapterLink;
};

/** next/image quality of chapter pages: higher than the site default (75) so lettering stays crisp. */
export const READING_QUALITY = 90;
