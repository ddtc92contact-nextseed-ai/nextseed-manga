import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { DetailList } from "@/components/DetailList";
import { TagList } from "@/components/TagList";
import { getSeries, getSeriesBySlug } from "@/lib/content";
import { formatDateIn, seriesLabels } from "@/lib/labels";
import { ogImageUrl, pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeries().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/series/[slug]">): Promise<Metadata> {
  const series = getSeriesBySlug((await params).slug);
  if (!series) return {};
  return pageMetadata({
    title: series.subtitle ? `${series.title} — ${series.subtitle}` : series.title,
    description: series.synopsis,
    path: series.href,
    image: { url: ogImageUrl(series.href), alt: series.coverAlt },
  });
}

export default async function SeriesPage({ params }: PageProps<"/series/[slug]">) {
  const series = getSeriesBySlug((await params).slug);
  if (!series) notFound();
  const first = series.chapters[0];
  const t = seriesLabels(series.language);
  const date = (value: string) => <time dateTime={value}>{formatDateIn(series.language, value)}</time>;

  return (
    <article lang={series.language} className="py-12 lg:py-16">
      <Container>
        <Breadcrumbs
          items={[{ label: t.gallery, href: "/gallery" }, { label: t.series }, { label: series.title }]}
        />
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div
            style={{ aspectRatio: series.cover.width / series.cover.height }}
            className="panel relative mx-auto w-full max-w-md overflow-hidden bg-ink-800 md:max-w-none md:self-start"
          >
            <Image
              src={series.cover}
              alt={series.coverAlt}
              fill
              preload
              placeholder="blur"
              sizes="(min-width: 1408px) 520px, (min-width: 768px) 38vw, (min-width: 448px) 448px, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-kicker text-accent">
              {t.series} · {t.status[series.status]}
            </p>
            <h1 className="mt-3 font-display text-display hyphens-auto [overflow-wrap:anywhere]">{series.title}</h1>
            {series.subtitle && (
              <p className="mt-2 font-display text-xl text-paper sm:text-2xl">{series.subtitle}</p>
            )}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-muted">{series.synopsis}</p>
            {first && (
              <div className="mt-8">
                <Button href={first.href} size="lg">
                  {t.startReading}
                </Button>
              </div>
            )}
            <div className="mt-10 max-w-xl">
              <DetailList
                items={[
                  { label: t.chapters, value: series.chapters.length },
                  { label: t.started, value: date(series.date) },
                  { label: t.updated, value: date(series.updated) },
                  ...(series.aiTools.length > 0
                    ? [{ label: t.madeWith, value: series.aiTools.join(", ") }]
                    : []),
                ]}
              />
            </div>
            <TagList tags={series.tags} className="mt-6" />
          </div>
        </div>

        <section aria-labelledby="chapters-title" className="mt-16 lg:mt-24">
          <h2 id="chapters-title" className="font-display text-display-sm">
            {t.chapters}
          </h2>
          {series.chapters.length === 0 ? (
            <p className="mt-6 text-paper-muted">{t.noChapter}</p>
          ) : (
            <ol className="mt-8 divide-y divide-ink-700 border-y border-ink-700">
              {series.chapters.map((chapter) => (
                <li key={chapter.slug}>
                  <Link
                    href={chapter.href}
                    className="group flex items-center gap-4 py-4 transition-colors hover:bg-ink-900 sm:gap-6 sm:px-3"
                  >
                    <span className="relative block h-20 w-15 shrink-0 overflow-hidden border border-ink-600 bg-ink-800">
                      <Image
                        src={chapter.pages[0].image}
                        alt=""
                        fill
                        sizes="60px"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </span>
                    <span className="w-12 shrink-0 font-display text-2xl text-accent">
                      <span className="sr-only">{t.chapter(chapter.number)}</span>
                      <span aria-hidden="true">{String(chapter.number).padStart(2, "0")}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg group-hover:text-accent">
                        {chapter.title}
                      </span>
                      {chapter.summary && (
                        <span className="mt-1 block text-sm text-paper-muted">{chapter.summary}</span>
                      )}
                      <span className="mt-1 block text-xs uppercase tracking-wider text-paper-faint">
                        {date(chapter.date)} · {t.pageCount(chapter.pages.length)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-paper-faint group-hover:text-accent sm:flex">
                      Read <span aria-hidden="true" className="font-display text-xl">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </Container>
    </article>
  );
}
