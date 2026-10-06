import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { PrevNext } from "@/components/PrevNext";
import { getChapter, getSeries } from "@/lib/content";
import { seriesLabels } from "@/lib/labels";
import { ogImageUrl, pageMetadata } from "@/lib/metadata";

/*
 * Minimal chapter page: pages stacked vertically (webtoon style) so every chapter link resolves.
 * The full reader (webtoon + manga modes) is built on top of this route in issue #3.
 */

export const dynamicParams = false;

/** Higher than the site default (75) so lettering in speech bubbles stays crisp. */
const readingQuality = 90;

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
  const t = seriesLabels(series.language);
  return pageMetadata({
    title: `${series.title} · ${t.chapter(chapter.number)} — ${chapter.title}`,
    description: chapter.summary ?? `${t.readDescription(chapter.number, series.title)} ${series.synopsis}`,
    path: chapter.href,
    image: { url: ogImageUrl(series.href), alt: series.coverAlt },
    type: "article",
  });
}

export default async function ChapterPage({ params }: PageProps<"/series/[slug]/[chapter]">) {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) notFound();
  const { series, chapter, previous, next } = found;
  const t = seriesLabels(series.language);

  return (
    <article lang={series.language} className="py-12 lg:py-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: t.gallery, href: "/gallery" },
            { label: series.title, href: series.href },
            { label: t.chapter(chapter.number) },
          ]}
        />
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
            {t.chapter(chapter.number)}
          </p>
          <h1 className="mt-3 font-display text-display-sm">{chapter.title}</h1>
        </header>

        <ol className="mx-auto flex max-w-3xl flex-col">
          {chapter.pages.map((page, i) => (
            <li key={page.number}>
              <Image
                src={page.image}
                alt={page.alt}
                preload={i === 0}
                placeholder="blur"
                quality={readingQuality}
                sizes="(min-width: 816px) 768px, calc(100vw - 2rem)"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ol>

        <PrevNext
          label={t.chapters}
          previous={
            previous && {
              href: previous.href,
              title: previous.title,
              image: previous.pages[0].image,
              label: `← ${t.chapter(previous.number)}`,
            }
          }
          next={
            next
              ? {
                  href: next.href,
                  title: next.title,
                  image: next.pages[0].image,
                  label: `${t.chapter(next.number)} →`,
                }
              : { href: series.href, title: series.title, image: series.cover, label: t.backToSeries }
          }
        />
      </Container>
    </article>
  );
}
