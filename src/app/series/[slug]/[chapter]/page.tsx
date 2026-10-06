import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChapterReader } from "@/components/reader/ChapterReader";
import type { ReaderChapterLink } from "@/components/reader/types";
import { type Chapter, getChapter, getSeries } from "@/lib/content";
import { ogImageUrl, pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeries().flatMap((series) =>
    series.chapters.map((chapter) => ({ slug: series.slug, chapter: chapter.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/series/[slug]/[chapter]">): Promise<Metadata> {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) return {};
  const { series, chapter } = found;
  return pageMetadata({
    title: `${series.title} · Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.summary ?? `Read chapter ${chapter.number} of ${series.title}. ${series.synopsis}`,
    path: chapter.href,
    image: { url: ogImageUrl(series.href), alt: series.coverAlt },
    type: "article",
  });
}

const chapterLink = (chapter?: Chapter): ReaderChapterLink | undefined =>
  chapter && { href: chapter.href, number: chapter.number, title: chapter.title };

/** Chapter reader: only the data it needs crosses to the client component. */
export default async function ChapterPage({ params }: PageProps<"/series/[slug]/[chapter]">) {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) notFound();
  const { series, chapter, previous, next } = found;

  return (
    <ChapterReader
      key={chapter.href}
      series={{ slug: series.slug, title: series.title, href: series.href, readingMode: series.readingMode }}
      chapter={{ number: chapter.number, title: chapter.title, pages: chapter.pages }}
      previous={chapterLink(previous)}
      next={chapterLink(next)}
    />
  );
}
