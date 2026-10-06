import type { ContentImage } from "@/lib/content";

/** Serializable chapter data handed from the server page to the client reader. */

export const readingModes = ["webtoon", "manga"] as const;
export type ReadingMode = (typeof readingModes)[number];

export const readingDirections = ["rtl", "ltr"] as const;
export type ReadingDirection = (typeof readingDirections)[number];

export type ReaderPage = { number: number; image: ContentImage; alt: string };

export type ReaderChapterLink = { href: string; number: number; title: string };

export type ReaderData = {
  series: { slug: string; title: string; href: string; readingMode: ReadingMode };
  chapter: { number: number; title: string; pages: ReaderPage[] };
  previous?: ReaderChapterLink;
  next?: ReaderChapterLink;
};
