import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { PrevNext } from "@/components/PrevNext";
import { getChapter, getSeries } from "@/lib/content";
import { ogImageUrl, pageMetadata } from "@/lib/metadata";

/*
 * Minimal chapter page: pages stacked vertically (webtoon style) so every chapter link resolves.
 * The full reader (webtoon + manga modes) is built on top of this route in issue #3.
 */

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

export default async function ChapterPage({ params }: PageProps<"/series/[slug]/[chapter]">) {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) notFound();
  const { series, chapter, previous, next } = found;

  return (
    <article className="py-12 lg:py-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Gallery", href: "/gallery" },
            { label: series.title, href: series.href },
            { label: `Chapter ${chapter.number}` },
          ]}
        />
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
            Chapter {chapter.number}
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
                sizes="(min-width: 816px) 768px, calc(100vw - 2rem)"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ol>

        <PrevNext
          label="Chapters"
          previous={
            previous && {
              href: previous.href,
              title: previous.title,
              image: previous.pages[0].image,
              label: `← Chapter ${previous.number}`,
            }
          }
          next={
            next
              ? {
                  href: next.href,
                  title: next.title,
                  image: next.pages[0].image,
                  label: `Chapter ${next.number} →`,
                }
              : { href: series.href, title: series.title, image: series.cover, label: "Back to the series" }
          }
        />
      </Container>
    </article>
  );
}
